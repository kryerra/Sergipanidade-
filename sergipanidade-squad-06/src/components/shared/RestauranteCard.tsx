/**
 * RestauranteCard — card de gastronomia para a seção "Pra Saborear"
 * Sergipanidade Design System v2
 */
import { Clock, MapPin, Utensils, Star } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import { StarRating } from "@/components/ui/StarRating";

interface RestauranteCardProps {
  id: string;
  name: string;
  culinaria: string;       // ex: "Frutos do Mar"
  especialidade: string;   // ex: "Moqueca de Sururu"
  bairro: string;
  horario: string;         // ex: "11h–23h"
  aberto: boolean;
  rating: number;
  reviews: string;
  image: string;
  destaque?: boolean;      // card em destaque tem borda laranja
  verCardapioLabel: string;
  horarioAbertoLabel: string;
  reservarMesaLabel: string;
  onToast: (msg: string) => void;
}

export function RestauranteCard({
  name,
  culinaria,
  especialidade,
  bairro,
  horario,
  aberto,
  rating,
  reviews,
  image,
  destaque = false,
  verCardapioLabel,
  horarioAbertoLabel,
  reservarMesaLabel,
  onToast,
}: RestauranteCardProps) {
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden flex flex-col
                 transition-all duration-200 hover:-translate-y-1"
      style={{
        boxShadow: destaque
          ? '0 4px 24px rgba(211,47,47,0.18), 0 0 0 2px rgba(211,47,47,0.35)'
          : '0 4px 20px rgba(17,17,17,0.09)',
        border: destaque ? '1px solid rgba(211,47,47,0.30)' : '1px solid rgba(17,17,17,0.06)',
      }}
    >
      {/* — Foto — */}
      <div className="relative overflow-hidden" style={{ height: '200px' }}>
        <ImageWithFallback
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Badge destaque */}
        {destaque && (
          <div
            className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full
                       text-[11px] font-bold text-white"
            style={{ backgroundColor: 'rgba(232,84,58,0.90)', backdropFilter: 'blur(4px)' }}
          >
            <Star size={10} className="inline mr-1" fill="currentColor" /> DESTAQUE
          </div>
        )}

        {/* Badge de culinária (no canto) */}
        {!destaque && (
          <div
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold text-white"
            style={{ backgroundColor: 'var(--vermelho)', opacity: 0.9 }}
          >
            <Utensils size={10} className="inline mr-1" strokeWidth={2.5} />
            {culinaria}
          </div>
        )}

        {/* Status aberto/fechado */}
        <div
          className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full
                     text-[11px] font-medium backdrop-blur-sm"
          style={{
            backgroundColor: aberto ? 'rgba(22,163,74,0.82)' : 'rgba(75,75,75,0.82)',
            color: 'white',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: aberto ? '#86efac' : '#d4d4d4' }}
          />
          {aberto ? horarioAbertoLabel : 'Fechado'}
        </div>
      </div>

      {/* — Conteúdo — */}
      <div className="p-4 flex flex-col flex-1">
        {/* Nome */}
        <h3
          className="font-['Fjalla_One'] text-[var(--preto)] tracking-wide leading-tight mb-1"
          style={{ fontSize: '17px' }}
        >
          {name}
        </h3>

        {/* Especialidade */}
        <p className="text-[var(--vermelho)] mb-2" style={{ fontSize: '13px', fontWeight: 600 }}>
          {especialidade}
        </p>

        {/* Rating + localização */}
        <div className="flex items-center justify-between mb-3">
          <StarRating rating={rating} reviews={reviews} size="sm" />
          <div className="flex items-center gap-1">
            <MapPin size={11} className="text-[#999] shrink-0" />
            <span className="text-[11px] text-[#999]">{bairro}</span>
          </div>
        </div>

        {/* Horário */}
        <div className="flex items-center gap-1.5 mb-4">
          <Clock size={12} className="text-[#aaa] shrink-0" />
          <span className="text-[12px] text-[#777]">{horario}</span>
        </div>

        {/* Botões — empurrados para baixo */}
        <div className="mt-auto flex gap-2">
          <button
            onClick={() => onToast(`Abrindo cardápio de ${name}...`)}
            className="flex-1 py-2.5 rounded-[10px] border-[1.5px] text-[12px] font-bold
                       cursor-pointer transition-all min-h-[44px]"
            style={{
              borderColor: 'var(--vermelho)',
              color: 'var(--vermelho)',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--vermelho)';
              (e.currentTarget as HTMLButtonElement).style.color = 'white';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--vermelho)';
            }}
          >
            {verCardapioLabel}
          </button>
          <button
            onClick={() => onToast(`Reservando mesa em ${name}...`)}
            className="flex-1 py-2.5 rounded-[10px] text-white text-[12px] font-bold border-none
                       cursor-pointer transition-all min-h-[44px] hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: 'var(--vermelho)' }}
          >
            {reservarMesaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}