/**
 * StarRating — estrelas amarelas com nota e contagem
 * Sergipanidade Design System v2
 */
import { useState } from 'react';

interface StarRatingProps {
  /** Nota atual (0–5) */
  rating: number;
  /** Quantidade de avaliações (ex: "1.2k") */
  reviews?: string | number;
  /** Modo interativo — permite o usuário clicar para avaliar */
  interactive?: boolean;
  /** Callback quando o usuário seleciona uma nota */
  onRate?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

const STAR_SIZES = { sm: 14, md: 18, lg: 24 };
const TEXT_SIZES = { sm: 12, md: 13, lg: 16 };

export function StarRating({
  rating,
  reviews,
  interactive = false,
  onRate,
  size = 'md',
  showCount = true,
  className = '',
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const starSize = STAR_SIZES[size];
  const textSize = TEXT_SIZES[size];
  const displayRating = hovered > 0 ? hovered : rating;

  return (
    <div
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
    >
      {/* Stars */}
      <div style={{ display: 'flex', gap: 2 }}>
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = displayRating >= star;
          const halfFilled = !filled && displayRating >= star - 0.5;

          return (
            <span
              key={star}
              onClick={interactive && onRate ? () => onRate(star) : undefined}
              onMouseEnter={interactive ? () => setHovered(star) : undefined}
              onMouseLeave={interactive ? () => setHovered(0) : undefined}
              style={{
                fontSize: starSize,
                lineHeight: 1,
                cursor: interactive ? 'pointer' : 'default',
                color: filled || halfFilled ? '#F5C800' : '#D8D8D8',
                transition: 'color 0.1s',
                minWidth: starSize,
                minHeight: starSize,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              role={interactive ? 'button' : undefined}
              aria-label={interactive ? `Dar ${star} estrela${star > 1 ? 's' : ''}` : undefined}
            >
              ★
            </span>
          );
        })}
      </div>

      {/* Rating number */}
      {rating > 0 && (
        <span
          style={{
            fontSize: textSize,
            fontWeight: 700,
            color: '#111111',
            lineHeight: 1,
          }}
        >
          {typeof rating === 'number' ? rating.toFixed(1) : rating}
        </span>
      )}

      {/* Review count */}
      {showCount && reviews !== undefined && (
        <span
          style={{
            fontSize: textSize - 1,
            color: '#999',
            lineHeight: 1,
          }}
        >
          ({reviews})
        </span>
      )}
    </div>
  );
}
