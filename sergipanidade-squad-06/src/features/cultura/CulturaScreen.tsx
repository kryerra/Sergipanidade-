import { useState, useEffect, useRef } from 'react';
import {
  Search, MapPin, ArrowRight, ArrowLeft,
  Instagram, Globe, Mail, X, Palette,
  BookOpen, Shapes, 
  Eye,
  Ticket, Tent,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ImageWithFallback } from '@/components/shared/ImageWithFallback';
import IMG_CULTURA_HERO from "@/imports/Cultura.jpeg";
// ─── Types ───────────────────────────────────────────────────
type CulturaTab = 'artistas' | 'historias' | 'eventos';

interface Artist {
  id: string;
  name: string;
  city: string;
  linguagem: string;
  bio: string;
  bioFull: string;
  photo: string;
  coverPhoto: string;
  awards: string;
  years: string;
  instagram: string;
  works: { title: string; year: string; img: string; desc: string; tecnica: string }[];
}

interface Story {
  id: string;
  category: 'FOLCLORE' | 'TRADIÇÃO' | 'PERSONALIDADE' | 'GASTRONOMIA' | 'PATRIMÔNIO IMATERIAL';
  title: string;
  intro: string;
  body: string[];
  author: string;
  date: string;
  img: string;
  imgCaption: string;
  relatedImg: string;
}

interface CulturaEvent {
  id: string;
  name: string;
  type: string;
  day: string;
  month: string;
  local: string;
  city: string;
  desc: string;
  img: string;
  free: boolean;
  online: boolean;
  thisWeek: boolean;
}

import artistsData from "@/constants/artists.json";
import storiesData from "@/constants/stories.json";
import eventsData from "@/constants/events.json";

const ARTISTS: Artist[] = artistsData as Artist[];
const STORIES: Story[] = storiesData as unknown as Story[];
const EVENTS: CulturaEvent[] = eventsData as CulturaEvent[];



// ─── LANGUAGE ICONS MAP ───────────────────────────────────────




// ─── COMPONENT ───────────────────────────────────────────────
interface CulturaScreenProps {
  onToast: (msg: string) => void;
  language?: 'pt' | 'en' | 'es';
}

export function CulturaScreen({ onToast }: CulturaScreenProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<CulturaTab>('artistas');


  const [eventsView, setEventsView] = useState<'lista' | 'calendario'>('lista');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [selectedArtwork, setSelectedArtwork] = useState<Artist['works'][0] | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect((): void => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedArtist, selectedStory]);

  const filteredArtists = ARTISTS.filter((a: Artist): boolean => {
    const matchSearch = !searchTerm || a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.city.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const filteredEvents = EVENTS.filter((e: CulturaEvent): boolean => {
    const matchSearch = !searchTerm || e.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const filteredStories = STORIES.filter((s: Story): boolean =>
    !searchTerm || s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Artist Detail ──────────────────────────────────────────
  if (selectedArtist) {
    const related = ARTISTS.filter((a: Artist): boolean => a.id !== selectedArtist.id).slice(0, 3);
    return (
      <div
        className="min-h-screen"
        style={{
          backgroundColor: 'var(--branco)',
          paddingTop: 'calc(56px + env(safe-area-inset-top))',
          paddingBottom: 'calc(72px + env(safe-area-inset-bottom))',
        }}
      >
        {/* Back */}
        <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-6 pb-2">
          <button
            onClick={(): void => setSelectedArtist(null)}
            className="flex items-center gap-2 bg-transparent border-none cursor-pointer min-h-11 hover:opacity-70 transition-opacity"
            style={{ color: '#0D7377', fontSize: '14px' }}
          >
            <ArrowLeft size={18} />
            Voltar para Sergipanidade
          </button>
        </div>

        {/* Cover */}
        <div className="relative h-80 sm:h-100 overflow-hidden">
          <ImageWithFallback src={selectedArtist.coverPhoto} alt="Capa" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
        </div>

        {/* Header info */}
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="relative flex items-end gap-5 -mt-14 mb-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-lg shrink-0 bg-(--cinza-leve)">
              <ImageWithFallback src={selectedArtist.photo} alt={selectedArtist.name} className="w-full h-full object-cover" />
            </div>
            <div className="pb-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-['Fjalla_One'] text-white drop-shadow-lg" style={{ fontSize: '28px' }}>
                  {selectedArtist.name}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-1 rounded-full text-white font-bold uppercase tracking-wider"
                  style={{ backgroundColor: '#0D7377', fontSize: '11px' }}
                >
                  {selectedArtist.linguagem.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Post-cover row */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-1.5" style={{ color: '#0D7377', fontSize: '14px' }}>
              <MapPin size={15} />
              <span>{selectedArtist.city}</span>
            </div>
            <span className="text-(--cinza-txt) text-sm">{selectedArtist.awards}</span>
            <span className="text-(--cinza-txt) text-sm">{selectedArtist.years}</span>
          </div>

          {/* Bio */}
          <div className="bg-white rounded-[14px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] mb-8 max-w-3xl">
            <p style={{ color: '#4A4A4A', fontSize: '15px', lineHeight: 1.8 }}>
              {selectedArtist.bioFull}
            </p>
          </div>

          {/* Works */}
          <h2 className="font-['Fjalla_One'] mb-1" style={{ color: '#1A1A1A', fontSize: '22px' }}>
            Obras em destaque
          </h2>
          <p className="mb-5" style={{ color: '#8A8A8A', fontSize: '14px' }}>
            Clique em uma obra para ver em destaque
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {selectedArtist.works.map((work: Artist['works'][0], i: number): JSX.Element => (
              <button
                key={i}
                onClick={(): void => setSelectedArtwork(work)}
                className="group text-left bg-white rounded-[14px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)]
                           hover:shadow-[0_6px_24px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 transition-all duration-200
                           border-none cursor-pointer"
              >
                <div className="relative aspect-4/3 overflow-hidden">
                  <ImageWithFallback src={work.img} alt={work.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Eye size={28} color="white" className="opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-semibold mb-0.5" style={{ color: '#1A1A1A', fontSize: '14px' }}>{work.title}</p>
                  <p style={{ color: '#8A8A8A', fontSize: '12px' }}>{work.tecnica} · {work.year}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Social links */}
          <div className="bg-white rounded-[14px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] mb-8">
            <h3 className="font-semibold mb-4" style={{ color: '#1A1A1A', fontSize: '16px' }}>
              Onde encontrar
            </h3>
            <div className="flex flex-wrap gap-3">
              {[
                { icon: Instagram, label: selectedArtist.instagram, href: '#' },
                { icon: Globe, label: 'Site pessoal', href: '#' },
                { icon: Mail, label: 'E-mail', href: '#' },
              ].map(({ icon: Icon, label, href }: { icon: LucideIcon; label: string; href: string }): JSX.Element => (
                <a
                  key={label}
                  href={href}
                  onClick={(e: React.MouseEvent<HTMLAnchorElement>): void => { e.preventDefault(); onToast(`🔗 Abrindo ${label}`); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all min-h-11"
                  style={{ borderColor: '#D9D9D9', color: '#0D7377', fontSize: '13px' }}
                >
                  <Icon size={15} />
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Related artists */}
          <h2 className="font-['Fjalla_One'] mb-5" style={{ color: '#1A1A1A', fontSize: '22px' }}>
            Outros artistas que você pode gostar
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-8">
            {related.map((a: Artist): JSX.Element => (
              <button
                key={a.id}
                onClick={(): void => setSelectedArtist(a)}
                className="text-left bg-white rounded-[14px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)]
                           hover:shadow-[0_6px_24px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 transition-all duration-200
                           border-none cursor-pointer"
              >
                <div className="aspect-4/3 overflow-hidden">
                  <ImageWithFallback src={a.photo} alt={a.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <p className="font-semibold" style={{ color: '#1A1A1A', fontSize: '14px' }}>{a.name}</p>
                  <p style={{ color: '#8A8A8A', fontSize: '12px' }}>{a.linguagem} · {a.city}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Artwork Lightbox */}
        {selectedArtwork && (
          <div className="fixed inset-0 z-990 flex items-center justify-center p-4" onClick={(): void => setSelectedArtwork(null)}>
            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
            <div
              className="relative bg-white rounded-[14px] overflow-hidden w-full max-w-2xl max-h-[90vh] flex flex-col"
              onClick={(e: React.MouseEvent<HTMLDivElement>): void => e.stopPropagation()}
            >
              <div className="relative">
                <ImageWithFallback src={selectedArtwork.img} alt={selectedArtwork.title} className="w-full max-h-[50vh] object-cover" />
                <button
                  onClick={(): void => setSelectedArtwork(null)}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center border-none cursor-pointer hover:bg-black/80 transition-colors"
                >
                  <X size={16} color="white" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <h3 className="font-['Fjalla_One'] mb-1" style={{ color: '#1A1A1A', fontSize: '22px' }}>
                  {selectedArtwork.title}
                </h3>
                <p className="mb-3" style={{ color: '#0D7377', fontSize: '13px', fontWeight: 600 }}>
                  {selectedArtwork.tecnica} · {selectedArtwork.year}
                </p>
                <p style={{ color: '#4A4A4A', fontSize: '15px', lineHeight: 1.7 }}>
                  {selectedArtwork.desc}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Story Detail ───────────────────────────────────────────
  if (selectedStory) {
    const related = STORIES.filter((s: Story): boolean => s.id !== selectedStory.id).slice(0, 3);
    const catColor = '#0D7377';
    return (
      <div
        className="min-h-screen"
        style={{
          backgroundColor: 'var(--branco)',
          paddingTop: 'calc(56px + env(safe-area-inset-top))',
          paddingBottom: 'calc(72px + env(safe-area-inset-bottom))',
        }}
      >
        {/* Back */}
        <div className="max-w-3xl mx-auto px-4 sm:px-8 pt-6 pb-2">
          <button
            onClick={(): void => setSelectedStory(null)}
            className="flex items-center gap-2 bg-transparent border-none cursor-pointer min-h-11 hover:opacity-70 transition-opacity"
            style={{ color: '#0D7377', fontSize: '14px' }}
          >
            <ArrowLeft size={18} />
            Voltar às histórias
          </button>
        </div>

        {/* Hero */}
        <div className="relative h-75 sm:h-105 overflow-hidden">
          <ImageWithFallback src={selectedStory.img} alt={selectedStory.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-10 max-w-3xl mx-auto">
            <span
              className="inline-block px-3 py-1 rounded-full font-bold uppercase tracking-wider mb-4 text-white"
              style={{ backgroundColor: catColor, fontSize: '11px' }}
            >
              {selectedStory.category}
            </span>
            <h1
              className="font-['Fjalla_One'] text-white leading-tight mb-2"
              style={{ fontSize: 'clamp(22px, 4vw, 36px)' }}
            >
              {selectedStory.title}
            </h1>
          </div>
        </div>

        {/* Meta */}
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-5 border-b" style={{ borderColor: '#D9D9D9' }}>
          <p style={{ color: '#8A8A8A', fontSize: '13px' }}>
            Por <strong style={{ color: '#1A1A1A' }}>{selectedStory.author}</strong> · {selectedStory.date}
          </p>
        </div>

        {/* Body */}
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
          <p
            className="mb-8 leading-relaxed font-medium"
            style={{ color: '#1A1A1A', fontSize: '18px', lineHeight: 1.7 }}
          >
            {selectedStory.intro}
          </p>

          {selectedStory.body.map((paragraph: string, i: number): JSX.Element => (
            <div key={i}>
              {i === 1 && (
                <div className="my-8">
                  <div className="rounded-[14px] overflow-hidden mb-2">
                    <ImageWithFallback src={selectedStory.relatedImg} alt="Ilustração" className="w-full max-h-85 object-cover" />
                  </div>
                  <p style={{ color: '#8A8A8A', fontSize: '13px' }} className="text-center italic">
                    {selectedStory.imgCaption}
                  </p>
                </div>
              )}
              <p
                className="mb-6"
                style={{ color: '#4A4A4A', fontSize: '16px', lineHeight: 1.9 }}
              >
                {paragraph}
              </p>
            </div>
          ))}
        </div>

        {/* More stories */}
        <div className="bg-(--cinza-leve) py-12 px-4 sm:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-['Fjalla_One'] mb-6" style={{ color: '#1A1A1A', fontSize: '24px' }}>
              Explore mais histórias
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map((s: Story): JSX.Element => (
                <button
                  key={s.id}
                  onClick={(): void => setSelectedStory(s)}
                  className="text-left bg-white rounded-[14px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)]
                             hover:shadow-[0_6px_24px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 transition-all duration-200
                             border-none cursor-pointer"
                >
                  <div className="aspect-video overflow-hidden">
                    <ImageWithFallback src={s.img} alt={s.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <span className="text-[#0D7377] font-bold uppercase tracking-wider block mb-1.5" style={{ fontSize: '10px' }}>
                      {s.category}
                    </span>
                    <p className="font-semibold leading-tight" style={{ color: '#1A1A1A', fontSize: '14px' }}>
                      {s.title}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Pin Component ────────────────────────────────────────────
  const CategoryPin = ({ Icon, isActive }: { Icon: LucideIcon; isActive?: boolean }): JSX.Element => (
    <div className="relative flex items-center justify-center" style={{ width: 28, height: 36 }}>
      {/* Pin shape */}
      <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M14 0C6.26801 0 0 6.26801 0 14C0 21.732 14 36 14 36C14 36 28 21.732 28 14C28 6.26801 21.732 0 14 0Z"
          fill={isActive ? '#0D7377' : '#D9D9D9'}
          style={{ transition: 'fill 0.2s' }}
        />
      </svg>
      {/* Icon inside pin */}
      <div className="absolute" style={{ top: 6 }}>
        <Icon size={14} color="#FFFFFF" strokeWidth={2.5} />
      </div>
    </div>
  );

  // ── Main Screen ────────────────────────────────────────────
  const TABS: { id: CulturaTab; label: string; Icon: LucideIcon }[] = [
    { id: 'artistas', label: 'Sergipanidade', Icon: Palette },
    { id: 'historias', label: 'Histórias', Icon: BookOpen },
    { id: 'eventos', label: 'Eventos', Icon: Tent },
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--branco)',
        paddingTop: 'calc(0px + env(safe-area-inset-top))',
        paddingBottom: 'calc(72px + env(safe-area-inset-bottom))',
      }}
    >
      {/* ── HEADER ESTÁTICO ── */}
      <div className="relative w-full h-120 overflow-hidden flex items-center justify-center">
        {/* Foto de fundo */}
        <ImageWithFallback
          src={IMG_CULTURA_HERO}
          alt="Cultura Sergipana"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay escuro */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.65) 100%)' }}
        />

        {/* Conteúdo centralizado */}
        <div className="relative z-10 w-full flex flex-col items-center justify-center text-center px-5 sm:px-12 mt-4">

          {/* Tag superior */}
          <div
            className="flex items-center font-bold mb-4"
            style={{
              color: '#0D7377',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}
          ></div>

          {/* Título */}
          <h1
            className="text-white mb-4 leading-tight font-bold"
            style={{ fontSize: 'clamp(32px, 6vw, 52px)', maxWidth: '700px' }}
          >
            A alma de Sergipe em forma de arte e história
          </h1>

          {/* Subtítulo */}
          <p
            className="mb-10 mx-auto leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.75)', fontSize: '17px', maxWidth: '600px' }}
          >
            Conheça os artistas, as histórias e os eventos que fazem Sergipe único
          </p>

          {/* Search bar */}
          <div className="flex gap-2 w-full mx-auto" style={{ maxWidth: '560px' }}>
            <div className="relative flex-1 bg-white flex items-center shadow-lg" style={{ borderRadius: '8px' }}>
              <Search size={18} className="absolute left-4 pointer-events-none" style={{ color: '#8A8A8A' }} />
              <input
                type="text"
                placeholder="Buscar artista, história, evento..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 h-12.5 outline-none border-none bg-transparent"
                style={{ color: '#1A1A1A', fontSize: '15px', borderRadius: '8px' }}
              />
            </div>
            <button
              onClick={(): void => onToast(`Buscando: "${searchTerm}"`)}
              className="px-6 font-bold tracking-widest uppercase border-none cursor-pointer transition-colors flex items-center justify-center"
              style={{ backgroundColor: '#0D7377', color: '#FFFFFF', fontSize: '14px', minWidth: '120px', minHeight: '50px', borderRadius: '8px' }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>): void => { e.currentTarget.style.backgroundColor = '#0A5E62'; }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>): void => { e.currentTarget.style.backgroundColor = '#0D7377'; }}
            >
              EXPLORAR
            </button>
          </div>
        </div>
      </div>

      {/* ── STICKY TABS ── */}
      <div
        ref={tabsRef}
        className="z-80 bg-white overflow-x-auto"
        style={{
          top: 'calc(56px + env(safe-area-inset-top))',
          borderBottom: '1px solid #D9D9D9',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <div className="flex max-w-5xl mx-auto px-4 sm:px-8">
          {TABS.map(({ id, label, Icon }: { id: CulturaTab; label: string; Icon: LucideIcon }): JSX.Element => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={(): void => setActiveTab(id)}
                className="relative flex items-center gap-2.5 px-4 sm:px-5 py-4 whitespace-nowrap
                           bg-transparent border-none cursor-pointer min-h-13 transition-colors"
                style={{ color: isActive ? '#0D7377' : '#8A8A8A' }}
              >
                <CategoryPin Icon={Icon} isActive={isActive} />
                <span style={{
                  fontFamily: 'Urbanist, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  letterSpacing: '0.02em'
                }}>
                  {label}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-full" style={{ backgroundColor: '#0D7377' }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">

        {/* ── ARTISTAS ── */}
        {activeTab === 'artistas' && (
          <div>




            {/* Artists grid */}
            {filteredArtists.length === 0 ? (
              <div className="text-center py-20" style={{ color: '#8A8A8A' }}>
                <Shapes size={40} className="mx-auto mb-3 opacity-30" />
                <p style={{ fontSize: '16px' }}>Nenhum artista encontrado</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredArtists.map((artist: Artist): JSX.Element => (
                  <div
                    key={artist.id}
                    className="bg-white rounded-[14px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)]
                               hover:shadow-[0_6px_24px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {/* Photo */}
                    <div className="aspect-4/3 overflow-hidden relative">
                      <ImageWithFallback
                        src={artist.photo}
                        alt={artist.name}
                        className="w-full h-full object-cover"
                      />
                      {/* Badge */}
                      <div
                        className="absolute top-3 left-3 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider"
                        style={{ backgroundColor: '#EEEDE9', color: '#1A1A1A', fontSize: '10px' }}
                      >
                        {artist.linguagem.toUpperCase()}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <h3 className="font-semibold mb-1" style={{ color: '#1A1A1A', fontSize: '16px' }}>
                        {artist.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mb-3" style={{ color: '#0D7377', fontSize: '13px' }}>
                        <MapPin size={13} />
                        <span>{artist.city}</span>
                      </div>
                      <p className="mb-3 line-clamp-2" style={{ color: '#4A4A4A', fontSize: '13px', lineHeight: 1.6 }}>
                        {artist.bio}
                      </p>
                      <p className="mb-4" style={{ color: '#8A8A8A', fontSize: '12px' }}>
                        {artist.awards} · {artist.years}
                      </p>
                      <button
                        onClick={(): void => setSelectedArtist(artist)}
                        className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer font-semibold min-h-9 transition-colors hover:gap-2.5"
                        style={{ color: '#0D7377', fontSize: '13px' }}
                      >
                        Ver perfil completo
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── HISTÓRIAS ── */}
        {activeTab === 'historias' && (
          <div>
            <div className="mb-8">
              <h2 className="font-['Fjalla_One'] mb-1" style={{ color: '#1A1A1A', fontSize: '28px' }}>
                Raízes Sergipanas
              </h2>
              <p style={{ color: '#4A4A4A', fontSize: '15px' }}>
                Lendas, tradições e personagens que moldaram a identidade de Sergipe
              </p>
            </div>

            <div className="flex flex-col gap-8">
              {filteredStories.map((story: Story, i: number): JSX.Element => {
                const imageLeft = i % 2 === 0;
                return (
                  <div
                    key={story.id}
                    className={`bg-white rounded-[14px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)]
                                hover:shadow-[0_6px_24px_rgba(0,0,0,0.10)] transition-shadow
                                flex flex-col ${imageLeft ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}
                  >
                    {/* Image — 45% */}
                    <div className="sm:w-[45%] h-55 sm:h-auto overflow-hidden shrink-0">
                      <ImageWithFallback
                        src={story.img}
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
                      <span
                        className="inline-block mb-3 px-3 py-1 rounded-full font-bold uppercase tracking-wider w-fit"
                        style={{ backgroundColor: 'rgba(13,115,119,0.10)', color: '#0D7377', fontSize: '11px' }}
                      >
                        {story.category}
                      </span>
                      <h3
                        className="font-['Fjalla_One'] mb-3 leading-tight"
                        style={{ color: '#1A1A1A', fontSize: '22px' }}
                      >
                        {story.title}
                      </h3>
                      <p
                        className="mb-4 line-clamp-3"
                        style={{ color: '#4A4A4A', fontSize: '14px', lineHeight: 1.7 }}
                      >
                        {story.intro}
                      </p>
                      <p className="mb-5" style={{ color: '#8A8A8A', fontSize: '12px' }}>
                        Por <strong style={{ color: '#1A1A1A' }}>{story.author}</strong> · {story.date}
                      </p>
                      <button
                        onClick={(): void => setSelectedStory(story)}
                        className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer font-semibold min-h-9 transition-all hover:gap-2.5 w-fit"
                        style={{ color: '#0D7377', fontSize: '14px' }}
                      >
                        Ler história completa
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── EVENTOS ── */}
        {activeTab === 'eventos' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="font-['Fjalla_One'] mb-1" style={{ color: '#1A1A1A', fontSize: '28px' }}>
                  Agenda Cultural
                </h2>
                <p style={{ color: '#4A4A4A', fontSize: '15px' }}>
                  Festivais, exposições, shows e celebrações em Sergipe
                </p>
              </div>
              {/* View toggle */}
              <div className="flex rounded-[10px] overflow-hidden border" style={{ borderColor: '#D9D9D9' }}>
                {(['lista', 'calendario'] as const).map((v: 'lista' | 'calendario'): JSX.Element => (
                  <button
                    key={v}
                    onClick={(): void => setEventsView(v)}
                    className="px-4 py-2 capitalize border-none cursor-pointer transition-colors min-h-10"
                    style={{
                      backgroundColor: eventsView === v ? '#0D7377' : '#FFFFFF',
                      color: eventsView === v ? '#FFFFFF' : '#4A4A4A',
                      fontSize: '13px',
                    }}
                  >
                    {v === 'lista' ? '☰ Lista' : '🗓 Calendário'}
                  </button>
                ))}
              </div>
            </div>



            {eventsView === 'lista' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {filteredEvents.length === 0 ? (
                  <div className="col-span-2 text-center py-20" style={{ color: '#8A8A8A' }}>
                    <Ticket size={40} className="mx-auto mb-3 opacity-30" />
                    <p style={{ fontSize: '16px' }}>Nenhum evento encontrado com esses filtros</p>
                  </div>
                ) : filteredEvents.map((event: CulturaEvent): JSX.Element => (
                  <div
                    key={event.id}
                    className="bg-white rounded-[14px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)]
                               hover:shadow-[0_6px_24px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {/* Image */}
                    <div className="relative aspect-video overflow-hidden">
                      <ImageWithFallback src={event.img} alt={event.name} className="w-full h-full object-cover" />
                      {/* Type badge */}
                      <div
                        className="absolute top-3 left-3 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider"
                        style={{ backgroundColor: '#EEEDE9', color: '#1A1A1A', fontSize: '10px' }}
                      >
                        {event.type.toUpperCase()}
                      </div>
                      {event.free && (
                        <div
                          className="absolute top-3 right-3 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider"
                          style={{ backgroundColor: '#E6F4F4', color: '#0D7377', fontSize: '10px' }}
                        >
                          GRATUITO
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      {/* Date */}
                      <div className="flex items-baseline gap-1.5 mb-3">
                        <span className="font-['Fjalla_One']" style={{ color: '#0D7377', fontSize: '28px', lineHeight: 1 }}>
                          {event.day}
                        </span>
                        <span className="font-bold uppercase" style={{ color: '#0D7377', fontSize: '14px' }}>
                          {event.month}
                        </span>
                      </div>

                      <h3 className="font-semibold mb-2 leading-tight" style={{ color: '#1A1A1A', fontSize: '16px' }}>
                        {event.name}
                      </h3>

                      <div className="flex items-center gap-1.5 mb-3" style={{ color: '#0D7377', fontSize: '13px' }}>
                        <MapPin size={13} />
                        <span>{event.local} · {event.city}</span>
                      </div>

                      <p className="mb-4 line-clamp-2" style={{ color: '#4A4A4A', fontSize: '13px', lineHeight: 1.6 }}>
                        {event.desc}
                      </p>

                      <button
                        onClick={(): void => onToast(`🎟️ Saiba mais: ${event.name}`)}
                        className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer font-semibold min-h-9 transition-all hover:gap-2.5"
                        style={{ color: '#0D7377', fontSize: '13px' }}
                      >
                        Saiba mais
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Calendário view — simplified */
              <div className="bg-white rounded-[14px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                <div className="text-center mb-6">
                  <h3 className="font-['Fjalla_One']" style={{ color: '#1A1A1A', fontSize: '22px' }}>
                    Junho / Julho 2025
                  </h3>
                </div>
                <div className="space-y-3">
                  {filteredEvents.sort((a: CulturaEvent, b: CulturaEvent) => parseInt(a.day) - parseInt(b.day)).map((event: CulturaEvent): JSX.Element => (
                    <div
                      key={event.id}
                      className="flex items-center gap-4 p-4 rounded-[10px] hover:bg-(--cinza-leve) transition-colors cursor-pointer"
                      onClick={(): void => onToast(`📅 ${event.name}`)}
                    >
                      <div
                        className="shrink-0 w-14 h-14 rounded-[10px] flex flex-col items-center justify-center"
                        style={{ backgroundColor: '#F5EDE6' }}
                      >
                        <span className="font-['Fjalla_One']" style={{ color: '#0D7377', fontSize: '20px', lineHeight: 1 }}>
                          {event.day}
                        </span>
                        <span className="font-bold uppercase" style={{ color: '#0D7377', fontSize: '10px' }}>
                          {event.month}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate" style={{ color: '#1A1A1A', fontSize: '15px' }}>
                          {event.name}
                        </p>
                        <p className="truncate" style={{ color: '#8A8A8A', fontSize: '13px' }}>
                          {event.local} · {event.city}
                        </p>
                      </div>
                      <span
                        className="shrink-0 px-2.5 py-1 rounded-full font-bold uppercase"
                        style={{ backgroundColor: '#EEEDE9', color: '#1A1A1A', fontSize: '10px' }}
                      >
                        {event.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}


      </div>
    </div>
  );
}
