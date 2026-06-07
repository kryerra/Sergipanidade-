import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  Eye,
  MapPin,
  Star,
  Camera,
  MessageSquare,
  Megaphone,
  CheckCircle2,
  Clock,
  PenLine,
  Send,
  X,
  ChevronRight,
  BarChart2,
  Award,
  TrendingUp,
} from "lucide-react";
import defaultProfilePhoto from "../../assets/images/miauteriapf.jpeg";
import partnerBackground from "../../assets/images/miaufundo2.jpeg";
import { translations } from "@/constants/translations";

/* ─────────── Tipos ─────────── */
interface ParceiroScreenProps {
  onToast: (message: string) => void;
  language: "pt" | "en" | "es";
}

interface Review {
  id: number;
  initials: string;
  name: string;
  date: string;
  rating: number;
  comment: string;
  existingResponse?: string;
  replied: boolean;
}

import reviewsData from "@/constants/reviews.json";

/* ─────────── Mock data ─────────── */
const REVIEWS_DATA: Review[] = reviewsData.partnerReviews as Review[];

/* ─────────── Avatar colorido por iniciais ─────────── */
const AVATAR_COLORS: string[] = [
  "bg-[#F06030]",
  "bg-[#0D9488]",
  "bg-[#7C3AED]",
  "bg-[#F59E0B]",
  "bg-[#16A34A]",
];

/* ─────────── Pure-SVG line chart (no recharts → no null-key bug) ─────────── */
function EvolutionChart({
  values,
  labels,
}: {
  values: number[];
  labels: string[];
}): JSX.Element {
  const W = 340;
  const H = 170;
  const PAD = { top: 12, right: 12, bottom: 28, left: 42 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 1;

  const cx = (i: number): number =>
    PAD.left + (i / (values.length - 1)) * plotW;
  const cy = (v: number): number =>
    PAD.top + plotH - ((v - minV) / range) * plotH;

  const linePath = values
    .map((v: number, i: number): string => `${i === 0 ? "M" : "L"}${cx(i)},${cy(v)}`)
    .join(" ");

  const areaPath = `${linePath} L${cx(values.length - 1)},${PAD.top + plotH} L${cx(0)},${PAD.top + plotH}Z`;

  // 3 horizontal grid lines
  const gridVals = [minV, (minV + maxV) / 2, maxV].map(
    (v: number): number => Math.round(v / 100) * 100
  );

  const fmt = (v: number): string =>
    v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height: H, display: "block" }}
      aria-label="Gráfico de evolução de visualizações"
    >
      {/* Horizontal grid lines */}
      {gridVals.map((gv: number, gi: number): JSX.Element => (
        <g key={`grid-${gi}`}>
          <line
            x1={PAD.left}
            y1={cy(gv)}
            x2={W - PAD.right}
            y2={cy(gv)}
            stroke="#F0EDEA"
            strokeWidth={1}
          />
          <text
            x={PAD.left - 6}
            y={cy(gv) + 4}
            textAnchor="end"
            fontSize={9}
            fill="#A8A29E"
          >
            {fmt(gv)}
          </text>
        </g>
      ))}

      {/* Area fill */}
      <path d={areaPath} fill="#0D7C84" fillOpacity={0.08} />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke="#0D7C84"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dots */}
      {values.map((v: number, i: number): JSX.Element => (
        <circle
          key={`dot-${i}`}
          cx={cx(i)}
          cy={cy(v)}
          r={4}
          fill="#0D7C84"
          stroke="white"
          strokeWidth={2}
        />
      ))}

      {/* X-axis labels */}
      {labels.map((lbl: string, i: number): JSX.Element => (
        <text
          key={`lbl-${i}`}
          x={cx(i)}
          y={H - 4}
          textAnchor="middle"
          fontSize={10}
          fill="#78716C"
        >
          {lbl}
        </text>
      ))}
    </svg>
  );
}

/* ─────────── Componente ─────────── */
export function ParceiroScreen({ onToast, language }: ParceiroScreenProps): JSX.Element {
  const t = translations[language];

  /* Modal state */
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);

  /* Form state */
  const [establishmentName, setEstablishmentName] = useState("Miauteria Cat Café");
  const [establishmentDesc, setEstablishmentDesc] = useState(
    "Cafeteria pet friendly com adoção de gatos"
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [profilePhoto, setProfilePhoto] = useState<string>(defaultProfilePhoto);
  const profilePhotoObjectUrlRef = useRef<string | null>(null);

  useEffect((): () => void => {
    return (): void => {
      if (profilePhotoObjectUrlRef.current) {
        URL.revokeObjectURL(profilePhotoObjectUrlRef.current);
      }
    };
  }, []);

  /* Inline review reply */
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<Record<number, string>>({});
  const [sentReplies, setSentReplies] = useState<Record<number, string>>({});

  /* Chart data — last 6 months */
  const months = Array.isArray(t.months)
    ? (t.months as string[])
    : ["Dez", "Jan", "Fev", "Mar", "Abr", "Mai"];

  const CHART_VALUES = [782, 891, 823, 958, 1064, 1247];

  /* Excellence seal criteria */
  const CRITERIA = [
    { label: t.sealCriteria1, done: true },
    { label: t.sealCriteria2, done: true },
    { label: t.sealCriteria3, done: false },
    { label: t.sealCriteria4, done: true },
  ];
  const SEAL_PCT = 87;

  /* Handlers */
  const handleSaveEdit = (): void => {
    setShowEditModal(false);
    onToast(t.profileUpdated);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) setSelectedFiles(Array.from(e.target.files));
  };

  const handleUploadPhotos = (): void => {
    if (selectedFiles.length === 0) {
      onToast("📸 Selecione fotos primeiro");
      return;
    }

    if (profilePhotoObjectUrlRef.current) {
      URL.revokeObjectURL(profilePhotoObjectUrlRef.current);
    }

    const newProfileUrl = URL.createObjectURL(selectedFiles[0]);
    profilePhotoObjectUrlRef.current = newProfileUrl;
    setProfilePhoto(newProfileUrl);

    setShowPhotoModal(false);
    setSelectedFiles([]);
    onToast(`${t.photosAdded}`);
  };

  const handleSendReply = (reviewId: number): void => {
    const text = replyText[reviewId];
    if (!text?.trim()) {
      onToast("✏️ Escreva uma resposta antes de publicar");
      return;
    }
    setSentReplies((prev) => ({ ...prev, [reviewId]: text.trim() }));
    setReplyText((prev) => ({ ...prev, [reviewId]: "" }));
    setReplyingTo(null);
    onToast(t.responseSent);
  };

  /* ═══════════════════════════════════════════════════
     JSX
  ═══════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>

      {/* ══════ HEADER BRANCO COM IMAGEM DE FUNDO ══════ */}
      <div
        className="relative overflow-hidden"
        style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}
      >
        <img
          src={partnerBackground}
          alt="Portal background"
          className="pointer-events-none absolute inset-0 w-full h-full object-cover opacity-80"
          style={{ zIndex: 0 }}
        />
        <div className="absolute inset-0 bg-white/70" />
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-20 relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div>
              <h1
                className="font-bold tracking-tight leading-tight"
                style={{ fontSize: "36px", color: '#1E293B', fontFamily: 'Inter, sans-serif' }}
              >
                {t.partnerPortal}
              </h1>
              <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>{t.manageEstablishment}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 mt-6 pb-20">

        {/* ══════ CARD ESTABELECIMENTO ══════ */}
        <div
          className="bg-white rounded-2xl p-6 mb-6"
          style={{
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Logo */}
            <div
              className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-linear-to-br from-[#ED2100] to-[#1A0050] flex items-center justify-center"
            >
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Foto da Miauteria"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera size={36} className="text-white" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h2
                    className="font-bold mb-1"
                    style={{ fontSize: "20px", color: '#0F172A' }}
                  >
                    {establishmentName}
                  </h2>
                  <div className="flex items-center gap-1.5 text-sm mb-2" style={{ color: '#64748B' }}>
                    <MapPin size={14} className="shrink-0" style={{ color: '#0D7C84' }} strokeWidth={2.5} />
                    <span>Av. Dr. Edelzio Vieira de Melo, 1337 - Pereira Lobo, Aracaju - SE</span>
                  </div>
                  {/* Category pills */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {["Pet Friendly", "Cafeteria", "Adoção"].map((cat) => (
                      <span
                        key={cat}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: '#F1F5F9', color: '#64748B' }}
                      >
                        {cat}
                      </span>
                    ))}
                    {/* Verificado badge */}
                    <span
                      className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}
                    >
                      <CheckCircle2 size={10} strokeWidth={2.5} />
                      {t.verified}
                    </span>
                  </div>
                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={14} className="text-[#F59E0B] fill-[#F59E0B]" strokeWidth={0} />
                      ))}
                    </div>
                    <span className="font-bold text-sm" style={{ color: '#0F172A' }}>4.9</span>
                    <span className="text-xs" style={{ color: '#64748B' }}>(389 {t.reviews})</span>
                  </div>
                </div>

                {/* Edit button */}
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm min-h-11 transition-all text-white shrink-0 hover:opacity-90"
                  style={{ backgroundColor: "#0D7C84" }}
                >
                  <PenLine size={15} strokeWidth={2.5} />
                  {t.editProfile}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ══════ MÉTRICAS ══════ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Views */}
          <div
            className="bg-white rounded-2xl p-5"
            style={{
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#ECFEFF' }}
              >
                <Eye size={18} strokeWidth={1.5} style={{ color: '#0D7C84' }} />
              </div>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ color: '#0D7C84', backgroundColor: '#ECFEFF' }}
              >
                +31%
              </span>
            </div>
            <div className="font-bold" style={{ fontSize: "36px", lineHeight: 1, color: '#0F172A' }}>
              1.247
            </div>
            <p className="text-xs mt-1.5" style={{ color: '#64748B' }}>{t.viewsThisMonth}</p>
          </div>

          {/* Directions */}
          <div
            className="bg-white rounded-2xl p-5"
            style={{
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#ECFEFF' }}
              >
                <MapPin size={18} strokeWidth={1.5} style={{ color: '#0D7C84' }} />
              </div>
              <ChevronRight size={16} style={{ color: '#CBD5E1' }} />
            </div>
            <div className="font-bold" style={{ fontSize: "36px", lineHeight: 1, color: '#0F172A' }}>
              389
            </div>
            <p className="text-xs mt-1.5" style={{ color: '#64748B' }}>{t.directionsClicks}</p>
          </div>

          {/* Rating */}
          <div
            className="bg-white rounded-2xl p-5"
            style={{
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#FEF3C7' }}
              >
                <Star size={18} strokeWidth={0} fill="#F59E0B" style={{ color: '#F59E0B' }} />
              </div>
              <ChevronRight size={16} style={{ color: '#CBD5E1' }} />
            </div>
            <div className="font-bold" style={{ fontSize: "36px", lineHeight: 1, color: '#0F172A' }}>
              4.9
            </div>
            <p className="text-xs mt-1.5" style={{ color: '#64748B' }}>
              {t.averageRating} (389 {t.reviews})
            </p>
          </div>
        </div>

        {/* ══════ BANNER DE INSIGHT ══════ */}
        <div
          className="rounded-2xl p-5 mb-6 flex items-start gap-4"
          style={{
            backgroundColor: "#F0FDFA",
            borderLeft: "4px solid #0D7C84",
          }}
        >
          <div className="shrink-0 mt-0.5">
            <TrendingUp size={20} strokeWidth={1.5} style={{ color: '#0D7C84' }} />
          </div>
          <div>
            <p className="text-sm leading-relaxed" style={{ color: '#0F766E' }}>
              {t.insightMessage}
            </p>
          </div>
        </div>

        {/* ══════ DUAS COLUNAS: Seal + Chart ══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Progresso Rumo ao Selo */}
          <div
            className="bg-white rounded-2xl p-6"
            style={{
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Award size={20} strokeWidth={1.5} className="text-[#F59E0B]" />
              <h3 className="font-bold text-base" style={{ color: '#0F172A' }}>
                {t.sealTitle} — {t.sealProgress}
              </h3>
            </div>

            {/* Progress bar */}
            <div className="mb-5">
              <div className="flex justify-between text-xs mb-1.5" style={{ color: '#64748B' }}>
                <span>{SEAL_PCT}%</span>
                <span>100%</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: '#F1F5F9' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${SEAL_PCT}%`,
                    background: 'linear-gradient(to right, #0D7C84, #14B8A6)',
                  }}
                />
              </div>
            </div>

            {/* Criteria list */}
            <div className="space-y-2.5">
              {CRITERIA.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  {c.done ? (
                    <CheckCircle2 size={18} className="text-[#16A34A]" strokeWidth={2} />
                  ) : (
                    <Clock size={18} className="text-[#F59E0B]" strokeWidth={1.5} />
                  )}
                  <span
                    className="text-sm"
                    style={{ color: c.done ? '#0F172A' : '#64748B' }}
                  >
                    {c.label}
                  </span>
                  {!c.done && (
                    <span
                      className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ color: '#F59E0B', backgroundColor: '#FEF3C7' }}
                    >
                      Em progresso
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Gráfico de Evolução */}
          <div
            className="bg-white rounded-2xl p-6"
            style={{
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <BarChart2 size={18} strokeWidth={1.5} style={{ color: '#0D7C84' }} />
              <h3 className="font-bold text-base" style={{ color: '#0F172A' }}>
                {t.evolutionChartTitle}
              </h3>
            </div>
            <p className="text-xs mb-4" style={{ color: '#64748B' }}>{t.evolutionChartDesc}</p>

            <EvolutionChart values={CHART_VALUES} labels={months} />
          </div>
        </div>

        {/* ══════ AÇÕES RÁPIDAS ══════ */}
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-4" style={{ color: '#0F172A' }}>
            {t.quickActionsTitle}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Fotos */}
            <button
              onClick={() => setShowPhotoModal(true)}
              className="flex items-center gap-3 p-5 rounded-2xl text-left transition-all hover:opacity-90 active:scale-[0.98] min-h-20"
              style={{
                backgroundColor: "#0D7C84",
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Camera size={20} className="text-white" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-bold text-white text-sm">
                  {t.addPhotos}
                </p>
                <p className="text-white/70 text-xs mt-0.5">Galeria · fotos do local</p>
              </div>
            </button>

            {/* Responder */}
            <button
              onClick={() => {
                const firstUnreplied = REVIEWS_DATA.find(
                  (r) => !r.replied && !sentReplies[r.id]
                );
                if (firstUnreplied) {
                  setReplyingTo(firstUnreplied.id);
                  document
                    .getElementById(`review-${firstUnreplied.id}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }}
              className="flex items-center gap-3 p-5 rounded-2xl text-left transition-all hover:opacity-90 active:scale-[0.98] min-h-20"
              style={{
                backgroundColor: "#0D7C84",
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <MessageSquare size={20} className="text-white" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-bold text-white text-sm">
                  {t.respondReviews}
                </p>
                <p className="text-white/70 text-xs mt-0.5">
                  {REVIEWS_DATA.filter((r) => !r.replied && !sentReplies[r.id]).length} pendente(s)
                </p>
              </div>
            </button>

            {/* Promover */}
            <button
              onClick={() => setShowPromoteModal(true)}
              className="flex items-center gap-3 p-5 rounded-2xl text-left transition-all hover:opacity-90 active:scale-[0.98] min-h-20"
              style={{
                backgroundColor: "#0D7C84",
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Megaphone size={20} className="text-white" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-bold text-white text-sm">
                  PROMOVER
                </p>
                <p className="text-white/70 text-xs mt-0.5">Planos · destaque · visibilidade</p>
              </div>
            </button>
          </div>
        </div>

        {/* ══════ AVALIAÇÕES RECENTES ══════ */}
        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div
            className="flex items-center justify-between px-6 py-5"
            style={{ borderBottom: '1px solid #E5E7EB' }}
          >
            <div className="flex items-center gap-2">
              <Star size={18} fill="#F59E0B" strokeWidth={0} style={{ color: '#F59E0B' }} />
              <h3 className="font-bold text-base" style={{ color: '#0F172A' }}>
                {t.recentReviewsTitle}
              </h3>
            </div>
            <span
              className="text-xs px-2 py-1 rounded-full"
              style={{ color: '#64748B', backgroundColor: '#F1F5F9' }}
            >
              {REVIEWS_DATA.length} {t.reviews}
            </span>
          </div>

          <div className="divide-y divide-(--cinza-med)">
            {REVIEWS_DATA.map((review, idx) => {
              const isReplying = replyingTo === review.id;
              const hasSentReply = !!sentReplies[review.id];
              const displayReply = hasSentReply
                ? sentReplies[review.id]
                : review.existingResponse;
              const isReplied = review.replied || hasSentReply;

              return (
                <div
                  key={review.id}
                  id={`review-${review.id}`}
                  className="p-5 sm:p-6"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div
                      className={`w-10 h-10 rounded-full ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} text-white flex items-center justify-center font-bold text-sm shrink-0 select-none`}
                    >
                      {review.initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between flex-wrap gap-2 mb-1.5">
                        <div>
                          <span className="font-bold text-sm text-(--preto)">{review.name}</span>
                          <span className="ml-2 text-xs text-(--cinza-txt)">{review.date}</span>
                        </div>
                        {/* Stars */}
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={13}
                              className={
                                s <= review.rating
                                  ? "text-[#F5A623] fill-[#F5A623]"
                                  : "text-(--cinza-med)"
                              }
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-sm text-(--cinza-txt) leading-relaxed mb-3">
                        {review.comment}
                      </p>

                      {/* Existing / sent reply */}
                      {displayReply && (
                        <div
                          className="mb-3 p-3.5 rounded-sm"
                          style={{
                            backgroundColor: "#F0FDFA",
                            borderLeft: "3px solid #0D7C84",
                          }}
                        >
                          <p
                            className="text-xs font-bold mb-1"
                            style={{ color: "#0D7C84" }}
                          >
                            {t.yourResponse}
                          </p>
                          <p className="text-xs text-gray-500 leading-relaxed">
                            {displayReply}
                          </p>
                        </div>
                      )}

                      {/* Reply textarea (inline) */}
                      {isReplying && !isReplied && (
                        <div className="mb-3 space-y-2">
                          <textarea
                            value={replyText[review.id] || ""}
                            onChange={(e) =>
                              setReplyText((prev) => ({
                                ...prev,
                                [review.id]: e.target.value,
                              }))
                            }
                            placeholder={t.replyPlaceholder}
                            className="w-full px-3 py-2.5 border rounded-lg text-sm resize-none outline-none transition-colors"
                            style={{ borderColor: '#E5E7EB', backgroundColor: '#F8FAFC', color: '#0F172A' }}
                            rows={3}
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSendReply(review.id)}
                              className="flex items-center gap-1.5 px-4 py-2 text-white rounded-lg text-xs font-bold min-h-9 hover:opacity-90 transition-opacity"
                              style={{ backgroundColor: "#0D7C84" }}
                            >
                              <Send size={12} />
                              {t.publishReply}
                            </button>
                            <button
                              onClick={() => setReplyingTo(null)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-colors min-h-9"
                              style={{ border: '1px solid #E5E7EB', color: '#64748B', backgroundColor: '#FFFFFF' }}
                            >
                              <X size={12} />
                              {t.cancel}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      {!isReplied && !isReplying && (
                        <button
                          onClick={() => setReplyingTo(review.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors min-h-9"
                          style={{ border: '1px solid #E5E7EB', color: '#64748B' }}
                        >
                          <MessageSquare size={12} />
                          {t.respond}
                        </button>
                      )}
                      {isReplied && !isReplying && (
                        <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                          <CheckCircle2 size={13} />
                          {language === "pt"
                            ? "Respondido"
                            : language === "en"
                            ? "Replied"
                            : "Respondido"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MODAIS
      ══════════════════════════════════════════ */}

      {/* Edit modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-7 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-['Fjalla_One'] text-2xl text-gray-900">
                {t.editEstablishment}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">
                {t.name}
              </label>
              <input
                type="text"
                value={establishmentName}
                onChange={(e) => setEstablishmentName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-sm text-sm outline-none focus:border-[#004D5A] transition-colors bg-gray-50"
              />
            </div>
            <div className="mb-6">
              <label className="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">
                {t.description}
              </label>
              <textarea
                value={establishmentDesc}
                onChange={(e) => setEstablishmentDesc(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-sm text-sm outline-none focus:border-[#004D5A] transition-colors bg-gray-50 resize-none"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-3 text-white rounded-lg font-bold text-sm min-h-11 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#0D7C84" }}
              >
                {t.save}
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-500 rounded-sm font-bold text-sm hover:border-gray-900 hover:text-gray-900 transition-colors min-h-11"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-7 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-['Fjalla_One'] text-2xl text-gray-900">
                {t.addPhotosTitle}
              </h3>
              <button
                onClick={() => { setShowPhotoModal(false); setSelectedFiles([]); }}
                className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="border-2 border-dashed rounded-2xl p-10 text-center mb-6 transition-colors" style={{ borderColor: '#E5E7EB' }}>
              <Camera size={48} className="mx-auto mb-3" style={{ color: '#94A3B8' }} strokeWidth={1.5} />
              <p className="text-sm text-gray-500 mb-4">{t.dragPhotos}</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                id="photo-upload"
                className="hidden"
              />
              <label
                htmlFor="photo-upload"
                className="inline-block px-5 py-2.5 text-white rounded-lg text-sm font-bold cursor-pointer hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#0D7C84" }}
              >
                {t.chooseFiles}
              </label>
              {selectedFiles.length > 0 && (
                <p className="text-sm font-bold mt-3" style={{ color: "#0D7C84" }}>
                  {selectedFiles.length} arquivo(s) selecionado(s)
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleUploadPhotos}
                className="flex-1 py-3 bg-primary text-white rounded-sm font-bold text-sm hover:bg-red-600 transition-colors min-h-11"
              >
                {t.upload}
              </button>
              <button
                onClick={() => { setShowPhotoModal(false); setSelectedFiles([]); }}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-500 rounded-sm font-bold text-sm hover:border-gray-900 hover:text-gray-900 transition-colors min-h-11"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promote modal */}
      {showPromoteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="bg-white rounded-2xl p-7 max-w-3xl w-full my-8 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-2xl" style={{ color: '#0F172A' }}>
                {language === "pt" ? "Promova seu Estabelecimento" : language === "en" ? "Promote your Establishment" : "Promociona tu Establecimiento"}
              </h3>
              <button
                onClick={() => setShowPromoteModal(false)}
                className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm mb-6" style={{ color: '#64748B' }}>
              {language === "pt"
                ? "Aumente sua visibilidade e alcance mais turistas com nossos planos"
                : language === "en"
                ? "Increase your visibility and reach more tourists with our plans"
                : "Aumenta tu visibilidad y alcanza más turistas con nuestros planes"}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {/* Básico */}
              <div className="border-2 rounded-2xl p-5 transition-colors" style={{ borderColor: '#E5E7EB' }}>
                <div className="text-center mb-4">
                  <h4 className="font-bold text-xl" style={{ color: '#0F172A' }}>
                    {language === "pt" ? "Básico" : language === "en" ? "Basic" : "Básico"}
                  </h4>
                  <div className="font-bold text-xl mt-1" style={{ color: '#0D7C84' }}>
                    R$ 99<span className="text-sm" style={{ color: '#64748B' }}>/mês</span>
                  </div>
                </div>
                <ul className="text-xs text-(--cinza-txt) space-y-2 mb-4">
                  <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-(--verde)" /> Destaque na listagem</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-(--verde)" /> Galeria de até 10 fotos</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-(--verde)" /> Estatísticas básicas</li>
                </ul>
                <button
                  onClick={() => { setShowPromoteModal(false); onToast("✓ Plano Básico selecionado!"); }}
                  className="w-full py-2.5 border-2 border-(--azul) text-(--azul) rounded-sm text-xs font-bold hover:bg-(--azul) hover:text-white transition-colors"
                >
                  Selecionar
                </button>
              </div>

              {/* Profissional (popular) */}
              <div className="border-2 rounded-2xl p-5 relative shadow-lg" style={{ borderColor: '#0D7C84' }}>
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold px-3 py-1 rounded-full"
                  style={{ backgroundColor: '#0D7C84' }}
                >
                  POPULAR
                </div>
                <div className="text-center mb-4">
                  <h4 className="font-bold text-xl" style={{ color: '#0F172A' }}>
                    {language === "pt" ? "Profissional" : language === "en" ? "Professional" : "Profesional"}
                  </h4>
                  <div className="font-bold text-xl mt-1" style={{ color: '#0D7C84' }}>
                    R$ 199<span className="text-sm" style={{ color: '#64748B' }}>/mês</span>
                  </div>
                </div>
                <ul className="text-xs text-(--cinza-txt) space-y-2 mb-4">
                  <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-(--verde)" /> Destaque no topo</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-(--verde)" /> Fotos ilimitadas</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-(--verde)" /> Estatísticas avançadas</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-(--verde)" /> Post em redes sociais</li>
                </ul>
                <button
                  onClick={() => { setShowPromoteModal(false); onToast("✓ Plano Profissional selecionado!"); }}
                  className="w-full py-2.5 bg-primary text-white rounded-sm text-xs font-bold hover:bg-(--vermelho) transition-colors"
                >
                  Selecionar
                </button>
              </div>

              {/* Premium */}
              <div className="border-2 rounded-2xl p-5 transition-colors" style={{ borderColor: '#E5E7EB' }}>
                <div className="text-center mb-4">
                  <h4 className="font-bold text-xl" style={{ color: '#0F172A' }}>Premium</h4>
                  <div className="font-bold text-xl mt-1" style={{ color: '#0F172A' }}>
                    R$ 349<span className="text-sm" style={{ color: '#64748B' }}>/mês</span>
                  </div>
                </div>
                <ul className="text-xs text-(--cinza-txt) space-y-2 mb-4">
                  <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-(--verde)" /> Destaque exclusivo</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-(--verde)" /> Conteúdo em vídeo</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-(--verde)" /> Análise completa</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-(--verde)" /> Gerente dedicado</li>
                </ul>
                <button
                  onClick={() => { setShowPromoteModal(false); onToast("✓ Plano Premium selecionado!"); }}
                  className="w-full py-2.5 border-2 border-[#7C3AED] text-[#7C3AED] rounded-sm text-xs font-bold hover:bg-[#7C3AED] hover:text-white transition-colors"
                >
                  Selecionar
                </button>
              </div>
            </div>

            <div className="rounded-xl p-3 text-center" style={{ backgroundColor: '#F1F5F9' }}>
              <p className="text-xs" style={{ color: '#64748B' }}>
                Todos os planos incluem 7 dias de teste gratuito. Cancele a qualquer momento.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}