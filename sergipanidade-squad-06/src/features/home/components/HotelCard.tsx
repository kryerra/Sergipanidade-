/**
 * HotelCard — card de hospedagem para a seção "Arrei as Malas"
 * Sergipanidade Design System v2
 * foto + categoria + nome + localização + preço + avaliação + amenidades + CTA
 */
import { MapPin, ExternalLink } from 'lucide-react';
import { ImageWithFallback } from '@/components/shared/ImageWithFallback';
import { StarRating } from '@/components/ui/StarRating';
import { useToast } from "@/context/AppContext";

interface HotelCardProps {
  id: string;
  name: string;
  category: string;
  bairro: string;
  priceLevel: number;      // 1–4  ($ $$ $$$ $$$$)
  startingPrice: string;   // ex: "R$ 280"
  rating: number;
  reviews: string;
  image: string;
  amenities: string[];
  verOpcoesLabel: string;
  apartirDeLabel: string;
  porNoiteLabel: string;
  link?: string;
}

/** Renderiza $ $ $ $ com os ativos em âmbar */
function PriceRange({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-[2px]">
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          style={{
            fontSize: '15px',
            fontWeight: 700,
            lineHeight: 1,
            color: i <= level ? '#D97706' : '#D1D5DB',
          }}
        >
          $
        </span>
      ))}
    </div>
  );
}

export function HotelCard({
  name,
  category,
  bairro,
  priceLevel,
  startingPrice,
  rating,
  reviews,
  image,
  amenities,
  verOpcoesLabel,
  apartirDeLabel,
  porNoiteLabel,
  link,
}: HotelCardProps) {
  const { toast: onToast } = useToast();
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden flex flex-col
                 shadow-[0_4px_20px_rgba(17,17,17,0.09)] border border-[rgba(17,17,17,0.06)]
                 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(17,17,17,0.15)]"
    >
      {/* — Foto — */}
      <div className="relative overflow-hidden" style={{ height: '210px' }}>
        <ImageWithFallback
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />

        {/* Badge de categoria */}
        <div className="absolute top-3 left-3">
          <span
            className="px-2.5 py-1 rounded-full text-[11px] font-bold text-white tracking-wide"
            style={{ backgroundColor: 'var(--azul)' }}
          >
            {category}
          </span>
        </div>

        {/* Preço sobre a foto — canto inferior direito */}
        <div className="absolute bottom-3 right-3 bg-black/55 backdrop-blur-sm rounded-xl px-3 py-1.5">
          <span className="text-[11px] text-white/70 block leading-none mb-0.5">{apartirDeLabel}</span>
          <span className="text-white font-bold" style={{ fontSize: '14px' }}>
            {startingPrice}
            <span className="text-white/60 text-[10px] font-normal"> {porNoiteLabel}</span>
          </span>
        </div>
      </div>

      {/* — Conteúdo — */}
      <div className="p-4 flex flex-col flex-1">
        {/* Nome */}
        <h3
          className="font-['Fjalla_One'] text-[var(--preto)] tracking-wide leading-tight mb-1.5"
          style={{ fontSize: '17px' }}
        >
          {name}
        </h3>

        {/* Localização */}
        <div className="flex items-center gap-1 mb-3">
          <MapPin size={12} className="text-[var(--azul)] shrink-0" />
          <span className="text-[12px] text-[var(--cinza-txt)]">{bairro}</span>
        </div>

        {/* Faixa de preço + Avaliação */}
        <div className="flex items-center justify-between mb-3">
          <PriceRange level={priceLevel} />
          <StarRating rating={rating} reviews={reviews} size="sm" />
        </div>

        {/* Amenidades */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {amenities.map((a) => (
            <span
              key={a}
              className="px-2 py-0.5 rounded-md text-[11px] font-medium"
              style={{
                backgroundColor: 'rgba(74,143,212,0.08)',
                color: 'var(--azul)',
              }}
            >
              {a}
            </span>
          ))}
        </div>

        {/* Botão "Ver opções" */}
        <div className="mt-auto">
          {link ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-[10px]
                         text-white font-['Fjalla_One'] text-[13px] tracking-wider uppercase
                         cursor-pointer border-none transition-all min-h-[44px]
                         hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: 'var(--azul)', textDecoration: 'none' }}
            >
              <ExternalLink size={14} strokeWidth={2.5} />
              {verOpcoesLabel}
            </a>
          ) : (
            <button
              onClick={() => onToast('Abrindo opções de hospedagem...')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-[10px]
                         text-white font-['Fjalla_One'] text-[13px] tracking-wider uppercase
                         cursor-pointer border-none transition-all min-h-[44px]
                         hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: 'var(--azul)' }}
            >
              <ExternalLink size={14} strokeWidth={2.5} />
              {verOpcoesLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}