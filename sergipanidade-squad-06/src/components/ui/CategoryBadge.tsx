/**
 * CategoryBadge — pill neutra com ícone + texto
 * Sergipanidade Rebrand 2026
 * Todas as categorias usam a paleta neutra.
 * Exceção: "EM DESTAQUE" usa fundo areia.
 */

import { 
  Umbrella, 
  UtensilsCrossed, 
  Landmark, 
  Theater, 
  Leaf, 
  PawPrint, 
  Tent, 
  Star,
  MapPin
} from 'lucide-react';

interface CategoryBadgeProps {
  category: string;
  size?: 'sm' | 'md';
  highlight?: boolean; // badge "Em destaque"
  className?: string;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  PRAIA:         Umbrella,
  GASTRONOMIA:   UtensilsCrossed,
  CULTURA:       Landmark,
  'HISTÓRIA':      Theater,
  HISTORIA:      Theater,
  NATUREZA:      Leaf,
  'PET FRIENDLY':PawPrint,
  EVENTO:        Tent,
  'EM DESTAQUE': Star,
};

export function CategoryBadge({
  category,
  size = 'md',
  highlight = false,
  className = '',
}: CategoryBadgeProps) {
  const Icon = CATEGORY_ICONS[category?.toUpperCase()] ?? MapPin;

  const isHighlight =
    highlight || category?.toUpperCase() === 'EM DESTAQUE';

  const padding  = size === 'sm' ? '3px 9px'  : '4px 12px';
  const fontSize = size === 'sm' ? '10px'      : '11px';
  const iconSize = size === 'sm' ? 11      : 12;

  return (
    <span
      className={className}
      style={{
        display:         'inline-flex',
        alignItems:      'center',
        gap:             5,
        padding,
        backgroundColor: isHighlight ? '#E9D8B4' : '#EEEDE9',
        color:           isHighlight ? '#0D7377' : '#1E1E1E',
        border:          `1px solid ${isHighlight ? 'rgba(13,115,119,0.25)' : '#D9D9D9'}`,
        borderRadius:    999,
        fontSize,
        fontFamily:      "'Inter', 'Roboto', 'Urbanist', sans-serif",
        fontWeight:      600,
        letterSpacing:   '0.06em',
        textTransform:   'uppercase',
        lineHeight:      1.4,
        whiteSpace:      'nowrap',
      }}
    >
      <Icon size={iconSize} />
      {category}
    </span>
  );
}
