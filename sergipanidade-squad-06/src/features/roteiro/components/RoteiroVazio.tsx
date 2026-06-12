/**
 * Componente RoteiroVazio
 * Exibido quando o usuário não possui nenhum roteiro planejado.
 * Estilo clássico original restaurado com leves melhorias de hierarquia visual.
 */

import { MapPin, Sparkles, Compass } from "lucide-react";
import { translations } from "@/constants/translations";
import serginhoImg from "@/assets/images/serginho.png";

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
    <div className="max-w-md mx-auto px-8 py-9 flex flex-col items-center text-center bg-white/85 backdrop-blur-md rounded-[var(--radius)] border border-white/60 shadow-2xl mt-12 mb-16 animate-cronogramaFadeInUp">
      {/* Círculo do MapPin - Areia clássico com ícone Teal */}
      <div className="w-20 h-20 rounded-full bg-[var(--secondary)] flex items-center justify-center mb-5 shadow-lg border-4 border-white transition-transform duration-300 hover:scale-105">
        <MapPin size={26} className="text-[var(--primary)]" />
      </div>

      <h1 className="font-semibold font-display tracking-tight text-2xl sm:text-3xl text-[var(--preto)] mb-2 leading-tight uppercase">
        {t.emptyItinerary}
      </h1>
      <p className="text-[var(--cinza-txt)] text-xs sm:text-sm mb-8 max-w-xs leading-relaxed font-medium">
        {t.emptyItineraryMessage}
      </p>

      {/* CTA Card - Grafite escuro clássico original com degradê premium de slate/navy */}
      <div className="w-full bg-gradient-to-br from-[#1A252C] to-[#0F172A] rounded-[var(--radius)] p-6 text-left mb-6 shadow-xl relative overflow-hidden border border-white/10">
        {/* Detalhe de luz sutil no canto */}
        <div 
          className="absolute -top-12 -right-12 w-24 h-24 rounded-full opacity-15 blur-xl pointer-events-none"
          style={{ background: "var(--primary)" }}
        />

        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--primary)] to-teal-400 flex items-center justify-center shrink-0 shadow-md overflow-hidden">
            <img src={serginhoImg} alt="Serginho" className="w-[28px] h-[28px] object-contain animate-pulse" />
          </div>
          <p className="font-semibold font-display text-white text-lg tracking-tight leading-tight">
            {t.aiItineraryTitle}
          </p>
        </div>
        
        <p className="text-white/80 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
          {t.aiItineraryDesc}
        </p>

        <button
          onClick={onCreateWithAI}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#0D7377] to-[#14544A] text-white rounded-[var(--radius-sm)] font-bold text-xs sm:text-sm hover:from-[#115E59] hover:to-[#0D5C54] active:scale-[0.99] transition-all min-h-[46px] shadow-lg shadow-[var(--primary)]/20 cursor-pointer border-none"
        >
          <Sparkles size={14} />
          {t.generateWithAI}
        </button>
      </div>

      {/* Botão Explorar Destinos (Estilo secundário Outline) */}
      <button
        onClick={onExploreDestinations}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-transparent text-[var(--primary)] rounded-[var(--radius-sm)] border-2 border-[var(--primary)] font-bold text-xs sm:text-sm hover:bg-[var(--teal-leve)] active:scale-[0.99] transition-all min-h-[46px] cursor-pointer"
      >
        <Compass size={14} />
        {t.exploreDestinations}
      </button>
    </div>
  );
}
