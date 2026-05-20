/**
 * RoteiroEmpty Component
 * Displayed when the user has no planned itinerary
 * Prompts user to create one with AI or manual approach
 */

import { MapPin, Bot } from "lucide-react";
import { translations } from "@/constants/translations";

interface RoteiroEmptyProps {
  onCreateWithAI: () => void;
  onExploreDestinations: () => void;
  language: "pt" | "en" | "es";
}

export function RoteiroEmpty({
  onCreateWithAI,
  onExploreDestinations,
  language,
}: RoteiroEmptyProps) {
  const t = translations[language];

  return (
    <div className="max-w-xl mx-auto px-4 py-16 flex flex-col items-center text-center">
      <div className="w-24 h-24 rounded-full bg-[var(--secondary)] flex items-center justify-center mb-6 text-4xl">
        <MapPin size={24} style={{ color: "#0D7377" }} />
      </div>
      <h1 className="font-['Fjalla_One'] text-3xl text-[var(--preto)] mb-3">
        {t.emptyItinerary}
      </h1>
      <p className="text-[var(--cinza-txt)] text-sm mb-8 max-w-sm leading-relaxed">
        {t.emptyItineraryMessage}
      </p>

      {/* CTA Card */}
      <div className="w-full bg-gradient-to-br from-[var(--preto)] to-[#2A2A2E] rounded-[var(--radius)] p-7 text-left mb-6 shadow-[var(--sombra-lg)]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <p className="font-['Fjalla_One'] text-white text-lg">
              {t.aiItineraryTitle}
            </p>
            <p className="text-white/60 text-xs">{t.aiItineraryDesc}</p>
          </div>
        </div>
        <p className="text-white/70 text-sm leading-relaxed mb-5">
          {language === "pt"
            ? "Responda 4 perguntas rápidas e nossa IA cria o roteiro ideal para você em Sergipe."
            : language === "en"
              ? "Answer 4 quick questions and our AI creates the ideal itinerary for you in Sergipe."
              : "Responde 4 preguntas rápidas y nuestra IA crea el itinerario ideal para ti en Sergipe."}
        </p>
        <button
          onClick={onCreateWithAI}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#006064] text-white rounded-[var(--radius-sm)] font-bold text-sm hover:bg-[#004D51] transition-colors min-h-[44px]"
        >
          <span style={{ filter: "brightness(0) invert(1)" }}>✨</span>
          {t.generateWithAI}
        </button>
      </div>

      <button
        onClick={onExploreDestinations}
        className="w-full py-3.5 bg-[#006064] text-white rounded-[var(--radius-sm)] font-bold text-sm hover:bg-[#004D51] transition-colors min-h-[44px] mb-3"
      >
        {t.exploreDestinations}
      </button>

      <button
        onClick={onExploreDestinations}
        className="w-full py-2.5 bg-[#006064] text-white rounded-[var(--radius-sm)] font-medium text-[13px] hover:bg-[#004D51] transition-colors min-h-[40px]"
      >
        {language === "pt"
          ? "CRIAR ROTEIRO MANUAL"
          : language === "en"
            ? "CREATE MANUAL ITINERARY"
            : "CREAR ITINERARIO MANUAL"}
      </button>
    </div>
  );
}
