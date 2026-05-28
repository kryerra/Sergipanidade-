/**
 * Componente RoteiroVazio
 * Exibido quando o usuário não possui nenhum roteiro planejado.
 * Estilo clássico original restaurado com leves melhorias de hierarquia visual.
 */

import { MapPin, Bot, Sparkles, Compass } from "lucide-react";
import { translations } from "@/constants/translations";

interface RoteiroVazioProps {
  onCreateWithAI: () => void;
  onExploreDestinations: () => void;
  language: "pt" | "en" | "es";
}

export function RoteiroVazio({
  onCreateWithAI,
  onExploreDestinations,
  language,
}: RoteiroVazioProps) {
  const t = translations[language];

  return (
    <div className="max-w-xl mx-auto px-4 py-16 flex flex-col items-center text-center">
      {/* Círculo do MapPin - Areia clássico com ícone Teal */}
      <div className="w-24 h-24 rounded-full bg-[var(--secondary)] flex items-center justify-center mb-6 text-4xl shadow-sm border border-[var(--cinza-borda)]/25">
        <MapPin size={32} className="text-[var(--primary)]" />
      </div>

      <h1 className="font-['Fjalla_One'] text-3xl text-[var(--preto)] mb-3 leading-tight">
        {t.emptyItinerary}
      </h1>
      <p className="text-[var(--cinza-txt)] text-sm mb-8 max-w-sm leading-relaxed">
        {t.emptyItineraryMessage}
      </p>

      {/* CTA Card - Grafite escuro clássico original */}
      <div className="w-full bg-gradient-to-br from-[var(--preto)] to-[#2A2A2E] rounded-[var(--radius)] p-7 text-left mb-6 shadow-[var(--sombra-lg)] relative overflow-hidden">
        {/* Detalhe de luz sutil no canto */}
        <div 
          className="absolute -top-12 -right-12 w-24 h-24 rounded-full opacity-10 blur-xl pointer-events-none"
          style={{ background: "var(--primary)" }}
        />

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center shrink-0 shadow-md">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <p className="font-['Fjalla_One'] text-white text-lg tracking-wide leading-tight">
              {t.aiItineraryTitle}
            </p>
            <p className="text-white/60 text-xs mt-0.5">{t.aiItineraryDesc}</p>
          </div>
        </div>
        
        <p className="text-white/70 text-sm leading-relaxed mb-6">
          {language === "pt"
            ? "Responda 4 perguntas rápidas e nossa IA cria o roteiro ideal para você em Sergipe."
            : language === "en"
              ? "Answer 4 quick questions and our AI creates the ideal itinerary for you in Sergipe."
              : "Responde 4 preguntas rápidas y nuestra IA crea el itinerario ideal para ti en Sergipe."}
        </p>

        <button
          onClick={onCreateWithAI}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-[var(--primary)] text-white rounded-[var(--radius-sm)] font-bold text-sm hover:bg-[#0A5D61] active:scale-[0.99] transition-all min-h-[46px] shadow-md cursor-pointer border-none"
        >
          <Sparkles size={16} />
          {t.generateWithAI}
        </button>
      </div>

      {/* Botão Explorar Destinos - Botão Primário Sólido */}
      <button
        onClick={onExploreDestinations}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-[var(--primary)] text-white rounded-[var(--radius-sm)] font-bold text-sm hover:bg-[#0A5D61] active:scale-[0.99] transition-all min-h-[46px] mb-3 shadow-sm cursor-pointer border-none"
      >
        <Compass size={16} />
        {t.exploreDestinations}
      </button>

      {/* Botão Roteiro Manual - Botão Outline Secundário sutil para corrigir hierarquia */}
      <button
        onClick={onExploreDestinations}
        className="w-full py-2.5 rounded-[var(--radius-sm)] font-semibold text-[13px] transition-all min-h-[40px] cursor-pointer"
        style={{
          background: "transparent",
          border: "2px solid rgba(13,115,119,0.35)",
          color: "var(--primary)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "var(--teal-leve)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--primary)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(13,115,119,0.35)";
        }}
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
