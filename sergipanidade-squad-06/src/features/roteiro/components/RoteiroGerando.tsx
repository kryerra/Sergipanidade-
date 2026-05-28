import { Bot, MapPin, Lightbulb, Sparkles } from "lucide-react";
import { translations } from "@/constants/translations";

interface RoteiroGerandoProps {
  language: "pt" | "en" | "es";
}

export function RoteiroGerando({ language }: RoteiroGerandoProps) {
  const t = translations[language];

  const steps = [
    {
      icon: <MapPin size={14} />,
      label:
        language === "pt"
          ? "Mapeando pontos de interesse…"
          : language === "es"
            ? "Mapeando puntos de interés…"
            : "Mapping points of interest…",
    },
    {
      icon: <Sparkles size={14} />,
      label:
        language === "pt"
          ? "Organizando paradas por proximidade…"
          : language === "es"
            ? "Organizando paradas por proximidad…"
            : "Organizing stops by proximity…",
    },
    {
      icon: <Lightbulb size={14} />,
      label:
        language === "pt"
          ? "Adicionando dicas exclusivas…"
          : language === "es"
            ? "Agregando consejos exclusivos…"
            : "Adding exclusive tips…",
    },
  ];

  return (
    <div className="flex flex-col items-center text-center px-6 max-w-sm mx-auto mt-16">

      {/* Avatar do Bot com anéis pulsantes */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Anel externo duplo pulsante */}
        <div
          className="absolute w-36 h-36 rounded-full opacity-15 animate-ping"
          style={{ background: "radial-gradient(circle, #0D7377, transparent)" }}
        />
        <div
          className="absolute w-28 h-28 rounded-full opacity-20"
          style={{
            background: "transparent",
            border: "2px solid rgba(13,115,119,0.4)",
            animation: "spin 8s linear infinite",
          }}
        />
        {/* Anel interno */}
        <div
          className="absolute w-32 h-32 rounded-full"
          style={{
            background: "rgba(13,115,119,0.06)",
            border: "1px solid rgba(13,115,119,0.15)",
          }}
        />
        {/* Avatar */}
        <div
          className="relative w-24 h-24 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #0D7377 0%, #14544A 100%)",
            boxShadow:
              "0 0 0 4px rgba(13,115,119,0.15), 0 8px 32px rgba(13,115,119,0.4)",
          }}
        >
          <Bot size={38} className="text-white" />
        </div>
      </div>

      <h2 className="font-['Fjalla_One'] text-2xl text-[var(--preto)] mb-2">
        {t.aiItineraryTitle}
      </h2>
      <p className="text-[var(--cinza-txt)] text-sm mb-8 leading-relaxed">
        {t.timelineGeneratingMsg}
      </p>

      {/* Barra de progresso indeterminada com shimmer */}
      <div
        className="w-full h-1.5 rounded-full mb-8 overflow-hidden"
        style={{ background: "var(--cinza-leve)" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, transparent, #0D7377, #E9D8B4, #0D7377, transparent)",
            backgroundSize: "200% 100%",
            animation: "shimmer 2s ease infinite",
          }}
        />
      </div>

      {/* Steps sequenciais */}
      <div className="w-full space-y-3">
        {steps.map((step, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-sm)] text-sm text-left"
            style={{
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(13,115,119,0.12)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              opacity: 0,
              animation: `fadeInUp 0.5s ease ${0.4 + i * 0.6}s both`,
            }}
          >
            {/* Ícone do step */}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: "rgba(13,115,119,0.1)",
                color: "var(--primary)",
              }}
            >
              {step.icon}
            </div>
            <span
              className="flex-1 font-medium text-[var(--preto)]"
              style={{ fontSize: "13px" }}
            >
              {step.label}
            </span>
            {/* Spinner ou check */}
            <div
              className="w-4 h-4 rounded-full border-2 shrink-0"
              style={{
                borderColor: "rgba(13,115,119,0.3) rgba(13,115,119,0.3) rgba(13,115,119,0.3) var(--primary)",
                animation: `spin 1s linear ${0.4 + i * 0.6}s infinite`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Dots animados */}
      <div className="flex justify-center gap-2 mt-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              background: "var(--primary)",
              animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
