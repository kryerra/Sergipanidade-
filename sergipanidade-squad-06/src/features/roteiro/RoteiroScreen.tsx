import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/context/AppContext";
import { translations } from "@/constants/translations";
import { ParadaGerada, WizardData, RoteiroItem } from "@/types";
import { gerarRoteiroComIAComFallback } from "@/services/itinerary.service";
import { RoteiroVazio } from "@/features/roteiro/components/RoteiroVazio";
import { RoteiroGerando } from "@/features/roteiro/components/RoteiroGerando";
import { FundoVisual } from "@/features/roteiro/components/FundoVisual";
import { RoteiroAssistente } from "@/features/roteiro/components/RoteiroAssistente";
import { RoteiroCronograma } from "@/features/roteiro/components/RoteiroCronograma";

const obterDataLocalHoje = (): string => {
  const d = new Date();
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
};

interface RoteiroScreenProps {
  onNavigate: (tela: string, idDestino?: string) => void;
  roteiro: RoteiroItem[];
  onAddToRoteiro: (idDestino: string, nota?: string) => void;
  onRemoveFromRoteiro: (idDestino: string) => void;
  onSetRoteiro?: (roteiro: RoteiroItem[]) => void;
  onOpenGPS: (idDestino?: string) => void;
  language: "pt" | "en" | "es";
}

/**
 * Componente Controlador da Tela de Roteiro (RoteiroScreen)
 * Orquestra as etapas de criação do wizard, telas de carregamento, e visualização da timeline cronológica.
 */
export function RoteiroScreen({
  onNavigate,
  roteiro,
  onAddToRoteiro,
  onRemoveFromRoteiro,
  onSetRoteiro,
  onOpenGPS,
  language,
}: RoteiroScreenProps) {
  const { toast: onToast } = useToast();
  const t = translations[language];

  // Definição dos estados possíveis de tela
  type EstadoVisual = "empty" | "wizard" | "generating" | "view";
  
  const [estadoVisual, setEstadoVisual] = useState<EstadoVisual>(() =>
    roteiro.length > 0 ? "view" : "empty",
  );
  
  const [etapaWizard, setEtapaWizard] = useState(0);
  const [dadosWizard, setDadosWizard] = useState<WizardData>({
    who: "",
    days: 3,
    startDate: obterDataLocalHoje(),
    interests: [],
    budget: "",
    stopsPerDay: 3, // Tarefa 7: valor padrão recomendado
  });
  
  const [paradasGeradas, setParadasGeradas] = useState<ParadaGerada[]>([]);
  const [isAI, setIsAI] = useState(false);
  const [diasAbertos, setDiasAbertos] = useState<string[]>(["day-1"]);
  const [geracaoConcluida, setGeracaoConcluida] = useState(false);
  const refMontado = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);

  // Carrega do cache de sessão ao montar para persistir o estado visual correto de IA / Offline
  useEffect(() => {
    if (roteiro.length > 0) {
      try {
        const prefixoCache = "sergipanidade_roteiro_";
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && key.startsWith(prefixoCache)) {
            const cacheHit = sessionStorage.getItem(key);
            if (cacheHit) {
              const parsed = JSON.parse(cacheHit);
              if (parsed && typeof parsed === "object") {
                if (Array.isArray(parsed)) {
                  setParadasGeradas(parsed);
                  setIsAI(true);
                } else if (Array.isArray(parsed.paradas)) {
                  setParadasGeradas(parsed.paradas);
                  setIsAI(!!parsed.isAI);
                }
                break;
              }
            }
          }
        }
      } catch {}
    }
  }, [roteiro.length]);

  // Sincroniza a tela caso o roteiro seja alterado externamente ou esvaziado
  useEffect(() => {
    if (roteiro.length > 0 && estadoVisual === "empty") {
      setEstadoVisual("view");
    } else if (roteiro.length === 0 && estadoVisual === "view") {
      setEstadoVisual("empty");
    }
  }, [roteiro.length, estadoVisual]);

  // Marca o componente como desmontado para evitar atualizações de estado assíncronas após navegação e aborta requisições
  useEffect(() => {
    refMontado.current = true;
    return () => {
      refMontado.current = false;
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);

  const handleGeracaoConcluida = useCallback(() => {
    if (!refMontado.current) return;
    onToast(t.itineraryGenerated);
    setEstadoVisual("view");
  }, [onToast, t.itineraryGenerated]);

  /**
   * Dispara a requisição assíncrona para gerar o roteiro e configura a resposta.
   */
  const gerarRoteiro = async () => {
    setEstadoVisual("generating");
    setGeracaoConcluida(false);
    const tempoInicio = Date.now();
    
    // Aborta qualquer requisição anterior ativa
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    controllerRef.current = new AbortController();
    
    try {
      const { paradas, isAI: respostaVindaDeIA } = await gerarRoteiroComIAComFallback(
        dadosWizard,
        language,
        controllerRef.current.signal
      );

      // Garante uma exibição mínima da animação para evitar flashes visuais abruptos
      const tempoDecorrido = Date.now() - tempoInicio;
      const atrasoRestante = Math.max(0, 500 - tempoDecorrido);
      if (atrasoRestante > 0) {
        await new Promise<void>((resolve) =>
          setTimeout(resolve, atrasoRestante),
        );
      }

      // Evita atualizar estados se o usuário saiu da tela enquanto a requisição rodava
      if (!refMontado.current) return;

      setParadasGeradas(paradas);
      setIsAI(respostaVindaDeIA);
      
      const novoRoteiro = paradas.map((p) => ({
        destinationId: p.destinationId,
        note: p.dica,
      }));

      if (onSetRoteiro) {
        onSetRoteiro(novoRoteiro);
      } else {
        novoRoteiro.forEach((r) => onAddToRoteiro(r.destinationId, r.note));
      }

      setDiasAbertos(Array.from(new Set(paradas.map((p) => `day-${p.dia}`))));

      setGeracaoConcluida(true);
    } catch (erro: any) {
      // Ignora erro se a requisição foi cancelada intencionalmente
      if (erro.name === "AbortError" || erro.message === "Request aborted") {
        return;
      }
      
      if (!refMontado.current) return;
      if (import.meta.env.DEV) {
        console.error("[DEV] Erro inesperado em gerarRoteiro:", erro);
      }
      onToast(t.itineraryError);
      setEstadoVisual("empty");
    }
  };

  /* ════════════════════════════════════════════
     RENDERIZAÇÃO: TELA INICIAL VAZIA
  ═══════════════════════════════════════════ */
  if (estadoVisual === "empty") {
    return (
      <FundoVisual className="pt-[62px]">
        <RoteiroVazio
          onCreateWithAI={() => {
            setEtapaWizard(0);
            setEstadoVisual("wizard");
          }}
          onExploreDestinations={() => onNavigate("guia")}
          language={language}
        />
      </FundoVisual>
    );
  }

  /* ════════════════════════════════════════════
     RENDERIZAÇÃO: TELA DE ANIMAÇÃO / CARREGAMENTO
  ═══════════════════════════════════════════ */
  if (estadoVisual === "generating") {
    return (
      <FundoVisual className="pt-[62px] flex items-center justify-center">
        <RoteiroGerando
          language={language}
          concluido={geracaoConcluida}
          onAnimacaoConcluida={handleGeracaoConcluida}
        />
      </FundoVisual>
    );
  }

  /* ════════════════════════════════════════════
     RENDERIZAÇÃO: QUESTIONÁRIO / WIZARD
  ════════════════════════════════════════════ */
  if (estadoVisual === "wizard") {
    return (
      <RoteiroAssistente
        t={t}
        language={language}
        wizardStep={etapaWizard}
        setWizardStep={setEtapaWizard}
        wizardData={dadosWizard}
        setWizardData={setDadosWizard}
        onCancel={() => setEstadoVisual("empty")}
        onGenerate={gerarRoteiro}
      />
    );
  }

  /* ════════════════════════════════════════════
     RENDERIZAÇÃO: CRONOGRAMA / TIMELINE
  ════════════════════════════════════════════ */
  return (
    <RoteiroCronograma
      t={t}
      language={language}
      roteiro={roteiro}
      wizardData={dadosWizard}
      generatedParadas={paradasGeradas}
      isAI={isAI}
      onNavigate={onNavigate}
      onToast={onToast}
      onRemoveFromRoteiro={onRemoveFromRoteiro}
      onOpenGPS={onOpenGPS}
      onRegenerate={() => {
        setEtapaWizard(0);
        setEstadoVisual("wizard");
      }}
      openDays={diasAbertos}
      setOpenDays={setDiasAbertos}
    />
  );
}
