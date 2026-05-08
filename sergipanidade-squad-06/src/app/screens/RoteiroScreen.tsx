import { useState, useEffect, useRef, ReactNode } from "react";
import {
  Sparkles,
  MapPin,
  Clock,
  GripVertical,
  Car,
  Plus,
  Share2,
  Calendar,
  FileText,
  RefreshCcw,
  ChevronDown,
  Bot,
  Trash2,
  Navigation2,
  Eye,
  Check,
  Waves,
  Landmark,
  UtensilsCrossed,
  TreePine,
  ShoppingBag,
  Music,
  Camera,
  PawPrint,
  User,
  Heart,
  Users,
  UserPlus,
  PiggyBank,
  Wallet,
  Gem,
} from "lucide-react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { getDestinationById, destinations } from "../data/destinations";
import type { Destination } from "../data/destinations";
import { translations } from "../data/translations";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import SergipeCulturalBg from "../../imports/fundo-roteiro.png";

const BackgroundWrapper = ({ children, className = "" }: { children: ReactNode, className?: string }) => {
  return (
    <div
      className={`relative w-full min-h-screen bg-[#F7F6F3] ${className}`}
      style={{
        backgroundImage: `url(${SergipeCulturalBg})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Semi-transparent overlay for readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(247, 246, 243, 0.70)',
          zIndex: 0,
        }}
      />
      {/* Content layer */}
      <div style={{ position: 'relative', zIndex: 1 }} className="w-full h-full flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
};

/* ─────────────────── Types ─────────────────── */
interface RoteiroItem {
  destinationId: string;
  time?: string;
  note?: string;
}

interface ParadaGerada {
  destinationId: string;
  dia: number;
  periodo: string;
  dica: string;
}

interface WizardData {
  who: string;
  days: number;
  startDate: string;
  interests: string[];
  budget: string;
}

interface RoteiroScreenProps {
  onNavigate: (screen: string, destinationId?: string) => void;
  onToast: (message: string) => void;
  roteiro: RoteiroItem[];
  onAddToRoteiro: (destinationId: string, note?: string) => void;
  onRemoveFromRoteiro: (destinationId: string) => void;
  onSetRoteiro?: (roteiro: RoteiroItem[]) => void;
  onOpenGPS: (destinationId?: string) => void;
  language: "pt" | "en" | "es";
}

/* ─────────────── Interest mapping ─────────────── */
const INTEREST_CAT_MAP: Array<{ kw: string[]; cat: string }> = [
  { kw: ["praia", "beach", "playa", "praias"], cat: "PRAIA" },
  { kw: ["gastro", "food", "comida", "compras", "shopping", "mercado"], cat: "GASTRONOMIA" },
  { kw: ["cultur", "arte", "art", "musica", "music", "música"], cat: "CULTURA" },
  { kw: ["histor", "history", "historia", "patrimoni"], cat: "HISTÓRIA" },
  { kw: ["nature", "naturez", "natural", "eco", "foto", "photo"], cat: "NATUREZA" },
  { kw: ["pet", "animal", "bicho"], cat: "PET FRIENDLY" },
];

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/* ─────────────── Local itinerary generator ─────────────── */
function generateLocal(data: WizardData, lang: "pt" | "en" | "es"): ParadaGerada[] {
  const numParadas = Math.min(data.days * 3, destinations.length);
  const matched = new Set<string>();
  data.interests.forEach((i) => {
    const n = norm(i);
    INTEREST_CAT_MAP.forEach(({ kw, cat }) => {
      if (kw.some((k) => n.includes(k))) matched.add(cat);
    });
  });
  const scored = destinations.map((d) => ({
    d,
    score: matched.size > 0 && [...matched].some((c) => d.category.toUpperCase().includes(c)) ? 2 : 1,
  }));
  scored.sort((a, b) => b.score - a.score);
  const selected = scored.slice(0, numParadas).map((s) => s.d);
  const periodos: Record<string, string[]> = {
    pt: ["manhã", "tarde", "noite"],
    en: ["morning", "afternoon", "evening"],
    es: ["mañana", "tarde", "noche"],
  };
  return selected.map((d, i) => {
    const dia = Math.floor(i / 3) + 1;
    const periodo = periodos[lang][i % 3];
    const rawTip =
      lang === "en" ? d.tip_en || d.tip : lang === "es" ? d.tip_es || d.tip : d.tip;
    const dica = (rawTip.split(/(?<=[.!?])\s/)[0] || rawTip).trim();
    return { destinationId: d.id, dia, periodo, dica };
  });
}

/* ─────────────── Time/distance helpers ─────────────── */
const PERIODO_TIME: Record<string, string> = {
  manhã: "09:00", morning: "09:00", mañana: "09:00",
  tarde: "14:00", afternoon: "14:00",
  noite: "19:00", evening: "19:00", noche: "19:00",
};
const PERIODO_DUR: Record<string, string> = {
  manhã: "2h", morning: "2h", mañana: "2h",
  tarde: "1h 30min", afternoon: "1h 30min",
  noite: "2h", evening: "2h", noche: "2h",
};

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function travelLabel(d1: Destination, d2: Destination) {
  const km = haversine(d1.lat, d1.lon, d2.lat, d2.lon);
  const mins = Math.round((km / 35) * 60);
  const kmStr = km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)} km`;
  const mStr = mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60 > 0 ? `${mins % 60}min` : ""}`.trim();
  return `${mStr} · ${kmStr}`;
}

function formatDayDate(startDate: string, dayOffset: number, lang: string) {
  const base = startDate ? new Date(startDate + "T12:00:00") : new Date();
  base.setDate(base.getDate() + dayOffset);
  const locale = lang === "pt" ? "pt-BR" : lang === "es" ? "es-ES" : "en-US";
  return base.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" });
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ─────────────── SVG Route Map ─────────────── */
function RoteiroMapSVG({ stops }: { stops: Destination[] }) {
  if (stops.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[var(--cinza-leve)] rounded-[var(--radius)]">
        <div className="text-center text-[var(--cinza-txt)] p-6">
          <MapPin size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Nenhuma parada no mapa</p>
        </div>
      </div>
    );
  }

  const W = 380, H = 440;
  const lats = stops.map((s) => s.lat);
  const lons = stops.map((s) => s.lon);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const padLat = Math.max((maxLat - minLat) * 0.32, 0.015);
  const padLon = Math.max((maxLon - minLon) * 0.32, 0.015);
  const bMinLat = minLat - padLat;
  const bMaxLat = maxLat + padLat;
  const bMinLon = minLon - padLon;
  const bMaxLon = maxLon + padLon;

  const px = (lon: number) => ((lon - bMinLon) / (bMaxLon - bMinLon)) * W;
  const py = (lat: number) => H - ((lat - bMinLat) / (bMaxLat - bMinLat)) * H;

  const routePts = stops.map((s) => `${px(s.lon)},${py(s.lat)}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-full"
      style={{ borderRadius: "var(--radius)" }}
    >
      {/* Background land */}
      <rect width={W} height={H} fill="#EEF3EA" />
      {/* Water stripe right */}
      <rect x={W * 0.8} y={0} width={W * 0.2} height={H} fill="#C8DFF0" opacity="0.7" />
      {/* Grid */}
      {[0.25, 0.5, 0.75].map((f) => (
        <g key={f}>
          <line x1={W * f} y1={0} x2={W * f} y2={H} stroke="#D5DFCF" strokeWidth="0.8" />
          <line x1={0} y1={H * f} x2={W} y2={H * f} stroke="#D5DFCF" strokeWidth="0.8" />
        </g>
      ))}
      {/* Route shadow */}
      <polyline
        points={routePts}
        fill="none"
        stroke="#00000015"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Route line */}
      <polyline
        points={routePts}
        fill="none"
        stroke="#F06030"
        strokeWidth="3"
        strokeDasharray="10 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Direction arrows (midpoints) */}
      {stops.slice(0, -1).map((s, i) => {
        const nx = stops[i + 1];
        const mx = (px(s.lon) + px(nx.lon)) / 2;
        const my = (py(s.lat) + py(nx.lat)) / 2;
        const angle = (Math.atan2(py(nx.lat) - py(s.lat), px(nx.lon) - px(s.lon)) * 180) / Math.PI;
        return (
          <text
            key={i}
            x={mx}
            y={my}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#F06030"
            fontSize="10"
            transform={`rotate(${angle}, ${mx}, ${my})`}
          >
            ▶
          </text>
        );
      })}
      {/* Pins */}
      {stops.map((s, i) => (
        <g key={s.id}>
          <circle cx={px(s.lon)} cy={py(s.lat)} r={17} fill="white" />
          <circle cx={px(s.lon)} cy={py(s.lat)} r={15} fill="#F06030" />
          <text
            x={px(s.lon)}
            y={py(s.lat) + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="11"
            fontWeight="700"
          >
            {i + 1}
          </text>
          {/* Label background */}
          <rect
            x={px(s.lon) - 35}
            y={py(s.lat) + 18}
            width={70}
            height={16}
            rx={4}
            fill="rgba(255,255,255,0.88)"
          />
          <text
            x={px(s.lon)}
            y={py(s.lat) + 26}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#18181B"
            fontSize="8"
            fontWeight="600"
          >
            {s.name.length > 12 ? s.name.slice(0, 12) + "…" : s.name}
          </text>
        </g>
      ))}
      {/* Compass */}
      <g transform={`translate(${W - 28}, 22)`}>
        <circle r={14} fill="white" fillOpacity="0.9" />
        <text textAnchor="middle" y={-4} fontSize="8" fill="#F06030" fontWeight="700">N</text>
        <line x1={0} y1={-10} x2={0} y2={10} stroke="#ddd" strokeWidth="1" />
        <line x1={-10} y1={0} x2={10} y2={0} stroke="#ddd" strokeWidth="1" />
      </g>
    </svg>
  );
}

/* ─────────────── Progress Bar ─────────────── */
function WizardProgress({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="flex-1 h-1.5 rounded-full transition-all duration-300"
          style={{ backgroundColor: i <= step ? "var(--primary)" : "var(--cinza-med)" }}
        />
      ))}
    </div>
  );
}

/* ─────────────── Main screen ─────────────── */
export function RoteiroScreen({
  onNavigate,
  onToast,
  roteiro,
  onAddToRoteiro,
  onRemoveFromRoteiro,
  onSetRoteiro,
  onOpenGPS,
  language,
}: RoteiroScreenProps) {
  const t = translations[language];

  type ViewState = "empty" | "wizard" | "generating" | "view";
  const [viewState, setViewState] = useState<ViewState>(() =>
    roteiro.length > 0 ? "view" : "empty"
  );
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardData, setWizardData] = useState<WizardData>({
    who: "",
    days: 3,
    startDate: new Date().toISOString().slice(0, 10),
    interests: [],
    budget: "",
  });
  const [generatedParadas, setGeneratedParadas] = useState<ParadaGerada[]>([]);
  const [openDays, setOpenDays] = useState<string[]>(["day-1"]);
  const generateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Keep view in sync when roteiro is populated externally */
  useEffect(() => {
    if (roteiro.length > 0 && viewState === "empty") {
      setViewState("view");
    }
  }, [roteiro.length]);

  /* ── Wizard helpers ── */
  const WHO_OPTIONS = [
    { value: "solo", icon: <User size={24} />, label: t.options.who.alone },
    { value: "casal", icon: <Heart size={24} />, label: t.options.who.couple },
    { value: "familia", icon: <Users size={24} />, label: t.options.who.family },
    { value: "grupo", icon: <UserPlus size={24} />, label: t.options.who.friends },
  ];

  const INTEREST_OPTIONS = [
    { value: "praias", icon: <Waves size={18} />, label: t.options.interests.beaches },
    { value: "cultura", icon: <Landmark size={18} />, label: t.options.interests.culture },
    { value: "gastronomia", icon: <UtensilsCrossed size={18} />, label: t.options.interests.gastronomy },
    { value: "natureza", icon: <TreePine size={18} />, label: t.options.interests.nature },
    { value: "compras", icon: <ShoppingBag size={18} />, label: t.interestCompras },
    { value: "musica", icon: <Music size={18} />, label: t.interestMusica },
    { value: "fotografia", icon: <Camera size={18} />, label: t.interestFotografia },
    { value: "pet", icon: <PawPrint size={18} />, label: t.options.interests.pet },
  ];

  const BUDGET_OPTIONS = [
    { value: "economico", icon: <PiggyBank size={18} />, label: t.budgetEco, desc: t.budgetEcoDesc },
    { value: "moderado", icon: <Wallet size={18} />, label: t.budgetMod, desc: t.budgetModDesc },
    { value: "premium", icon: <Gem size={18} />, label: t.budgetPremium, desc: t.budgetPremiumDesc },
  ];

  const canAdvance = () => {
    if (wizardStep === 0) return !!wizardData.who;
    if (wizardStep === 1) return wizardData.days >= 1;
    if (wizardStep === 2) return wizardData.interests.length > 0;
    if (wizardStep === 3) return !!wizardData.budget;
    return false;
  };

  const handleGenerate = async () => {
    setViewState("generating");
    generateTimerRef.current = setTimeout(() => {
      const paradas = generateLocal(wizardData, language);
      setGeneratedParadas(paradas);
      const newRoteiro = paradas.map((p) => ({
        destinationId: p.destinationId,
        note: p.dica,
      }));
      if (onSetRoteiro) onSetRoteiro(newRoteiro);
      else newRoteiro.forEach((r) => onAddToRoteiro(r.destinationId, r.note));
      setOpenDays(
        Array.from(
          new Set(paradas.map((p) => `day-${p.dia}`))
        )
      );
      onToast(t.itineraryGenerated);
      setViewState("view");
    }, 2200);
  };

  /* Cleanup on unmount */
  useEffect(() => {
    return () => { if (generateTimerRef.current) clearTimeout(generateTimerRef.current); };
  }, []);

  /* ── Timeline derived data ── */
  const timelineParadas: (ParadaGerada & { destination: Destination })[] = (() => {
    if (generatedParadas.length > 0 && generatedParadas.length === roteiro.length) {
      return generatedParadas
        .map((p) => ({ ...p, destination: getDestinationById(p.destinationId)! }))
        .filter((p) => p.destination);
    }
    // Fallback: build from roteiro with default day/period
    return roteiro
      .map((item, i) => {
        const dest = getDestinationById(item.destinationId);
        if (!dest) return null;
        const per = ["manhã", "tarde", "noite"][i % 3];
        return {
          destinationId: item.destinationId,
          dia: Math.floor(i / 3) + 1,
          periodo: per,
          dica: item.note || "",
          destination: dest,
        };
      })
      .filter(Boolean) as (ParadaGerada & { destination: Destination })[];
  })();

  const days = Array.from(new Set(timelineParadas.map((p) => p.dia))).sort((a, b) => a - b);
  const startDate = wizardData.startDate || new Date().toISOString().slice(0, 10);

  const allDayStops = (day: number) => timelineParadas.filter((p) => p.dia === day);

  const headerSubtitle = wizardData.who
    ? `Aracaju · ${wizardData.days} ${language === "pt" ? "dias" : language === "es" ? "días" : "days"} · ${WHO_OPTIONS.find((o) => o.value === wizardData.who)?.label || ""}`
    : `${roteiro.length} ${roteiro.length === 1 ? t.stopPlanned : t.stopsPlanned}`;

  /* ════════════════════════════════════════════
     RENDER: EMPTY STATE
  ═══════════════════════════════════════════ */
  if (viewState === "empty") {
    return (
      <BackgroundWrapper className="pt-[62px]">
        <div className="max-w-xl mx-auto px-4 py-16 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-[var(--secondary)] flex items-center justify-center mb-6 text-4xl">
            <MapPin size={24} style={{ color: '#0D7377' }} />
          </div>
          <h1 className="font-['Fjalla_One'] text-3xl text-[var(--preto)] mb-3">
            {t.emptyItinerary}
          </h1>
          <p className="text-[var(--cinza-txt)] text-sm mb-8 max-w-sm leading-relaxed">
            {t.emptyItineraryMessage}
          </p>

          {/* CTA Card */}
          <div className="w-full bg-gradient-to-br from-[var(--preto)] to-[#2A2A2E] rounded-[var(--radius)] p-7 text-left mb-6 shadow-[var(--sombra-lg)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <p className="font-['Fjalla_One'] text-white text-lg">{t.aiItineraryTitle}</p>
                <p className="text-white/60 text-xs">{t.aiItineraryDesc}</p>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-5">
              {language === "pt"
                ? "Responda 4 perguntas rápidas e nossa IA cria o roteiro ideal para você em Sergipe."
                : language === "en"
                ? "Answer 4 quick questions and our AI creates the ideal itinerary for you in Sergipe."
                : "Responde 4 preguntas rápidas y nuestra IA crea el itinerario ideal para ti en Sergipe."}
            </p>
            <button
              onClick={() => { setWizardStep(0); setViewState("wizard"); }}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#006064] text-white rounded-[var(--radius-sm)] font-bold text-sm hover:bg-[#004D51] transition-colors min-h-[44px]"
            >
              <Sparkles size={18} />
              {t.generateWithAI}
            </button>
          </div>

          <button
            onClick={() => onNavigate("guia")}
            className="w-full py-3.5 bg-[#006064] text-white rounded-[var(--radius-sm)] font-bold text-sm hover:bg-[#004D51] transition-colors min-h-[44px] mb-3"
          >
            {t.exploreDestinations}
          </button>

          <button
            onClick={() => onNavigate("guia")}
            className="w-full py-2.5 bg-[#006064] text-white rounded-[var(--radius-sm)] font-medium text-[13px] hover:bg-[#004D51] transition-colors min-h-[40px]"
          >
            {language === "pt" ? "CRIAR ROTEIRO MANUAL" : language === "en" ? "CREATE MANUAL ITINERARY" : "CREAR ITINERARIO MANUAL"}
          </button>
        </div>
      </BackgroundWrapper>
    );
  }

  /* ════════════════════════════════════════════
     RENDER: GENERATING
  ═══════════════════════════════════════════ */
  if (viewState === "generating") {
    return (
      <BackgroundWrapper className="pt-[62px] flex items-center justify-center">
        <div className="text-center px-6 max-w-sm">
          <div className="relative w-24 h-24 mx-auto mb-7">
            <div className="absolute inset-0 rounded-full bg-[var(--secondary)] animate-ping opacity-40" />
            <div className="relative w-24 h-24 rounded-full bg-[var(--primary)] flex items-center justify-center text-4xl shadow-lg">
              <Bot size={36} className="text-white" />
            </div>
          </div>
          <h2 className="font-['Fjalla_One'] text-2xl text-[var(--preto)] mb-3">
            {t.aiItineraryTitle}
          </h2>
          <p className="text-[var(--cinza-txt)] text-sm mb-6 leading-relaxed">
            {t.timelineGeneratingMsg}
          </p>
          {/* Animated dots */}
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]"
                style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </div>
          <style>{`@keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-10px); } }`}</style>
          {/* Progress activities */}
          <div className="mt-8 text-left space-y-2">
            {[
              language === "pt" ? "Mapeando pontos de interesse…" : language === "es" ? "Mapeando puntos de interés…" : "Mapping points of interest…",
              language === "pt" ? "Organizando paradas por proximidade…" : language === "es" ? "Organizando paradas por proximidad…" : "Organizing stops by proximity…",
              language === "pt" ? "Adicionando dicas exclusivas…" : language === "es" ? "Agregando consejos exclusivos…" : "Adding exclusive tips…",
            ].map((msg, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-sm text-[var(--cinza-txt)] bg-[var(--cinza-leve)] px-4 py-2.5 rounded-[var(--radius-sm)]"
                style={{ opacity: 1, animation: `fadeIn 0.5s ease ${0.4 + i * 0.5}s both` }}
              >
                <span>{msg}</span>
              </div>
            ))}
          </div>
          <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
      </BackgroundWrapper>
    );
  }

  /* ════════════════════════════════════════════
     RENDER: WIZARD
  ════════════════════════════════════════════ */
  if (viewState === "wizard") {
    const TOTAL_STEPS = 4;

    return (
      <BackgroundWrapper className="pt-[62px] pb-20">
        <div className="max-w-lg mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center shrink-0">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-['Fjalla_One'] text-xl text-[var(--preto)]">
                {t.aiItineraryTitle}
              </h1>
              <p className="text-xs text-[var(--cinza-txt)]">
                {t.wizardStep} {wizardStep + 1} {t.wizardOf} {TOTAL_STEPS}
              </p>
            </div>
          </div>

          <WizardProgress step={wizardStep} total={TOTAL_STEPS} />

          {/* ── Step 1: Who ── */}
          {wizardStep === 0 && (
            <div>
              <h2 className="font-['Fjalla_One'] text-2xl text-[var(--preto)] mb-1">
                {t.wizardWhoRegional}
              </h2>
              <p className="text-[var(--cinza-txt)] text-sm mb-6">{t.questions.who}</p>
              <div className="grid grid-cols-2 gap-3">
                {WHO_OPTIONS.map((opt) => {
                  const sel = wizardData.who === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setWizardData((d) => ({ ...d, who: opt.value }))}
                      className={`flex flex-col items-center justify-center gap-3 p-6 rounded-[var(--radius)] border-2 transition-all min-h-[120px] ${
                        sel
                          ? "border-[var(--primary)] bg-[var(--secondary)]"
                          : "border-[var(--cinza-med)] bg-white hover:border-[var(--primary)]/50"
                      }`}
                    >
                      <span className="text-4xl">{opt.icon}</span>
                      <span className={`text-sm font-bold ${sel ? "text-[var(--primary)]" : "text-[var(--preto)]"}`}>
                        {opt.label}
                      </span>
                      {sel && (
                        <div className="w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center">
                          <Check size={11} className="text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Step 2: Days + Dates ── */}
          {wizardStep === 1 && (
            <div>
              <h2 className="font-['Fjalla_One'] text-2xl text-[var(--preto)] mb-1">
                {t.wizardDaysTitle}
              </h2>
              <p className="text-[var(--cinza-txt)] text-sm mb-8">{t.questions.days}</p>

              {/* Big number */}
              <div className="text-center mb-6">
                <div
                  className="font-['Fjalla_One'] text-[80px] leading-none text-[var(--primary)]"
                >
                  {wizardData.days}
                </div>
                <p className="text-[var(--cinza-txt)] text-sm">{t.wizardDaysLabel}</p>
              </div>

              {/* Slider */}
              <SliderPrimitive.Root
                value={[wizardData.days]}
                onValueChange={([v]) => setWizardData((d) => ({ ...d, days: v }))}
                min={1}
                max={7}
                step={1}
                className="relative flex items-center select-none touch-none w-full h-5 mb-8"
              >
                <SliderPrimitive.Track className="relative bg-[var(--cinza-med)] rounded-full h-2.5 flex-1">
                  <SliderPrimitive.Range className="absolute bg-[var(--primary)] rounded-full h-full" />
                </SliderPrimitive.Track>
                <SliderPrimitive.Thumb className="block w-7 h-7 bg-[var(--primary)] border-2 border-white rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] cursor-grab active:cursor-grabbing" />
              </SliderPrimitive.Root>

              {/* Day markers */}
              <div className="flex justify-between mb-8 px-1">
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <button
                    key={d}
                    onClick={() => setWizardData((prev) => ({ ...prev, days: d }))}
                    className={`w-8 h-8 rounded-full text-xs font-bold transition-colors ${
                      wizardData.days === d
                        ? "bg-[var(--primary)] text-white"
                        : "bg-[var(--cinza-leve)] text-[var(--cinza-txt)]"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              {/* Date pickers */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--cinza-txt)] mb-1.5 block">
                    {t.wizardStartDateLabel}
                  </label>
                  <input
                    type="date"
                    value={wizardData.startDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) =>
                      setWizardData((d) => ({ ...d, startDate: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 border border-[var(--cinza-med)] rounded-[var(--radius-sm)] text-sm bg-white focus:border-[var(--primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--cinza-txt)] mb-1.5 block">
                    {t.wizardEndDateLabel}
                  </label>
                  <input
                    type="date"
                    readOnly
                    value={(() => {
                      if (!wizardData.startDate) return "";
                      const d = new Date(wizardData.startDate + "T12:00:00");
                      d.setDate(d.getDate() + wizardData.days - 1);
                      return d.toISOString().slice(0, 10);
                    })()}
                    className="w-full px-3 py-2.5 border border-[var(--cinza-med)] rounded-[var(--radius-sm)] text-sm bg-[var(--cinza-leve)] text-[var(--cinza-txt)] cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Interests ── */}
          {wizardStep === 2 && (
            <div>
              <h2 className="font-['Fjalla_One'] text-2xl text-[var(--preto)] mb-1">
                {t.wizardInterestsTitle}
              </h2>
              <p className="text-[var(--cinza-txt)] text-sm mb-6">{t.wizardInterestsHint}</p>
              <div className="flex flex-wrap gap-3">
                {INTEREST_OPTIONS.map((opt) => {
                  const sel = wizardData.interests.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      onClick={() =>
                        setWizardData((d) => ({
                          ...d,
                          interests: sel
                            ? d.interests.filter((i) => i !== opt.value)
                            : [...d.interests, opt.value],
                        }))
                      }
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 text-sm font-bold transition-all min-h-[44px] ${
                        sel
                          ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                          : "border-[var(--cinza-med)] bg-white text-[var(--preto)] hover:border-[var(--primary)]/60"
                      }`}
                    >
                      <span>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
              {wizardData.interests.length > 0 && (
                <p className="mt-4 text-xs text-[var(--verde)] font-bold">
                  ✓ {wizardData.interests.length} {language === "pt" ? "selecionados" : language === "es" ? "seleccionados" : "selected"}
                </p>
              )}
            </div>
          )}

          {/* ── Step 4: Budget ── */}
          {wizardStep === 3 && (
            <div>
              <h2 className="font-['Fjalla_One'] text-2xl text-[var(--preto)] mb-1">
                {t.wizardBudgetTitle}
              </h2>
              <p className="text-[var(--cinza-txt)] text-sm mb-6">{t.budget}</p>
              <div className="space-y-3 mb-8">
                {BUDGET_OPTIONS.map((opt) => {
                  const sel = wizardData.budget === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setWizardData((d) => ({ ...d, budget: opt.value }))}
                      className={`w-full flex items-center gap-4 p-5 rounded-[var(--radius)] border-2 transition-all min-h-[72px] text-left ${
                        sel
                          ? "border-[var(--primary)] bg-[var(--secondary)]"
                          : "border-[var(--cinza-med)] bg-white hover:border-[var(--primary)]/40"
                      }`}
                    >
                      <span className="text-3xl shrink-0">{opt.icon}</span>
                      <div className="flex-1">
                        <p className={`font-bold text-base ${sel ? "text-[var(--primary)]" : "text-[var(--preto)]"}`}>
                          {opt.label}
                        </p>
                        <p className="text-xs text-[var(--cinza-txt)]">{opt.desc}</p>
                      </div>
                      {sel && (
                        <div className="w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center shrink-0">
                          <Check size={13} className="text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={!canAdvance()}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-[var(--radius-sm)] font-['Fjalla_One'] text-base tracking-wide min-h-[56px] transition-all ${
                  canAdvance()
                    ? "bg-[var(--primary)] text-white hover:bg-[#0A5D61] shadow-lg"
                    : "bg-[var(--cinza-med)] text-[var(--cinza-txt)] cursor-not-allowed"
                }`}
              >
                <Sparkles size={20} />
                {t.wizardGenerateBtn}
              </button>
            </div>
          )}

          {/* Nav buttons */}
          {wizardStep < 3 && (
            <div className="flex gap-3 mt-8">
              {wizardStep > 0 ? (
                <button
                  onClick={() => setWizardStep((s) => s - 1)}
                  className="flex-1 py-3 border-2 border-[var(--cinza-med)] rounded-[var(--radius-sm)] text-[var(--cinza-txt)] font-bold text-sm hover:border-[var(--preto)] hover:text-[var(--preto)] transition-colors min-h-[44px]"
                >
                  ← {t.wizardPrev}
                </button>
              ) : (
                <button
                  onClick={() => setViewState("empty")}
                  className="flex-1 py-3 border-2 border-[var(--cinza-med)] rounded-[var(--radius-sm)] text-[var(--cinza-txt)] font-bold text-sm hover:border-[var(--preto)] hover:text-[var(--preto)] transition-colors min-h-[44px]"
                >
                  ← {t.wizardPrev}
                </button>
              )}
              <button
                onClick={() => { if (canAdvance()) setWizardStep((s) => s + 1); }}
                disabled={!canAdvance()}
                className={`flex-1 py-3 rounded-[var(--radius-sm)] font-bold text-sm min-h-[44px] transition-all ${
                  canAdvance()
                    ? "bg-[var(--preto)] text-white hover:opacity-90"
                    : "bg-[var(--cinza-med)] text-[var(--cinza-txt)] cursor-not-allowed"
                }`}
              >
                {t.wizardNext} 
              </button>
            </div>
          )}
          {wizardStep === 3 && (
            <button
              onClick={() => setWizardStep(2)}
              className="w-full mt-3 py-3 border-2 border-[var(--cinza-med)] rounded-[var(--radius-sm)] text-[var(--cinza-txt)] font-bold text-sm hover:border-[var(--preto)] hover:text-[var(--preto)] transition-colors min-h-[44px]"
            >
              ← {t.wizardPrev}
            </button>
          )}
        </div>
      </BackgroundWrapper>
    );
  }

  /* ════════════════════════════════════════════
     RENDER: TIMELINE VIEW
  ════════════════════════════════════════════ */
  return (
    <BackgroundWrapper className="pt-[62px] pb-16">

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-[var(--preto)] to-[#2C2C30] px-4 sm:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={16} className="text-[var(--primary)]" />
                <span className="text-[var(--primary)] text-xs font-bold tracking-widest uppercase">
                  {t.myItinerary}
                </span>
              </div>
              <h1 className="font-['Fjalla_One'] text-white text-2xl sm:text-3xl leading-tight">
                {headerSubtitle}
              </h1>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => onToast("📄 " + t.timelineExportPDF)}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/10 text-white rounded-[var(--radius-sm)] text-xs font-bold hover:bg-white/20 transition-colors min-h-[36px] backdrop-blur-sm"
              >
                <FileText size={14} />
                <span className="hidden sm:inline">{t.timelineExportPDF}</span>
              </button>
              <button
                onClick={() => onToast("🔗 " + t.timelineShareBtn)}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/10 text-white rounded-[var(--radius-sm)] text-xs font-bold hover:bg-white/20 transition-colors min-h-[36px] backdrop-blur-sm"
              >
                <Share2 size={14} />
                <span className="hidden sm:inline">{t.timelineShareBtn}</span>
              </button>
              <button
                onClick={() => onToast("📅 " + t.timelineCalendarBtn)}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/10 text-white rounded-[var(--radius-sm)] text-xs font-bold hover:bg-white/20 transition-colors min-h-[36px] backdrop-blur-sm"
              >
                <Calendar size={14} />
                <span className="hidden sm:inline">{t.timelineCalendarBtn}</span>
              </button>
              <button
                onClick={() => { setWizardStep(0); setViewState("wizard"); }}
                className="flex items-center gap-1.5 px-3 py-2 bg-[var(--primary)] text-white rounded-[var(--radius-sm)] text-xs font-bold hover:bg-[#0A5D61] transition-colors min-h-[36px]"
              >
                <RefreshCcw size={14} />
                <span className="hidden sm:inline">{t.timelineRegenerateBtn}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content: Timeline + Map ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* LEFT: Accordion days */}
          <div className="flex-1 min-w-0">
            <AccordionPrimitive.Root
              type="multiple"
              value={openDays}
              onValueChange={setOpenDays}
              className="space-y-4"
            >
              {days.map((day) => {
                const stops = allDayStops(day);
                const dayDate = formatDayDate(startDate, day - 1, language);
                return (
                  <AccordionPrimitive.Item
                    key={`day-${day}`}
                    value={`day-${day}`}
                    className="bg-white border border-[var(--cinza-med)] rounded-[var(--radius)] overflow-hidden shadow-[var(--sombra-sm)]"
                  >
                    <AccordionPrimitive.Header>
                      <AccordionPrimitive.Trigger className="w-full flex items-center justify-between px-5 py-4 group">
                        <div className="flex items-center gap-3">
                          <div className="px-2.5 py-1 bg-[var(--primary)] text-white rounded-[6px] text-xs font-bold tracking-widest">
                            {t.timelineDayLabel} {day}
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-sm text-[var(--preto)]">
                              {capitalize(dayDate)}
                            </p>
                            <p className="text-xs text-[var(--cinza-txt)]">
                              {stops.length} {language === "pt" ? "paradas" : language === "es" ? "paradas" : "stops"}
                            </p>
                          </div>
                        </div>
                        <ChevronDown
                          size={18}
                          className="text-[var(--cinza-txt)] transition-transform group-data-[state=open]:rotate-180"
                        />
                      </AccordionPrimitive.Trigger>
                    </AccordionPrimitive.Header>

                    <AccordionPrimitive.Content className="data-[state=open]:animate-none">
                      <div className="px-5 pb-5">
                        {stops.map((parada, si) => {
                          const dest = parada.destination;
                          const time = PERIODO_TIME[parada.periodo] || "09:00";
                          const dur = PERIODO_DUR[parada.periodo] || "2h";
                          const nextParada = stops[si + 1];
                          const travel = nextParada
                            ? travelLabel(dest, nextParada.destination)
                            : null;

                          return (
                            <div key={parada.destinationId + si}>
                              {/* Stop card */}
                              <div className="flex items-stretch gap-4">
                                {/* Timeline connector */}
                                <div className="flex flex-col items-center w-10 shrink-0 py-1">
                                  <div className="w-9 h-9 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-sm font-bold shrink-0">
                                    {si + 1}
                                  </div>
                                  {(si < stops.length - 1 || travel) && (
                                    <div className="flex-1 w-0.5 bg-[var(--primary)] opacity-30 my-1 min-h-[24px]" />
                                  )}
                                </div>

                                {/* Card content */}
                                <div className="flex-1 bg-[var(--cinza-leve)] rounded-[var(--radius-sm)] p-4 mb-2">
                                  <div className="flex items-start gap-3">
                                    {/* Destination image */}
                                    <div className="w-14 h-14 rounded-[8px] overflow-hidden shrink-0">
                                      <ImageWithFallback
                                        src={dest.image}
                                        alt={dest.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2 mb-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="text-lg">{dest.icon}</span>
                                          <h4 className="font-bold text-sm text-[var(--preto)]">
                                            {dest.name}
                                          </h4>
                                          <span className="text-[10px] text-[var(--primary)] font-bold px-1.5 py-0.5 bg-[var(--secondary)] rounded-full">
                                            {dest.category}
                                          </span>
                                        </div>
                                        {/* Drag handle */}
                                        <GripVertical
                                          size={16}
                                          className="text-[var(--cinza-med)] shrink-0 cursor-grab mt-0.5"
                                        />
                                      </div>
                                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                                        <div className="flex items-center gap-1 text-xs text-[var(--cinza-txt)]">
                                          <Clock size={11} />
                                          <span>{time}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-[var(--cinza-txt)]">
                                          <span>⏱</span>
                                          <span>{dur} {t.timelineEstDuration}</span>
                                        </div>
                                      </div>
                                      {parada.dica && (
                                        <p className="text-xs text-[var(--cinza-txt)] leading-relaxed line-clamp-2">
                                          💡 {parada.dica}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Action row */}
                                  <div className="flex gap-2 mt-3">
                                    <button
                                      onClick={() => onOpenGPS(dest.id)}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D9488] text-white rounded-[6px] text-xs font-bold hover:bg-[#0F766E] transition-colors min-h-[36px]"
                                    >
                                      <Navigation2 size={12} />
                                      {t.navigate}
                                    </button>
                                    <button
                                      onClick={() => onNavigate("detalhe", dest.id)}
                                      className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--cinza-med)] text-[var(--preto)] rounded-[6px] text-xs font-bold hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors min-h-[36px] bg-white"
                                    >
                                      <Eye size={12} />
                                      {t.viewDetails}
                                    </button>
                                    <button
                                      onClick={() => onRemoveFromRoteiro(dest.id)}
                                      className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-[var(--cinza-txt)] rounded-[6px] text-xs hover:text-[var(--vermelho)] hover:bg-[#FEE2E2] transition-colors min-h-[36px]"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Travel indicator between stops */}
                              {travel && (
                                <div className="flex items-center gap-4 py-1 pl-14">
                                  <div className="h-0.5 w-4 bg-[var(--cinza-med)]" />
                                  <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--cinza-leve)] rounded-full text-xs text-[var(--cinza-txt)]">
                                    <Car size={12} />
                                    <span>{travel} · {t.timelineTravelIndicator}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Add stop button */}
                        <div className="flex items-stretch gap-4 mt-2">
                          <div className="w-10 flex justify-center">
                            <div className="w-0.5 h-full bg-[var(--cinza-med)] opacity-40" />
                          </div>
                          <button
                            onClick={() => onNavigate("guia")}
                            className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[var(--cinza-med)] rounded-[var(--radius-sm)] text-[var(--cinza-txt)] text-sm font-bold hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors min-h-[44px]"
                          >
                            <Plus size={16} />
                            {t.timelineAddStop}
                          </button>
                        </div>
                      </div>
                    </AccordionPrimitive.Content>
                  </AccordionPrimitive.Item>
                );
              })}
            </AccordionPrimitive.Root>

            {/* Add day / explore more */}
            <button
              onClick={() => onNavigate("guia")}
              className="mt-4 w-full py-3.5 border-2 border-dashed border-[var(--cinza-med)] rounded-[var(--radius)] text-[var(--cinza-txt)] text-sm font-bold hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors min-h-[44px]"
            >
              {t.addNewStop}
            </button>
          </div>

          {/* RIGHT: Sticky Map */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="lg:sticky lg:top-[82px] space-y-4">

              {/* Map header */}
              <div className="bg-white border border-[var(--cinza-med)] rounded-[var(--radius)] overflow-hidden shadow-[var(--sombra-sm)]">
                <div className="flex items-center gap-2 px-4 py-3.5 border-b border-[var(--cinza-med)]">
                  <MapPin size={16} className="text-[var(--primary)]" />
                  <h3 className="font-['Fjalla_One'] text-base text-[var(--preto)]">
                    {t.timelineMapTitle}
                  </h3>
                  <span className="ml-auto text-xs text-[var(--cinza-txt)] bg-[var(--cinza-leve)] px-2 py-0.5 rounded-full">
                    {timelineParadas.length} {language === "pt" ? "paradas" : language === "es" ? "paradas" : "stops"}
                  </span>
                </div>
                <div className="p-3" style={{ height: "420px" }}>
                  <RoteiroMapSVG stops={timelineParadas.map((p) => p.destination)} />
                </div>
              </div>

              {/* Stop legend */}
              <div className="bg-white border border-[var(--cinza-med)] rounded-[var(--radius)] p-4 shadow-[var(--sombra-sm)]">
                <h4 className="font-bold text-sm text-[var(--preto)] mb-3">
                  {language === "pt" ? "Legenda do Roteiro" : language === "es" ? "Leyenda del Itinerario" : "Route Legend"}
                </h4>
                <div className="space-y-2">
                  {timelineParadas.map((p, i) => (
                    <div key={p.destinationId + i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </div>
                      <span className="text-sm text-[var(--preto)] truncate flex-1">
                        {p.destination.name}
                      </span>
                      <span className="text-xs text-[var(--cinza-txt)] shrink-0">
                        Dia {p.dia}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </BackgroundWrapper>
  );
}