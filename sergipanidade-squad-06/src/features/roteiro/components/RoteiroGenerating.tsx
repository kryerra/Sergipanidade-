import { Bot } from "lucide-react";
import { translations } from "@/constants/translations";

interface RoteiroGeneratingProps {
  language: "pt" | "en" | "es";
}

export function RoteiroGenerating({ language }: RoteiroGeneratingProps) {
  const t = translations[language];

  return (
    <div className="flex flex-col items-center text-center px-6 max-w-sm mx-auto mt-20">
      <div className="relative w-24 h-24 mb-7">
        <div className="absolute inset-0 rounded-full bg-[var(--secondary)] animate-ping opacity-40" />
        <div className="relative w-24 h-24 rounded-full bg-[var(--primary)] flex items-center justify-center text-4xl shadow-lg">
          <Bot size={36} className="text-white" />
        </div>
      </div>
      <h2 className="font-['Fjalla_One'] text-2xl text-[var(--preto)] mb-3">
        {t.aiItineraryTitle}
      </h2>
      <p className="text-[var(--cinza-txt)] text-sm mb-6 leading-relaxed">
        {t.timelineGeneratingMsg}
      </p>

      <div className="flex justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]"
            style={{
              animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      <style>
        {`@keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-10px); } }`}
      </style>

      <div className="mt-8 text-left space-y-2">
        {[
          language === "pt"
            ? "Mapeando pontos de interesse…"
            : language === "es"
              ? "Mapeando puntos de interés…"
              : "Mapping points of interest…",
          language === "pt"
            ? "Organizando paradas por proximidade…"
            : language === "es"
              ? "Organizando paradas por proximidad…"
              : "Organizing stops by proximity…",
          language === "pt"
            ? "Adicionando dicas exclusivas…"
            : language === "es"
              ? "Agregando consejos exclusivos…"
              : "Adding exclusive tips…",
        ].map((msg, i) => (
          <div
            key={i}
            className="flex items-center gap-3 text-sm text-[var(--cinza-txt)] bg-[var(--cinza-leve)] px-4 py-2.5 rounded-[var(--radius-sm)]"
            style={{
              opacity: 1,
              animation: `fadeIn 0.5s ease ${0.4 + i * 0.5}s both`,
            }}
          >
            <span>{msg}</span>
          </div>
        ))}
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
