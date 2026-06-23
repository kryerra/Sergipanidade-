/**
 * DestinationCard — card padrão de destino
 * Sergipanidade Design System v2
 * foto + categoria + nome + avaliação + botão explorar
 */
import { ImageWithFallback } from '@/components/shared/ImageWithFallback';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { StarRating } from '@/components/ui/StarRating';

interface Destination {
  id: string;
  name: string;
  shortDesc: string;
  shortDesc_en?: string;
  shortDesc_es?: string;
  category: string;
  rating: string;
  reviews: string;
  image: string;
}

interface DestinationCardProps {
  destination: Destination;
  language: 'pt' | 'en' | 'es' | 'sp';
  onNavigate: (screen: string, id: string) => void;
  exploreLabel?: string;
  onAction?: (e: React.MouseEvent) => void;
  actionLabel?: string;
}

export function DestinationCard({
  destination,
  language,
  onNavigate,
  exploreLabel = 'EXPLORAR',
  onAction,
  actionLabel,
}: DestinationCardProps) {
  const desc =
    language === 'en' && destination.shortDesc_en
      ? destination.shortDesc_en
      : language === 'es' && destination.shortDesc_es
      ? destination.shortDesc_es
      : destination.shortDesc;

  return (
    <div
      onClick={() => onNavigate('detalhe', destination.id)}
      className="bg-[var(--branco)] rounded-[var(--radius)] overflow-hidden
                 shadow-[var(--sombra-sm)] border border-[var(--cinza-med)]
                 cursor-pointer transition-all duration-200
                 hover:-translate-y-1 hover:shadow-[var(--sombra-md)]"
    >
      {/* Imagem */}
      <div className="h-[148px] sm:h-[172px] relative overflow-hidden">
        <ImageWithFallback
          src={destination.image}
          alt={destination.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {/* Badge de categoria — sobre a imagem */}
        <div className="absolute top-2.5 left-2.5">
          <CategoryBadge
            category={destination.category}
            size="sm"
            className="shadow-sm"
          />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="px-4 py-3.5">
        <h3
          className="font-semibold font-display text-[17px] text-[var(--preto)] tracking-tight mb-1"
          style={{ lineHeight: 1.3 }}
        >
          {destination.name}
        </h3>
        <p className="text-xs text-[#888] leading-relaxed mb-3 line-clamp-2">
          {desc}
        </p>

        <div className="flex items-center justify-between gap-2">
          <StarRating
            rating={parseFloat(destination.rating)}
            reviews={destination.reviews}
            size="sm"
          />

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onAction) onAction(e);
              else onNavigate('detalhe', destination.id);
            }}
            className="px-3.5 py-1.5 bg-[var(--primary)] text-[var(--branco-puro)] border-none
                       rounded-[12px] text-[11px] font-bold cursor-pointer tracking-wide
                       hover:bg-[#0A5D61] transition-colors min-h-[36px] flex items-center"
          >
            {actionLabel ?? exploreLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
