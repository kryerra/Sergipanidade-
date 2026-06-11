/**
 * GuiaScreen — Guia de Destinos
 * Redesign v3 — Lista rica + Modo Mapa
 */
import { useState, useRef, useEffect } from 'react';
import { destinations, type Destination } from "@/constants/destinations";
import { translations } from "@/constants/translations";
import {
  Search, X, ChevronDown, MapPin, Star,
  ThumbsUp, ThumbsDown, Share2, Bookmark, CheckCircle2,
  SlidersHorizontal, ArrowLeft, Navigation, UtensilsCrossed,
  Landmark, Waves, TreePine, PawPrint, Users,
} from 'lucide-react';
import { ImageWithFallback } from '@/components/shared/ImageWithFallback';
import { HeroSlideshow } from '@/components/shared/HeroSlideshow';
import { SERGIPE_BEACHES } from "@/constants/sergipeImages";
import { useToast } from "@/context/AppContext";

// ─── Configurações de categoria ──────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { color: string; bg: string; label: string; icon: any }> = {
  'PRAIA':        { color: '#4A8FD4', bg: '#EFF7FF', label: 'Praia',        icon: Waves },
  'GASTRONOMIA':  { color: '#E8543A', bg: '#FFF1EE', label: 'Gastronomia',  icon: UtensilsCrossed },
  'CULTURA':      { color: '#7C3AED', bg: '#F5F3FF', label: 'Cultura',      icon: Landmark },
  'NATUREZA':     { color: '#16A34A', bg: '#F0FDF4', label: 'Natureza',     icon: TreePine },
  'HISTÓRIA':     { color: '#D97706', bg: '#FFFBEB', label: 'História',     icon: Landmark },
  'PET FRIENDLY': { color: '#EC4899', bg: '#FDF2F8', label: 'Pet Friendly', icon: PawPrint },
  'ACESSÍVEL':    { color: '#0D9488', bg: '#F0FDFA', label: 'Acessível',    icon: Users },
};

const FILTER_CATEGORIES = ['Todos', 'Gastronomia', 'Cultura', 'Praias', 'História', 'Natureza', 'Pet Friendly'];

const CATEGORY_TO_DATA: Record<string, string> = {
  Gastronomia:  'GASTRONOMIA',
  Cultura:      'CULTURA',
  Praias:       'PRAIA',
  História:     'HISTÓRIA',
  Natureza:     'NATUREZA',
  'Pet Friendly':'PET FRIENDLY',
  Acessível:    'ACESSÍVEL',
};

const VERIFIED_IDS = new Set(['orla-atalaia', 'canion-xingo', 'centro-historico', 'museu-gente', 'mercado-thales']);

const DEST_SOCIAL: Record<string, { likes: string; dislikes: number }> = {
  'orla-atalaia':     { likes: '73mil', dislikes: 234 },
  'miauteria':        { likes: '41mil', dislikes: 89 },
  'museu-gente':      { likes: '28mil', dislikes: 312 },
  'canion-xingo':     { likes: '52mil', dislikes: 178 },
  'mercado-thales':   { likes: '35mil', dislikes: 456 },
  'centro-historico': { likes: '19mil', dislikes: 123 },
  'parque-sementeira':{ likes: '22mil', dislikes: 89 },
  'centro-turismo':   { likes: '14mil', dislikes: 67 },
};

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Mais relevantes' },
  { value: 'rating',    label: 'Melhor avaliados' },
  { value: 'distance',  label: 'Mais próximos' },
];

function parseDistance(d: string): number {
  return parseFloat(d.replace(/[^0-9.]/g, '')) || 0;
}

// ─── DestinationCard ─────────────────────────────────────────────────────────

interface CardProps {
  dest: Destination;
  onNavigate: (screen: string, id: string) => void;
  language: 'pt' | 'en' | 'es' | 'sp';
}

function DestinationCard({ dest, onNavigate, language }: CardProps) {
  const { toast: onToast } = useToast();
  const [liked, setLiked]   = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [saved, setSaved]   = useState(false);

  const cat      = CATEGORY_CONFIG[dest.category] ?? { color: '#78716C', bg: '#F5F5F4', label: dest.category, icon: MapPin };
  const verified = VERIFIED_IDS.has(dest.id);
  const social   = DEST_SOCIAL[dest.id] ?? { likes: '12mil', dislikes: 45 };
  const stars    = Math.round(parseFloat(dest.rating));
  const desc     = language === 'en' && dest.shortDesc_en ? dest.shortDesc_en
                 : language === 'es' && dest.shortDesc_es ? dest.shortDesc_es
                 : dest.shortDesc;

  return (
    <div className="bg-white rounded-2xl overflow-hidden flex flex-col border border-[var(--cinza-med)]
                    shadow-[var(--sombra-sm)] transition-all duration-200
                    hover:shadow-[var(--sombra-md)] hover:-translate-y-0.5">

      {/* ── Foto 16:9 ── */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <ImageWithFallback
          src={dest.image}
          alt={dest.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />

        {/* Badge categoria — topo esquerdo */}
        <div className="absolute top-3 left-3">
          <span
            className="px-2.5 py-1 rounded-full text-[11px] font-bold text-white backdrop-blur-sm flex items-center gap-1"
            style={{ backgroundColor: cat.color + 'DD' }}
          >
            {cat.icon && <cat.icon size={12} strokeWidth={2.5} />}
            {cat.label}
          </span>
        </div>

        {/* Badge verificado — topo direito */}
        {verified && (
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold
                             bg-[rgba(22,163,74,0.90)] backdrop-blur-sm text-white whitespace-nowrap">
              <CheckCircle2 size={10} strokeWidth={2.5} />
              VERIFICADO
            </span>
          </div>
        )}
      </div>

      {/* ── Conteúdo ── */}
      <div className="p-4 flex flex-col flex-1">

        {/* Nome */}
        <h3
          onClick={() => onNavigate('detalhe', dest.id)}
          className="font-['Fjalla_One'] text-[var(--preto)] tracking-wide leading-tight mb-1.5
                     cursor-pointer hover:text-[var(--primary)] transition-colors"
          style={{ fontSize: '16px' }}
        >
          {dest.name}
        </h3>

        {/* Localização */}
        <div className="flex items-center gap-1 mb-2">
          <MapPin size={11} className="text-[var(--cinza-txt)] shrink-0" />
          <span className="text-[12px] text-[var(--cinza-txt)]">
            {dest.bairro} · {dest.region}
          </span>
          <span className="text-[11px] text-[var(--cinza-txt)]/60 ml-auto shrink-0">{dest.distance}</span>
        </div>

        {/* Descrição 2 linhas */}
        <p className="text-[12px] leading-relaxed mb-3"
           style={{ color: '#666', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
          {desc}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              size={13}
              fill={i <= stars ? '#F59E0B' : 'none'}
              stroke={i <= stars ? '#F59E0B' : '#D1D5DB'}
              strokeWidth={1.8}
            />
          ))}
          <span className="text-[13px] font-bold text-[var(--preto)] ml-1">{dest.rating}</span>
          <span className="text-[11px] text-[var(--cinza-txt)]">({dest.reviews})</span>
        </div>

        {/* Divider */}
        <div className="h-px bg-[var(--cinza-med)] mb-3" />

        {/* Ações sociais */}
        <div className="flex items-center gap-1.5 mb-3">
          {/* Like */}
          <button
            onClick={() => { setLiked(!liked); setDisliked(false); if (!liked) onToast(`Curtido!`); }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-medium
                        border transition-all min-h-[30px]
                        ${liked
                          ? 'bg-blue-50 border-blue-200 text-blue-600'
                          : 'border-[var(--cinza-med)] text-[var(--cinza-txt)] hover:border-blue-200 hover:text-blue-500'}`}
          >
            <ThumbsUp size={11} fill={liked ? 'currentColor' : 'none'} strokeWidth={2} />
            <span>{social.likes}</span>
          </button>

          {/* Dislike */}
          <button
            onClick={() => { setDisliked(!disliked); setLiked(false); }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px]
                        border transition-all min-h-[30px]
                        ${disliked
                          ? 'bg-red-50 border-red-200 text-red-400'
                          : 'border-[var(--cinza-med)] text-[var(--cinza-txt)] hover:border-red-200 hover:text-red-400'}`}
          >
            <ThumbsDown size={11} fill={disliked ? 'currentColor' : 'none'} strokeWidth={2} />
          </button>

          {/* Compartilhar */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(dest.address);
              const msg = language === 'en' ? 'Location copied!'
                        : language === 'es' ? '¡Ubicación copiada!'
                        : 'Localização copiada!';
              onToast(msg);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px]
                       border border-[var(--cinza-med)] text-[var(--cinza-txt)] transition-all min-h-[30px]
                       hover:border-[var(--azul)]/40 hover:text-[var(--azul)]"
          >
            <Share2 size={11} strokeWidth={2} />
            <span className="hidden lg:inline">Compartilhar</span>
          </button>

          {/* Salvar — empurrado para a direita */}
          <button
            onClick={() => { setSaved(!saved); onToast(saved ? `Removido` : `${dest.name} salvo!`); }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] ml-auto
                        border transition-all min-h-[30px]
                        ${saved
                          ? 'bg-[var(--laranja-leve)] border-[var(--primary)]/30 text-[var(--primary)]'
                          : 'border-[var(--cinza-med)] text-[var(--cinza-txt)] hover:border-[var(--primary)]/30 hover:text-[var(--primary)]'}`}
          >
            <Bookmark size={11} fill={saved ? 'currentColor' : 'none'} strokeWidth={2} />
            <span className="hidden lg:inline">Salvar</span>
          </button>
        </div>

        {/* CTA — Explorar */}
        <button
          onClick={() => onNavigate('detalhe', dest.id)}
          className="w-full py-2.5 rounded-[10px] text-white font-['Fjalla_One'] text-[12px]
                     tracking-widest uppercase cursor-pointer border-none transition-all min-h-[40px]
                     hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: 'var(--primary)', boxShadow: '0 2px 10px rgba(240,96,48,0.22)' }}
        >
          EXPLORAR
        </button>
      </div>
    </div>
  );
}

// ─── MapView ─────────────────────────────────────────────────────────────────


interface GuiaScreenProps {
  onNavigate: (screen: string, destinationId?: string) => void;
  onOpenGPS: (destinationId?: string) => void;
  language: 'pt' | 'en' | 'es' | 'sp';
}

export function GuiaScreen({ onNavigate, onOpenGPS, language }: GuiaScreenProps) {
  const [activeRegion, setActiveRegion]   = useState('Todos');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchTerm, setSearchTerm]       = useState('');
  const [sortOrder, setSortOrder]         = useState('relevance');
  const [showSortMenu, setShowSortMenu]   = useState(false);

  const t      = translations[language] as any;
  const sortRef = useRef<HTMLDivElement>(null);

  // Fechar sort menu ao clicar fora
  useEffect(() => {
    if (!showSortMenu) return;
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setShowSortMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showSortMenu]);

  // ── Filtragem e ordenação ──────────────────────────────────────────────────
  let result = destinations.filter((d) => {
    const matchRegion   = activeRegion === 'Todos' || d.region === activeRegion;
    const matchCategory = activeCategory === 'Todos' || d.category === CATEGORY_TO_DATA[activeCategory];
    const term = searchTerm.trim().toLowerCase();
    const matchSearch = !term || (
      d.name.toLowerCase().includes(term) ||
      d.shortDesc.toLowerCase().includes(term) ||
      d.bairro.toLowerCase().includes(term) ||
      d.category.toLowerCase().includes(term)
    );
    return matchRegion && matchCategory && matchSearch;
  });

  if (sortOrder === 'rating')   result = [...result].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
  if (sortOrder === 'distance') result = [...result].sort((a, b) => parseDistance(a.distance) - parseDistance(b.distance));

  const currentSort = SORT_OPTIONS.find(s => s.value === sortOrder) ?? SORT_OPTIONS[0];

  return (
    <div className="min-h-screen pt-[0px] md:pt-[0px]" style={{ backgroundColor: 'var(--branco)' }}>

      {/* ════════════════════════════════════════════════════════════
          HEADER COM SLIDESHOW
      ════════════════════════════════════════════════════════════ */}
      <HeroSlideshow images={SERGIPE_BEACHES} height="480px" overlayOpacity={0.55} fit="cover">
          <h1
            className="font-['Fjalla_One'] text-white tracking-wide"
            style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}
          >
            {t.guideTitle ?? 'Guia de Destinos'}
          </h1>
      </HeroSlideshow>

      {/* ════════════════════════════════════════════════════════════
          BARRA DE FILTROS STICKY
      ════════════════════════════════════════════════════════════ */}
      <div
        className="z-[800] bg-white"
        style={{
          top: 'max(56px, env(safe-area-inset-top, 0px) + 56px)',
          boxShadow: '0 2px 16px rgba(24,24,27,0.08)',
          borderBottom: '1px solid var(--cinza-med)',
        }}
      >
        <div className="max-w-[1200px] mx-auto">

          {/* ── Linha 1: (Região removida) ── */}
          <div className="hidden" />
          {/* ── Linha 2: Pills de Categoria ── */}
          <div className="flex items-center gap-2 px-5 sm:px-8 py-3 overflow-x-auto no-scrollbar border-b border-[var(--cinza-med)]">
            {FILTER_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              const catKey   = CATEGORY_TO_DATA[cat];
              const catConf  = catKey ? CATEGORY_CONFIG[catKey] : null;
              const IconComponent = catConf?.icon;

              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full
                             text-[12px] font-medium border cursor-pointer transition-all whitespace-nowrap"
                  style={isActive ? {
                    backgroundColor: catConf?.color ?? 'var(--primary)',
                    borderColor: 'transparent',
                    color: '#fff',
                    boxShadow: `0 2px 8px ${(catConf?.color ?? 'var(--primary)')}44`,
                  } : {
                    backgroundColor: '#fff',
                    borderColor: 'var(--cinza-med)',
                    color: 'var(--cinza-txt)',
                  }}
                >
                  {IconComponent && <IconComponent size={13} strokeWidth={2} />}
                  {cat}
                </button>
              );
            })}
          </div>

          {/* ── Linha 3: Busca + Ordenação + Toggle Mapa ── */}
          <div className="flex items-center gap-3 px-5 sm:px-8 py-3">
            {/* Campo de busca */}
            <div className="relative flex-1 max-w-[400px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--cinza-txt)] pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar destino..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-[8px] text-[13px] outline-none
                           border border-[var(--cinza-med)] bg-[var(--cinza-leve)]
                           text-[var(--preto)] placeholder:text-[var(--cinza-txt)] min-h-[36px]
                           focus:border-[var(--primary)]/40 focus:bg-white transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center
                             justify-center bg-[var(--cinza-med)] text-[var(--cinza-txt)] rounded-full
                             border-none cursor-pointer hover:bg-[var(--cinza-txt)]/30 transition-colors"
                >
                  <X size={10} />
                </button>
              )}
            </div>

            {/* Ícone de filtros (mobile) */}
            <button className="md:hidden flex items-center justify-center w-9 h-9 rounded-[8px] border border-[var(--cinza-med)] bg-white cursor-pointer text-[var(--cinza-txt)] flex-shrink-0">
              <SlidersHorizontal size={15} />
            </button>

            {/* Dropdown de ordenação */}
            <div ref={sortRef} className="relative hidden sm:block flex-shrink-0">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-[8px] border border-[var(--cinza-med)]
                           bg-white text-[13px] font-medium text-[var(--preto)] cursor-pointer
                           hover:border-[var(--primary)]/40 transition-colors min-h-[36px] whitespace-nowrap"
              >
                <SlidersHorizontal size={13} className="text-[var(--cinza-txt)]" />
                {currentSort.label}
                <ChevronDown size={13} className={`text-[var(--cinza-txt)] transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
              </button>

              {showSortMenu && (
                <div className="absolute top-full left-0 mt-1.5 bg-white rounded-[10px] shadow-[var(--sombra-md)]
                                border border-[var(--cinza-med)] overflow-hidden z-50 min-w-[190px]">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortOrder(opt.value); setShowSortMenu(false); }}
                      className="w-full flex items-center justify-between px-4 py-3 text-left text-[13px]
                                 font-medium bg-transparent border-none cursor-pointer transition-colors"
                      style={{
                        color: sortOrder === opt.value ? 'var(--primary)' : 'var(--preto)',
                        backgroundColor: sortOrder === opt.value ? 'var(--laranja-leve)' : 'transparent',
                      }}
                      onMouseEnter={(e) => { if (sortOrder !== opt.value) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--cinza-leve)'; }}
                      onMouseLeave={(e) => { if (sortOrder !== opt.value) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                    >
                      {opt.label}
                      {sortOrder === opt.value && <span className="text-[11px]">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          CONTEÚDO — LISTA ou MAPA
      ════════════════════════════════════════════════════════════ */}

      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8">

          {/* Contador de resultados */}
          {(searchTerm || activeCategory !== 'Todos') && (
            <div className="flex items-center justify-between mb-5">
              <p className="text-[13px] text-[var(--cinza-txt)]">
                <span className="font-bold text-[var(--preto)]">{result.length}</span> destino{result.length !== 1 ? 's' : ''} encontrado{result.length !== 1 ? 's' : ''}
                {searchTerm && <> para "<span className="font-medium text-[var(--preto)]">{searchTerm}</span>"</>}
              </p>
              <button
                onClick={() => { setSearchTerm(''); setActiveCategory('Todos'); }}
                className="text-[12px] text-[var(--primary)] font-medium bg-transparent border-none
                           cursor-pointer hover:underline"
              >
                Limpar filtros
              </button>
            </div>
          )}

          {/* Grid 2 colunas */}
          {result.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {result.map((dest) => (
                <DestinationCard
                  key={dest.id}
                  dest={dest}
                  onNavigate={(screen, id) => onNavigate(screen, id)}
                  language={language}
                />
              ))}
            </div>
          ) : (
            /* Estado vazio */
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4">
              <Search size={48} className="text-[var(--cinza-txt)]" />
            </div>
              <h3 className="font-['Fjalla_One'] text-[var(--preto)] mb-2" style={{ fontSize: '22px' }}>
                Nenhum destino encontrado
              </h3>
              <p className="text-[var(--cinza-txt)] mb-6 max-w-[320px]" style={{ fontSize: '14px' }}>
                Tente outra região, categoria ou termo de busca
              </p>
              <button
                onClick={() => { setSearchTerm(''); setActiveCategory('Todos'); setActiveRegion('Todos'); }}
                className="px-6 py-3 rounded-[10px] text-white font-['Fjalla_One'] text-[13px]
                           tracking-wider uppercase cursor-pointer border-none transition-all
                           hover:opacity-90 min-h-[44px]"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                LIMPAR FILTROS
              </button>
            </div>
          )}
        </div>

      {/* Espaço inferior para bottom nav mobile */}
      <div className="md:hidden h-[calc(64px+env(safe-area-inset-bottom))]" />
    </div>
  );
}