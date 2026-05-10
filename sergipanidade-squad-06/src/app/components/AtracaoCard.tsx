/**
 * AtracaoCard — card de atração para a seção "Vamos Curtir"
 * Sergipanidade Design System v2
 * foto + nome + horário + likes + botões curtir/compartilhar/salvar
 */
import { useState } from 'react';
import { Heart, Share2, Bookmark, Clock } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface AtracaoCardProps {
  id: string;
  name: string;
  hours: string;
  image: string;
  likes: string;
  onNavigate: (screen: string, id: string) => void;
  onToast: (message: string) => void;
  curtirLabel: string;
  compartilharLabel: string;
  salvarLabel: string;
  curtidoToast: string;
  compartilhadoToast: string;
}

export function AtracaoCard({
  id,
  name,
  hours,
  image,
  likes,
  onNavigate,
  onToast,
  curtirLabel,
  compartilharLabel,
  salvarLabel,
  curtidoToast,
  compartilhadoToast,
}: AtracaoCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    if (!liked) onToast(curtidoToast);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToast(compartilhadoToast);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved(!saved);
  };

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(17,17,17,0.10)]
                 border border-[rgba(17,17,17,0.06)] cursor-pointer
                 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(17,17,17,0.16)]
                 flex flex-col"
    >
      {/* Foto */}
      <div
        className="relative overflow-hidden"
        style={{ height: '210px' }}
        onClick={() => onNavigate('detalhe', id)}
      >
        <ImageWithFallback
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Likes badge — sobre a foto */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm
                        rounded-full px-2.5 py-1">
          <Heart size={11} fill="#f87171" className="text-red-400" />
          <span className="text-white text-[11px] font-semibold">{likes}</span>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4 flex flex-col flex-1">
        <h3
          className="font-['Fjalla_One'] text-[18px] text-[var(--preto)] tracking-wide mb-1.5 leading-tight"
          onClick={() => onNavigate('detalhe', id)}
        >
          {name}
        </h3>

        {/* Horário */}
        <div className="flex items-center gap-1.5 mb-4">
          <Clock size={13} className="text-[var(--primary)] shrink-0" />
          <span className="text-[12px] text-[var(--cinza-txt)] leading-none">{hours}</span>
        </div>

        {/* Divider */}
        <div className="h-px bg-[var(--cinza-med)] mb-3" />

        {/* Botões de ação */}
        <div className="flex items-center gap-1.5 justify-between">
          {/* Curtir */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium
                        border transition-all duration-150 min-h-[36px] flex-1 justify-center
                        ${liked
                          ? 'bg-red-50 border-red-200 text-red-500'
                          : 'border-[var(--cinza-med)] text-[var(--cinza-txt)] hover:border-red-200 hover:text-red-400 hover:bg-red-50'
                        }`}
            aria-label={curtirLabel}
          >
            <Heart size={14} fill={liked ? 'currentColor' : 'none'} strokeWidth={2} />
            <span className="hidden sm:inline">{curtirLabel}</span>
          </button>

          {/* Compartilhar */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium
                       border border-[var(--cinza-med)] text-[var(--cinza-txt)] transition-all duration-150
                       min-h-[36px] flex-1 justify-center
                       hover:border-[var(--azul)]/40 hover:text-[var(--azul)] hover:bg-[var(--azul-leve)]"
            aria-label={compartilharLabel}
          >
            <Share2 size={14} strokeWidth={2} />
            <span className="hidden sm:inline">{compartilharLabel}</span>
          </button>

          {/* Salvar */}
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium
                        border transition-all duration-150 min-h-[36px] flex-1 justify-center
                        ${saved
                          ? 'bg-[var(--secondary)] border-[var(--primary)]/30 text-[var(--primary)]'
                          : 'border-[var(--cinza-med)] text-[var(--cinza-txt)] hover:border-[var(--primary)]/30 hover:text-[var(--primary)] hover:bg-[var(--secondary)]'
                        }`}
            aria-label={salvarLabel}
          >
            <Bookmark size={14} fill={saved ? 'currentColor' : 'none'} strokeWidth={2} />
            <span className="hidden sm:inline">{salvarLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}