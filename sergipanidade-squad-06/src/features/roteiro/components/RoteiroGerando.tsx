import { useState, useEffect, useRef } from "react";
import { Bot, MapPin, Sparkles, Clock } from "lucide-react";
import { translations } from "@/constants/translations";
import { TIMEOUT_IA_MS } from "@/services/itinerary.service";

interface RoteiroGerandoProps {
  language: "pt" | "en" | "es";
  concluido?: boolean;
  onAnimacaoConcluida?: () => void;
}

const MENSAGENS_ROTATIVAS: Record<"pt" | "en" | "es", string[]> = {
  pt: [
    "Analisando seus interesses…",
    "Selecionando os melhores pontos turísticos…",
    "Calculando o melhor percurso…",
    "Personalizando dicas para você…",
    "Quase pronto!",
  ],
  en: [
    "Analyzing your interests…",
    "Selecting the best tourist spots…",
    "Calculating the best route…",
    "Personalizing tips for you…",
    "Almost ready!",
  ],
  es: [
    "Analizando tus intereses…",
    "Seleccionando los mejores puntos turísticos…",
    "Calculando la mejor ruta…",
    "Personalizando consejos para ti…",
    "¡Casi listo!",
  ],
};

const STEPS: Record<"pt" | "en" | "es", { icon: typeof MapPin; label: string }[]> = {
  pt: [
    { icon: Sparkles, label: "Consultando inteligência artificial" },
    { icon: MapPin,   label: "Mapeando pontos turísticos" },
    { icon: Clock,    label: "Organizando a timeline do roteiro" },
  ],
  en: [
    { icon: Sparkles, label: "Consulting artificial intelligence" },
    { icon: MapPin,   label: "Mapping tourist attractions" },
    { icon: Clock,    label: "Organizing the itinerary timeline" },
  ],
  es: [
    { icon: Sparkles, label: "Consultando inteligencia artificial" },
    { icon: MapPin,   label: "Mapeando puntos turísticos" },
    { icon: Clock,    label: "Organizando la línea de tiempo" },
  ],
};

/** Duração total simulada até atingir 90% (em ms) — alinhada ao timeout da IA */
const PROGRESS_DURATION_MS = TIMEOUT_IA_MS - 1000;

export function RoteiroGerando({ language, concluido, onAnimacaoConcluida }: RoteiroGerandoProps) {
  const t = translations[language];
  const mensagens = MENSAGENS_ROTATIVAS[language];
  const steps = STEPS[language];

  const [indiceMensagem, setIndiceMensagem] = useState(0);
  const [stepAtivo, setStepAtivo] = useState(0);
  /** Progresso real de 0 a 100. Avança automaticamente até 90% e vai a 100% ao concluir */
  const [progresso, setProgresso] = useState(0);
  const rafRef = useRef<number | null>(null);
  const inicioRef = useRef<number | null>(null);

  /* ── Efeito para forçar 100% ao concluir e chamar callback ── */
  useEffect(() => {
    if (concluido) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setProgresso(100);

      const t = setTimeout(() => {
        if (onAnimacaoConcluida) {
          onAnimacaoConcluida();
        }
      }, 350);

      return () => clearTimeout(t);
    }
  }, [concluido, onAnimacaoConcluida]);

  /* ── Barra de progresso simulada ── */
  useEffect(() => {
    const animar = (timestamp: number) => {
      if (inicioRef.current === null) inicioRef.current = timestamp;
      const decorrido = timestamp - inicioRef.current;

      // Curva easeOut: cresce rápido no início e desacelera ao se aproximar de 90%
      const frac = Math.min(decorrido / PROGRESS_DURATION_MS, 1);
      const eased = 1 - Math.pow(1 - frac, 3); // cubic easeOut
      const valorAtual = Math.round(eased * 90);

      setProgresso(valorAtual);

      if (frac < 1) {
        rafRef.current = requestAnimationFrame(animar);
      }
    };

    rafRef.current = requestAnimationFrame(animar);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  /* ── Mensagens rotativas ── */
  useEffect(() => {
    const intervaloMsg = setInterval(() => {
      setIndiceMensagem((prev) => (prev + 1) % mensagens.length);
    }, 2200);
    return () => clearInterval(intervaloMsg);
  }, [mensagens.length]);

  /* ── Steps ativos ── */
  useEffect(() => {
    const intervaloStep = setInterval(() => {
      setStepAtivo((prev) => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(intervaloStep);
  }, [steps.length]);

  return (
    <div
      className="flex flex-col items-center justify-center text-center px-6 max-w-sm mx-auto my-auto min-h-[75vh]"
      style={{ animation: "fadeScale 0.45s cubic-bezier(0.34,1.56,0.64,1) both" }}
    >

      {/* Avatar com anéis pulsantes */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Anel externo */}
        <div
          className="absolute rounded-full"
          style={{
            width: "112px",
            height: "112px",
            border: "2px solid rgba(13,115,119,0.25)",
            animation: "pulseRing 2s ease-out infinite",
          }}
        />
        {/* Anel médio */}
        <div
          className="absolute rounded-full"
          style={{
            width: "96px",
            height: "96px",
            border: "2px solid rgba(13,115,119,0.35)",
            animation: "pulseRing 2s ease-out infinite 0.4s",
          }}
        />
        {/* Avatar principal */}
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #0D7377 0%, #14544A 100%)",
            boxShadow: "0 0 0 4px rgba(13,115,119,0.15), 0 8px 32px rgba(13,115,119,0.4)",
            animation: "avatarFloat 3s ease-in-out infinite",
          }}
        >
          <Bot size={38} className="text-white" />
        </div>
      </div>

      {/* Título */}
      <h2 className="font-['Fjalla_One'] text-2xl text-[var(--preto)] mb-2">
        {t.aiItineraryTitle}
      </h2>

      {/* Mensagem rotativa com fade suave */}
      <p
        key={indiceMensagem}
        className="text-[var(--cinza-txt)] text-sm mb-6 leading-relaxed"
        style={{
          minHeight: "1.5em",
          animation: "fadeSlideMsg 0.45s cubic-bezier(0.25,0.46,0.45,0.94) both",
        }}
      >
        {mensagens[indiceMensagem]}
      </p>

      {/* Barra de progresso simulada */}
      <div
        className="w-full mb-2 rounded-full overflow-hidden"
        style={{ height: "6px", background: "var(--cinza-leve)" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${progresso}%`,
            background: "linear-gradient(90deg, #0D7377, #14544A)",
            transition: "width 0.25s ease-out",
            boxShadow: progresso > 5 ? "0 0 8px rgba(13,115,119,0.5)" : "none",
          }}
        />
      </div>
      <p
        className="text-[10px] font-bold mb-6 tabular-nums"
        style={{ color: "var(--primary)", opacity: 0.7 }}
      >
        {progresso}%
      </p>

      {/* Steps com fadeInUp sequencial */}
      <div className="flex flex-col w-full gap-3 mb-6">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isAtivo = stepAtivo === i;
          return (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-500"
              style={{
                background: isAtivo
                  ? "linear-gradient(135deg, rgba(13,115,119,0.12), rgba(20,84,74,0.08))"
                  : "var(--cinza-leve)",
                border: isAtivo
                  ? "1.5px solid rgba(13,115,119,0.3)"
                  : "1.5px solid transparent",
                animation: `fadeInUp 0.5s ease-out both`,
                animationDelay: `${i * 0.15}s`,
                transform: isAtivo ? "scale(1.02)" : "scale(1)",
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: isAtivo
                    ? "linear-gradient(135deg, #0D7377, #14544A)"
                    : "rgba(0,0,0,0.06)",
                  transition: "background 0.4s ease",
                }}
              >
                <Icon
                  size={14}
                  style={{ color: isAtivo ? "#fff" : "var(--cinza-txt)" }}
                />
              </div>
              <span
                className="text-xs font-medium"
                style={{
                  color: isAtivo ? "var(--primary, #0D7377)" : "var(--cinza-txt)",
                  transition: "color 0.4s ease",
                }}
              >
                {step.label}
              </span>
              {isAtivo && (
                <div className="ml-auto flex gap-1">
                  {[0, 1, 2].map((d) => (
                    <div
                      key={d}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: "#0D7377",
                        animation: "bounce 1.2s ease-in-out infinite",
                        animationDelay: `${d * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>



      <style>{`
        @keyframes fadeScale {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeSlideMsg {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseRing {
          0%   { transform: scale(0.95); opacity: 0.6; }
          50%  { transform: scale(1.05); opacity: 0.2; }
          100% { transform: scale(0.95); opacity: 0.6; }
        }
        @keyframes avatarFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-4px); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-4px); }
        }
        @keyframes skeletonPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
