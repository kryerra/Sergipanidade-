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
import { useAppContext } from '@/context/AppContext';

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
  'PET FRIENDLY': PawPrint,
  EVENTO:        Tent,
  'EM DESTAQUE': Star,
};

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  PT: {
    PRAIA: 'PRAIA',
    GASTRONOMIA: 'GASTRONOMIA',
    CULTURA: 'CULTURA',
    'HISTÓRIA': 'HISTÓRIA',
    HISTORIA: 'HISTÓRIA',
    NATUREZA: 'NATUREZA',
    'PET FRIENDLY': 'PET FRIENDLY',
    EVENTO: 'EVENTO',
    'EM DESTAQUE': 'EM DESTAQUE',
  },
  EN: {
    PRAIA: 'BEACH',
    GASTRONOMIA: 'GASTRONOMY',
    CULTURA: 'CULTURE',
    'HISTÓRIA': 'HISTORY',
    HISTORIA: 'HISTORY',
    NATUREZA: 'NATURE',
    'PET FRIENDLY': 'PET FRIENDLY',
    EVENTO: 'EVENT',
    'EM DESTAQUE': 'FEATURED',
  },
  ES: {
    PRAIA: 'PLAYA',
    GASTRONOMIA: 'GASTRONOMÍA',
    CULTURA: 'CULTURA',
    'HISTÓRIA': 'HISTORIA',
    HISTORIA: 'HISTORIA',
    NATUREZA: 'NATURALEZA',
    'PET FRIENDLY': 'PET FRIENDLY',
    EVENTO: 'EVENTO',
    'EM DESTAQUE': 'DESTACADO',
  }
};

export function CategoryBadge({
  category,
  size = 'md',
  highlight = false,
  className = '',
}: CategoryBadgeProps) {
  let language = 'pt';
  try {
    const context = useAppContext();
    if (context) language = context.language;
  } catch (e) {
    // context not available
  }

  const cleanLang = (language === 'sp' ? 'pt' : language).toUpperCase();
  const labelMap = CATEGORY_LABELS[cleanLang] || CATEGORY_LABELS.PT;
  const upperCat = category?.toUpperCase().trim();
  const displayLabel = labelMap[upperCat] || category;

  const Icon = CATEGORY_ICONS[upperCat] ?? MapPin;

  const isHighlight =
    highlight || upperCat === 'EM DESTAQUE';

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
        fontFamily:      "var(--font-sans)",
        fontWeight:      700,
        letterSpacing:   '0.06em',
        textTransform:   'uppercase',
        lineHeight:      1.4,
        whiteSpace:      'nowrap',
      }}
    >
      <Icon size={iconSize} />
      {displayLabel}
    </span>
  );
}
