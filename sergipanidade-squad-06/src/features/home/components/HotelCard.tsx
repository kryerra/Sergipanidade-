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
                 border border-[rgba(17,17,17,0.06)] cursor-pointer
                 transition-shadow duration-200 hover:shadow-md group"
    >
      {/* — Foto — */}
      <div className="relative aspect-video overflow-hidden rounded-t-xl">
        <ImageWithFallback
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
        <div className="absolute bottom-2 right-2 bg-black/65 text-white text-xs font-semibold px-2 py-1 rounded-md">
          <span className="text-[10px] text-white/80 block leading-none mb-0.5">{apartirDeLabel}</span>
          <span className="text-white font-bold text-xs">
            {startingPrice}
            <span className="text-white/80 text-[9px] font-normal"> {porNoiteLabel}</span>
          </span>
        </div>
      </div>

      {/* — Conteúdo — */}
      <div className="p-4 flex flex-col flex-1">
        {/* Nome */}
        <h3
          className="font-semibold font-display text-[var(--preto)] tracking-tight leading-tight mb-1.5"
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
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <PriceRange level={priceLevel} />
          <span className="text-gray-300 select-none">·</span>
          <StarRating rating={rating} reviews={reviews} size="sm" />
        </div>

        {/* Amenidades */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {amenities.map((a) => (
            <span
              key={a}
              className="px-2 py-0.5 rounded-md text-[11px] font-medium text-gray-600 bg-gray-100"
            >
              {a}
            </span>
          ))}
        </div>

        {/* Botão "Saiba mais" */}
        <div className="mt-auto">
          {link ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-[10px]
                         text-white font-bold text-[13px]
                         cursor-pointer border-none transition-all min-h-[44px]
                         hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: 'var(--azul)', textDecoration: 'none' }}
              aria-label={`Saiba mais sobre hospedagem em ${name}`}
            >
              <ExternalLink size={14} strokeWidth={2.5} />
              {verOpcoesLabel}
            </a>
          ) : (
            <button
              onClick={() => onToast('Abrindo opções de hospedagem...')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-[10px]
                         text-white font-bold text-[13px]
                         cursor-pointer border-none transition-all min-h-[44px]
                         hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: 'var(--azul)' }}
              aria-label={`Saiba mais sobre hospedagem em ${name}`}
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