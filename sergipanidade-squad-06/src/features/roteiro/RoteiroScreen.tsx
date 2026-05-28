import { useState, useEffect, useRef } from "react";
import { translations } from "@/constants/translations";
import { ParadaGerada, WizardData, RoteiroItem } from "@/types";
import { gerarRoteiroComIAComFallback } from "@/services/itinerary.service";
import { RoteiroVazio } from "@/features/roteiro/components/RoteiroVazio";
import { RoteiroGerando } from "@/features/roteiro/components/RoteiroGerando";
import { FundoVisual } from "@/features/roteiro/components/FundoVisual";
import { RoteiroAssistente } from "@/features/roteiro/components/RoteiroAssistente";
import { RoteiroCronograma } from "@/features/roteiro/components/RoteiroCronograma";

interface RoteiroScreenProps {
  onNavigate: (tela: string, idDestino?: string) => void;
  onToast: (mensagem: string) => void;
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
  onToast,
  roteiro,
  onAddToRoteiro,
  onRemoveFromRoteiro,
  onSetRoteiro,
  onOpenGPS,
  language,
}: RoteiroScreenProps) {
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
    startDate: new Date().toISOString().slice(0, 10),
    interests: [],
    budget: "",
  });
  
  const [paradasGeradas, setParadasGeradas] = useState<ParadaGerada[]>([]);
  const [diasAbertos, setDiasAbertos] = useState<string[]>(["day-1"]);
  const refMontado = useRef(true);

  // Sincroniza a tela caso o roteiro seja alterado externamente
  useEffect(() => {
    if (roteiro.length > 0 && estadoVisual === "empty") {
      setEstadoVisual("view");
    }
  }, [roteiro.length, estadoVisual]);

  // Marca o componente como desmontado para evitar atualizações de estado assíncronas após navegação
  useEffect(() => {
    refMontado.current = true;
    return () => {
      refMontado.current = false;
    };
  }, []);

  /**
   * Dispara a requisição assíncrona para gerar o roteiro e configura a resposta.
   */
  const gerarRoteiro = async () => {
    setEstadoVisual("generating");
    const tempoInicio = Date.now();
    
    try {
      const { paradas, isAI } = await gerarRoteiroComIAComFallback(
        dadosWizard,
        language,
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

      const mensagemSucesso = isAI
        ? language === "pt"
          ? "✨ Roteiro gerado com Inteligência Artificial!"
          : language === "es"
            ? "✨ ¡Itinerario generado con Inteligencia Artificial!"
            : "✨ Itinerary generated with Artificial Intelligence!"
        : t.itineraryGenerated;

      onToast(mensagemSucesso);
      setEstadoVisual("view");
    } catch (erro) {
      if (!refMontado.current) return;
      if (import.meta.env.DEV) {
        console.error("[DEV] Erro inesperado em gerarRoteiro:", erro);
      }
      onToast(
        language === "pt"
          ? "Erro ao gerar roteiro. Tente novamente."
          : language === "es"
            ? "Error al generar itinerario. Inténtalo de nuevo."
            : "Error generating itinerary. Please try again.",
      );
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
        <RoteiroGerando language={language} />
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
