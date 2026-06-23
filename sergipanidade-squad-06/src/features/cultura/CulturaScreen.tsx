import { useState, useEffect, useRef } from 'react';
import { useToast } from "@/context/AppContext";
import { translations, TranslationKeys } from "@/constants/translations";
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

import { mockService } from "@/services/mock.service";



// ─── LANGUAGE ICONS MAP ───────────────────────────────────────

// Helper to translate artist disciplines
const getLinguagemTraduzida = (linguagem: string, t: TranslationKeys): string => {
  const norm = linguagem.trim();
  switch (norm) {
    case 'Música': return t.linguagemMusica || linguagem;
    case 'Literatura e Filosofia': return t.linguagemLiteraturaFilosofia || linguagem;
    case 'Dança': return t.linguagemDanca || linguagem;
    case 'Escultura': return t.linguagemEscultura || linguagem;
    case 'Artesanato': return t.linguagemArtesanato || linguagem;
    case 'Cultura Popular': return t.linguagemCulturaPopular || linguagem;
    default: return linguagem;
  }
};

// Helper to translate story categories
const getStoryCategoryTraduzida = (category: string, t: TranslationKeys): string => {
  const norm = category.toUpperCase().trim();
  switch (norm) {
    case 'FOLCLORE': return t.categoryFolclore || category;
    case 'TRADIÇÃO': return t.categoryTradicao || category;
    case 'PERSONALIDADE': return t.categoryPersonalidade || category;
    case 'GASTRONOMIA': return t.categoryGastronomia || category;
    case 'PATRIMÔNIO IMATERIAL': return t.categoryPatrimonioImaterial || category;
    default: return category;
  }
};

// Helper to translate date strings containing Portuguese months
const getDateTraduzida = (dateStr: string, language: string): string => {
  if (!dateStr) return '';
  const cleanLang = language === 'sp' ? 'pt' : language;
  if (cleanLang === 'pt') return dateStr;

  const ptMonths = [
    { pt: ['janeiro', 'jan'], en: 'January', es: 'enero' },
    { pt: ['fevereiro', 'fev'], en: 'February', es: 'febrero' },
    { pt: ['março', 'mar'], en: 'March', es: 'marzo' },
    { pt: ['abril', 'abr'], en: 'April', es: 'abril' },
    { pt: ['maio', 'mai'], en: 'May', es: 'mayo' },
    { pt: ['junho', 'jun'], en: 'June', es: 'junio' },
    { pt: ['julho', 'jul'], en: 'July', es: 'julio' },
    { pt: ['agosto', 'ago'], en: 'August', es: 'agosto' },
    { pt: ['setembro', 'set'], en: 'September', es: 'septiembre' },
    { pt: ['outubro', 'out'], en: 'October', es: 'octubre' },
    { pt: ['novembro', 'nov'], en: 'November', es: 'noviembre' },
    { pt: ['dezembro', 'dez'], en: 'December', es: 'diciembre' }
  ];

  const lower = dateStr.toLowerCase();
  for (const item of ptMonths) {
    for (const ptForm of item.pt) {
      if (lower.includes(ptForm)) {
        const replacement = cleanLang === 'en' ? item.en : item.es;
        const regex = new RegExp(ptForm, 'i');
        let targetRepl = replacement;
        if (ptForm.length === 3) {
          targetRepl = replacement.slice(0, 3);
          if (cleanLang === 'en') {
            targetRepl = targetRepl.charAt(0).toUpperCase() + targetRepl.slice(1);
          } else {
            targetRepl = targetRepl.toLowerCase();
          }
        } else {
          if (cleanLang === 'en') {
            targetRepl = replacement.charAt(0).toUpperCase() + replacement.slice(1);
          } else {
            targetRepl = replacement.toLowerCase();
          }
        }
        return dateStr.replace(regex, targetRepl);
      }
    }
  }

  return dateStr;
};

// ─── COMPONENT ───────────────────────────────────────────────
interface CulturaScreenProps {
  language?: 'pt' | 'en' | 'es' | 'sp';
}

export function CulturaScreen({ language = 'pt' }: CulturaScreenProps): JSX.Element {
  const cleanLanguage = language === 'sp' ? 'pt' : language;
  const t = translations[cleanLanguage];
  const { toast: onToast } = useToast();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [events, setEvents] = useState<CulturaEvent[]>([]);

  useEffect(() => {
    mockService.cultura.getArtists().then(setArtists);
    mockService.cultura.getStories().then(setStories);
    mockService.cultura.getEvents().then(setEvents);
  }, []);

  const [activeTab, setActiveTab] = useState<CulturaTab>('artistas');

  const [eventsView, setEventsView] = useState<'lista' | 'calendario'>('lista');
  const [searchTerm, setSearchTerm] = useState('');

  const translatedArtists = artists.map((artist: Artist): Artist => {
    const data = (t as any).artistsData?.[artist.id];
    if (!data) return artist;
    return {
      ...artist,
      bio: data.bio || artist.bio,
      bioFull: data.bioFull || artist.bioFull,
      awards: data.awards || artist.awards,
      years: data.years || artist.years,
      works: artist.works.map((work, idx) => {
        const wData = data.works?.[idx];
        if (!wData) return work;
        return {
          ...work,
          title: wData.title || work.title,
          desc: wData.desc || work.desc,
          tecnica: wData.tecnica || work.tecnica,
        };
      }),
    };
  });

  const translatedStories = stories.map((story: Story): Story => {
    const data = (t as any).storiesData?.[story.id];
    if (!data) return story;
    return {
      ...story,
      title: data.title || story.title,
      intro: data.intro || story.intro,
      imgCaption: data.imgCaption || story.imgCaption,
      body: data.body || story.body,
    };
  });

  const translatedEvents = events.map((event: CulturaEvent): CulturaEvent => {
    const data = (t as any).eventsData?.[event.id];
    const monthKey = `month${event.month.charAt(0).toUpperCase()}${event.month.slice(1).toLowerCase()}`;
    const translatedMonth = (t as any)[monthKey] || event.month;
    if (!data) return { ...event, month: translatedMonth };
    return {
      ...event,
      name: data.name || event.name,
      type: data.type || event.type,
      local: data.local || event.local,
      city: data.city || event.city,
      desc: data.desc || event.desc,
      month: translatedMonth,
    };
  });

  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);

  const selectedArtist = translatedArtists.find((a): boolean => a.id === selectedArtistId) || null;
  const selectedStory = translatedStories.find((s): boolean => s.id === selectedStoryId) || null;

  const setSelectedArtist = (artist: Artist | null): void => setSelectedArtistId(artist ? artist.id : null);
  const setSelectedStory = (story: Story | null): void => setSelectedStoryId(story ? story.id : null);

  const [selectedArtwork, setSelectedArtwork] = useState<Artist['works'][0] | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect((): void => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedArtist, selectedStory]);

  const filteredArtists = translatedArtists.filter((a: Artist): boolean => {
    const matchSearch = !searchTerm || a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.city.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const filteredEvents = translatedEvents.filter((e: CulturaEvent): boolean => {
    const matchSearch = !searchTerm || e.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const filteredStories = translatedStories.filter((s: Story): boolean =>
    !searchTerm || s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Artist Detail ──────────────────────────────────────────
  if (selectedArtist) {
    const related = translatedArtists.filter((a: Artist): boolean => a.id !== selectedArtist.id).slice(0, 3);
    return (
      <div
        className="min-h-screen"
        style={{
          backgroundColor: 'var(--branco)',
          paddingTop: 'calc(var(--navbar-height) + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {/* Cover */}
        <div className="relative h-80 sm:h-100 overflow-hidden">
          <ImageWithFallback src={selectedArtist.coverPhoto} alt="Capa" className="w-full h-full object-cover object-[center_30%]" />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Back button */}
          <div className="absolute top-5 left-4 sm:left-8 z-10">
            <button
              onClick={(): void => setSelectedArtist(null)}
              className="flex items-center gap-2 bg-black/40 hover:bg-black/60 text-white border-none rounded-full px-4.5 py-2 cursor-pointer transition-colors min-h-[40px] shadow-md"
              style={{ fontSize: '14px' }}
            >
              <ArrowLeft size={18} />
              {t.backToSergipanidade}
            </button>
          </div>
        </div>

        {/* Header info */}
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="relative flex items-end gap-5 -mt-14 mb-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-lg shrink-0 bg-(--cinza-leve)">
              <ImageWithFallback src={selectedArtist.photo} alt={selectedArtist.name} className="w-full h-full object-cover" />
            </div>
            <div className="pb-1">
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <h1 className="font-semibold font-display tracking-tight text-[#0D7377] drop-shadow-lg" style={{ fontSize: '28px' }}>
                  {selectedArtist.name}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-1 rounded-full text-white font-bold uppercase tracking-wider"
                  style={{ backgroundColor: '#0D7377', fontSize: '11px' }}
                >
                  {getLinguagemTraduzida(selectedArtist.linguagem, t).toUpperCase()}
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
          <h2 className="font-semibold font-display tracking-tight mb-1" style={{ color: '#1A1A1A', fontSize: '22px' }}>
            {t.featuredWorks}
          </h2>
          <p className="mb-5" style={{ color: '#8A8A8A', fontSize: '14px' }}>
            {t.clickToEnlarge}
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
              {t.whereToFind}
            </h3>
            <div className="flex flex-wrap gap-3">
              {[
                { icon: Instagram, label: selectedArtist.instagram, href: '#' },
                { icon: Globe, label: t.personalWebsite, href: '#' },
                { icon: Mail, label: 'E-mail', href: '#' },
              ].map(({ icon: Icon, label, href }: { icon: LucideIcon; label: string; href: string }): JSX.Element => (
                <a
                  key={label}
                  href={href}
                  onClick={(e: React.MouseEvent<HTMLAnchorElement>): void => { e.preventDefault(); }}
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
          <h2 className="font-semibold font-display tracking-tight mb-5" style={{ color: '#1A1A1A', fontSize: '22px' }}>
            {t.otherArtistsTitle}
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
                  <p style={{ color: '#8A8A8A', fontSize: '12px' }}>{getLinguagemTraduzida(a.linguagem, t)} · {a.city}</p>
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
                <h3 className="font-semibold font-display tracking-tight mb-1" style={{ color: '#1A1A1A', fontSize: '22px' }}>
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
    const related = translatedStories.filter((s: Story): boolean => s.id !== selectedStory.id).slice(0, 3);
    const catColor = '#0D7377';
    return (
      <div
        className="min-h-screen"
        style={{
          backgroundColor: 'var(--branco)',
          paddingTop: 'calc(var(--navbar-height) + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {/* Hero */}
        <div className="relative h-75 sm:h-105 overflow-hidden">
          <ImageWithFallback src={selectedStory.img} alt={selectedStory.title} className="w-full h-full object-cover object-[center_30%]" />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
          
          {/* Back button */}
          <div className="absolute top-5 left-4 sm:left-8 z-10">
            <button
              onClick={(): void => setSelectedStory(null)}
              className="flex items-center gap-2 bg-black/40 hover:bg-black/60 text-white border-none rounded-full px-4.5 py-2 cursor-pointer transition-colors min-h-[40px] shadow-md"
              style={{ fontSize: '14px' }}
            >
              <ArrowLeft size={18} />
              {t.backToStories}
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-10 max-w-3xl mx-auto">
            <span
              className="inline-block px-3 py-1 rounded-full font-bold uppercase tracking-wider mb-4 text-white"
              style={{ backgroundColor: catColor, fontSize: '11px' }}
            >
              {getStoryCategoryTraduzida(selectedStory.category, t).toUpperCase()}
            </span>
            <h1
              className="font-semibold font-display text-white leading-tight mb-2"
              style={{ fontSize: 'clamp(22px, 4vw, 36px)' }}
            >
              {selectedStory.title}
            </h1>
          </div>
        </div>

        {/* Meta */}
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-5 border-b" style={{ borderColor: '#D9D9D9' }}>
          <p style={{ color: '#8A8A8A', fontSize: '13px' }}>
            {t.byAuthor} <strong style={{ color: '#1A1A1A' }}>{selectedStory.author}</strong> · {getDateTraduzida(selectedStory.date, language)}
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
            <h2 className="font-semibold font-display tracking-tight mb-6" style={{ color: '#1A1A1A', fontSize: '24px' }}>
              {t.exploreMoreStories}
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
                      {getStoryCategoryTraduzida(s.category, t).toUpperCase()}
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
    { id: 'artistas', label: t.tabSergipanidade, Icon: Palette },
    { id: 'historias', label: t.tabStories, Icon: BookOpen },
    { id: 'eventos', label: t.tabEvents, Icon: Tent },
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--branco)',
        paddingTop: 'calc(var(--navbar-height) + env(safe-area-inset-top, 0px))',
        paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
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
        <div className="relative z-10 w-full flex flex-col items-center justify-center text-center px-5 sm:px-12">

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
            {t.culturaTitle}
          </h1>

          {/* Subtítulo */}
          <p
            className="mb-10 mx-auto leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.75)', fontSize: '17px', maxWidth: '600px' }}
          >
            {t.culturaSubtitle}
          </p>
        </div>
      </div>

      {/* ── STICKY TABS ── */}
      <div
        ref={tabsRef}
        className="sticky z-80 bg-white overflow-x-auto"
        style={{
          top: 'calc(var(--navbar-height) + env(safe-area-inset-top, 0px))',
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
                  fontFamily: "var(--font-display)",
                  fontSize: '14px',
                  fontWeight: 600,
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
                <p style={{ fontSize: '16px' }}>{t.noArtistsFound}</p>
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
                        {getLinguagemTraduzida(artist.linguagem, t).toUpperCase()}
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
                        {t.viewFullProfile}
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
              <h2 className="font-semibold font-display tracking-tight mb-1" style={{ color: '#1A1A1A', fontSize: '28px' }}>
                {t.rootsSergipanas}
              </h2>
              <p style={{ color: '#4A4A4A', fontSize: '15px' }}>
                {t.rootsSubtitle}
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
                        {getStoryCategoryTraduzida(story.category, t).toUpperCase()}
                      </span>
                      <h3
                        className="font-semibold font-display tracking-tight mb-3 leading-tight"
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
                        {t.byAuthor} <strong style={{ color: '#1A1A1A' }}>{story.author}</strong> · {getDateTraduzida(story.date, language)}
                      </p>
                      <button
                        onClick={(): void => setSelectedStory(story)}
                        className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer font-semibold min-h-9 transition-all hover:gap-2.5 w-fit"
                        style={{ color: '#0D7377', fontSize: '14px' }}
                      >
                        {t.readFullStory}
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
                <h2 className="font-semibold font-display tracking-tight mb-1" style={{ color: '#1A1A1A', fontSize: '28px' }}>
                  {t.culturalAgenda}
                </h2>
                <p style={{ color: '#4A4A4A', fontSize: '15px' }}>
                  {t.culturalAgendaSubtitle}
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
                    {v === 'lista' ? t.viewList : t.viewCalendar}
                  </button>
                ))}
              </div>
            </div>



            {eventsView === 'lista' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {filteredEvents.length === 0 ? (
                  <div className="col-span-2 text-center py-20" style={{ color: '#8A8A8A' }}>
                    <Ticket size={40} className="mx-auto mb-3 opacity-30" />
                    <p style={{ fontSize: '16px' }}>{t.noEventsFound}</p>
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
                          {t.freeBadge}
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      {/* Date */}
                      <div className="flex items-baseline gap-1.5 mb-3">
                        <span className="font-semibold font-display" style={{ color: '#0D7377', fontSize: '28px', lineHeight: 1 }}>
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

                      <p className="mb-4" style={{ color: '#4A4A4A', fontSize: '13px', lineHeight: 1.6 }}>
                        {event.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Calendário view — simplified */
              <div className="bg-white rounded-[14px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                <div className="text-center mb-6">
                  <h3 className="font-semibold font-display tracking-tight" style={{ color: '#1A1A1A', fontSize: '22px' }}>
                    {language === 'en' ? 'June / July 2025' : language === 'es' ? 'Junio / Julio 2025' : 'Junho / Julho 2025'}
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
                        <span className="font-semibold font-display" style={{ color: '#0D7377', fontSize: '20px', lineHeight: 1 }}>
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
