/**
 * HeroSlideshow — Slideshow automático para headers com fotos de Sergipe
 * Sergipanidade Design System v4
 * Transição suave automática a cada 5 segundos
 * Overlay escuro semitransparente para legibilidade do texto
 */
import { useState, useEffect } from 'react';

type HeroSlideImage =
  | string
  | {
      src: string;
      x?: number| string;
      y?: number | string;
    };

interface HeroSlideshowProps {
  images: HeroSlideImage[];
  children?: React.ReactNode;
  height?: string;
  overlayOpacity?: number;
  fit?: 'cover' | 'contain';
}

function resolvePosition(value?: number | string) {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
}

export function HeroSlideshow({
  images,
  children,
  height = '500px',
  overlayOpacity = 0.5,
  fit = 'cover',
}: HeroSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative overflow-hidden bg-black" style={{ height }}>
      {/* Slideshow de imagens */}
      {images.map((img, index) => {
        const isObject = typeof img !== 'string';
        const src = isObject ? img.src : img;
        const x = isObject ? resolvePosition(img.x) : undefined;
        const y = isObject ? resolvePosition(img.y) : undefined;
        const position = `${x ?? '50%'} ${y ?? '35%'}`;

        return (
          <div
            key={index}
            className="absolute inset-0 transition-opacity duration-1000 overflow-hidden"
            style={{ opacity: index === currentIndex ? 1 : 0 }}
          >
            {fit === 'cover' ? (
              <div
                className="absolute inset-0 bg-no-repeat bg-cover"
                style={{ backgroundImage: `url(${src})`, backgroundPosition: position }}
              />
            ) : (
              <img
                src={src}
                alt=""
                className="absolute inset-0 m-auto w-full h-full object-contain"
                style={{ objectPosition: position }}
              />
            )}
          </div>
        );
      })}

      {/* Overlay escuro semitransparente */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
        }}
      />

      {/* Conteúdo sobreposto */}
      {children && (
        <div className="relative z-10 h-full flex items-center justify-center">
          {children}
        </div>
      )}

      {/* Indicadores de slide */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              role="button"
              tabIndex={0}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 transition-all duration-300 border-none cursor-pointer ${
                index === currentIndex
                  ? 'w-6 rounded bg-white'
                  : 'w-2 rounded-full bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
