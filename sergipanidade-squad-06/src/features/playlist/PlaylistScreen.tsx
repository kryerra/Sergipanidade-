import { ArrowLeft } from 'lucide-react';
import { translations } from '@/constants/translations';

interface PlaylistScreenProps {
  onNavigate: (screen: string) => void;
  onToast: (msg: string) => void;
  language: 'pt' | 'en' | 'es' | 'sp';
}

export function PlaylistScreen({ onNavigate, onToast, language }: PlaylistScreenProps) {
  const t = translations[language];

  const handleBack = () => {
    onNavigate('home');
    onToast('Voltou para home');
  };

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--branco)',
        paddingTop: 'calc(76px + env(safe-area-inset-top))',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-4 py-3 mb-6 text-sm font-medium text-[#0D7377] bg-white border border-[#E5E7EB] rounded-full hover:bg-[#F8FAFC]"
        >
          <ArrowLeft size={16} />
          {t?.backToHome || 'Voltar para Home'}
        </button>

        <section className="rounded-[30px] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
          <div className="mb-4">
            <span
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full uppercase text-[11px] tracking-[0.24em] font-bold"
              style={{
                backgroundColor: 'rgba(13,115,119,0.10)',
                color: 'var(--azul)',
                border: '1px solid rgba(13,115,119,0.22)',
              }}
            >
              Playlist
            </span>
          </div>

          <h1 className="font-['Fjalla_One'] text-3xl sm:text-4xl text-[#1A1A1A] leading-tight mb-4">
            Sergipanidade Playlist
          </h1>

          <p className="text-sm sm:text-base text-[#4B5563] max-w-2xl">
            Aproveite a seleção musical pensada para turistas enquanto explora os encantos de Sergipe.
          </p>

          <div className="mt-8 overflow-hidden rounded-[26px] bg-[#F8FAFC]">
            <iframe
              title="Sergipanidade Playlist"
              src="https://open.spotify.com/embed/playlist/3WH1Mj7Vu760FuV4nz8G4K"
              width="100%"
              height="380"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              style={{ borderRadius: 26, minHeight: 380 }}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
