/**
 * AtracaoCard — card de atração para a seção "Vamos Curtir"
 * Sergipanidade Design System v2
 * Opção 4 — Barra inferior com separadores e micro-animações nos ícones
 */
import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Share2, Bookmark, Clock } from 'lucide-react';
import { ImageWithFallback } from '@/components/shared/ImageWithFallback';
import { useToast } from "@/context/AppContext";

interface AtracaoCardProps {
  id: string;
  name: string;
  hours: string;
  image: string;
  likes: string;
  address?: string;
  onNavigate: (screen: string, id: string) => void;
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
  address,
  onNavigate,
  curtirLabel,
  compartilharLabel,
  salvarLabel,
  curtidoToast,
  compartilhadoToast,
  likes,
}: AtracaoCardProps) {
  const { toast: onToast } = useToast();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(() => {
    const num = parseInt(likes.replace(/\D/g, ''), 10);
    return isNaN(num) ? 0 : num;
  });
  const [disliked, setDisliked] = useState(false);
  const [saved, setSaved] = useState(false);

  const [likeBounce, setLikeBounce] = useState(false);
  const [dislikeBounce, setDislikeBounce] = useState(false);
  const [shareSpin, setShareSpin] = useState(false);
  const [saveWiggle, setSaveWiggle] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked((prev) => {
      setLikeCount((c) => prev ? c - 1 : c + 1);
      return !prev;
    });
    setDisliked(false);
    setLikeBounce(true);
    setTimeout(() => setLikeBounce(false), 400);
    if (!liked) onToast(curtidoToast);
  };

  const handleDislike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDisliked((prev) => !prev);
    setLiked((prev) => {
      if (prev) {
        setLikeCount((c) => c - 1);
        return false;
      }
      return prev;
    });
    setDislikeBounce(true);
    setTimeout(() => setDislikeBounce(false), 400);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (address) navigator.clipboard.writeText(address);
    setShareSpin(true);
    setTimeout(() => setShareSpin(false), 500);
    onToast(compartilhadoToast);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved(!saved);
    setSaveWiggle(true);
    setTimeout(() => setSaveWiggle(false), 400);
  };

  const formatCount = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(0)}mil` : String(n);

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden border border-[rgba(17,17,17,0.06)] cursor-pointer
                 transition-shadow duration-200 hover:shadow-md flex flex-col group"
    >
      {/* Foto */}
      <div
        className="relative aspect-video overflow-hidden rounded-t-xl"
        onClick={() => onNavigate('detalhe', id)}
      >
        <ImageWithFallback
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* Conteúdo */}
      <div className="p-4 flex flex-col flex-1">
        <h3
          className="font-semibold font-display text-[18px] text-[var(--preto)] tracking-tight mb-1.5 leading-tight"
          onClick={() => onNavigate('detalhe', id)}
        >
          {name}
        </h3>

        {/* Horário */}
        <div className="flex items-center gap-1.5 mb-3">
          <Clock size={13} className="text-[var(--primary)] shrink-0" />
          <span className="text-[12px] text-[var(--cinza-txt)] leading-none">{hours}</span>
        </div>

        {/* Divider */}
        <div className="h-px bg-[var(--cinza-med)] mb-3 mt-auto" />

        {/* Ações sociais */}
        <div className="flex items-center gap-1.5">
          {/* Like */}
          <button
            onClick={handleLike}
            aria-label={`${curtirLabel} ${name}`}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-medium
                        border transition-all min-h-[30px] cursor-pointer select-none
                        ${liked
                          ? 'bg-blue-50 border-blue-200 text-blue-600'
                          : 'border-[var(--cinza-med)] text-[var(--cinza-txt)] hover:border-blue-200 hover:text-blue-500'}`}
          >
            <ThumbsUp
              size={11}
              fill={liked ? 'currentColor' : 'none'}
              strokeWidth={2.5}
              style={{
                transform: likeBounce ? 'scale(1.3)' : 'scale(1)',
                transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            />
            <span>{formatCount(likeCount)}</span>
          </button>

          {/* Dislike */}
          <button
            onClick={handleDislike}
            aria-label={`Não curtir ${name}`}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px]
                        border transition-all min-h-[30px] cursor-pointer select-none
                        ${disliked
                          ? 'bg-red-50 border-red-200 text-red-400'
                          : 'border-[var(--cinza-med)] text-[var(--cinza-txt)] hover:border-red-200 hover:text-red-400'}`}
          >
            <ThumbsDown
              size={11}
              fill={disliked ? 'currentColor' : 'none'}
              strokeWidth={2.5}
              style={{
                transform: dislikeBounce ? 'scale(1.3)' : 'scale(1)',
                transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            />
          </button>

          {/* Compartilhar */}
          <button
            onClick={handleShare}
            aria-label={`${compartilharLabel} ${name}`}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] cursor-pointer select-none
                       border border-[var(--cinza-med)] text-[var(--cinza-txt)] transition-all min-h-[30px]
                       hover:border-[var(--azul)]/40 hover:text-[var(--azul)]"
          >
            <Share2
              size={11}
              strokeWidth={2.5}
              style={{
                transform: shareSpin ? 'rotate(20deg) scale(1.2)' : 'rotate(0deg) scale(1)',
                transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            />
            <span className="hidden sm:inline">{compartilharLabel}</span>
          </button>

          {/* Salvar — empurrado para a direita */}
          <button
            onClick={handleSave}
            aria-label={`${salvarLabel} ${name}`}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] ml-auto cursor-pointer select-none
                        border transition-all min-h-[30px]
                        ${saved
                          ? 'bg-[var(--laranja-leve)] border-[var(--primary)]/30 text-[var(--primary)]'
                          : 'border-[var(--cinza-med)] text-[var(--cinza-txt)] hover:border-[var(--primary)]/30 hover:text-[var(--primary)]'}`}
          >
            <Bookmark
              size={11}
              fill={saved ? 'currentColor' : 'none'}
              strokeWidth={2.5}
              style={{
                transform: saveWiggle
                  ? saved
                    ? 'rotate(-12deg) scale(1.2)'
                    : 'rotate(12deg) scale(1.2)'
                  : 'rotate(0deg) scale(1)',
                transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            />
            <span className="hidden sm:inline">
              {saved
                ? (curtirLabel === 'Like' ? 'Saved' : curtirLabel === 'Me gusta' ? 'Guardado' : 'Salvo')
                : salvarLabel}
            </span>
          </button>
        </div>
        {/* ─────────────────────────────────────────────────────────────────── */}
      </div>
    </div>
  );
}