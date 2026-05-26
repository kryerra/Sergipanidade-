/**
 * HeroSlideshow — Slideshow automático para headers com fotos de Sergipe
 * Sergipanidade Design System v4
 * Transição suave automática a cada 5 segundos
 * Overlay escuro semitransparente para legibilidade do texto
 */
import { useState, useEffect } from 'react';

interface HeroSlideshowProps {
  images: string[];
  children?: React.ReactNode;
  height?: string;
  overlayOpacity?: number;
  fit?: 'cover' | 'contain';
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
      {images.map((img, index) => (
        <div
          key={index}
          className="absolute inset-0 transition-opacity duration-1000 overflow-hidden"
          style={{ opacity: index === currentIndex ? 1 : 0 }}
        >
          {fit === 'cover' ? (
            <div
              className="absolute inset-0 bg-top bg-no-repeat bg-cover"
              style={{ backgroundImage: `url(${img})` }}
            />
          ) : (
            <img
              src={img}
              alt=""
              className="absolute inset-0 m-auto w-full h-full object-contain object-top"
            />
          )}
        </div>
      ))}

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
              onClick={() => setCurrentIndex(index)}
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: index === currentIndex ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                width: index === currentIndex ? '24px' : '8px',
              }}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
