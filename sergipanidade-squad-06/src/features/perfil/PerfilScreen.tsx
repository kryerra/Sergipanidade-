import { useState } from 'react';
import {
  User,
  Bell,
  Route,
  Heart,
  Star,
  Eye,
  Edit3,
  FileDown,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  Lock,
  Download,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { translations } from "@/constants/translations";
import { UserAvatar } from '@/components/shared/UserAvatar';
import { destinations } from "@/constants/destinations";
import type { UserProfile } from '@/types';
import { ImageWithFallback } from '@/components/shared/ImageWithFallback';

// ─── Types ────────────────────────────────────────────────────
type Tab =
  | 'dados'
  | 'notificacoes'
  | 'roteiros'
  | 'favoritos'
  | 'avaliacoes';
type FavFilter = 'all' | 'atracoes' | 'restaurantes' | 'hoteis';

// ─── Mock Data ────────────────────────────────────────────────
const MOCK_ITINERARIES = [
  {
    id: '1',
    title: 'Aracaju',
    days: 3,
    type: 'Casal',
    date: 'Jan 2024',
    stops: 6,
    img: 'https://images.unsplash.com/photo-1709133108199-424031785704?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  },
  {
    id: '2',
    title: 'Litoral Norte',
    days: 1,
    type: 'Solo',
    date: 'Mar 2024',
    stops: 4,
    img: 'https://images.unsplash.com/photo-1773407060124-c093ab4ff969?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  },
];

const MOCK_REVIEWS = [
  {
    id: '1',
    place: 'Orla de Atalaia',
    rating: 5,
    date: 'Fev 2024',
    text: 'Lugar incrível! O pôr do sol é espetacular e a orla está muito bem cuidada. Recomendo muito a caminhada ao entardecer.',
    partnerResponse: null as string | null,
    partnerInitials: null as string | null,
  },
  {
    id: '2',
    place: 'Museu da Gente Sergipana',
    rating: 4,
    date: 'Mar 2024',
    text: 'Um museu moderno e envolvente. Aprendi muito sobre a riquíssima cultura sergipana. Vale cada minuto!',
    partnerResponse:
      'Obrigado pela visita, João! Ficamos felizes que tenha curtido a experiência. Volte sempre!',
    partnerInitials: 'MG',
  },
  {
    id: '3',
    place: 'Miauteria Cat Café',
    rating: 5,
    date: 'Abr 2024',
    text: 'Melhor café de Aracaju! Os gatinhos são um charme extra. Café de qualidade com uma causa social incrível.',
    partnerResponse: null,
    partnerInitials: null,
  },
];

// Picks first 6 destinations as "favorites"
const MOCK_FAVORITES = destinations.slice(0, 6);

function categoryToFilter(category: string): FavFilter {
  const cat = category.toLowerCase();
  if (cat.includes('hotel') || cat.includes('hosped') || cat.includes('pousada'))
    return 'hoteis';
  if (
    cat.includes('restaurante') ||
    cat.includes('gastronomia') ||
    cat.includes('café') ||
    cat.includes('cafe')
  )
    return 'restaurantes';
  return 'atracoes';
}

// ─── Star row helper ───────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={14}
          color={n <= rating ? '#F59E0B' : '#D1D5DB'}
          fill={n <= rating ? '#F59E0B' : 'none'}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

// ─── Toggle switch ─────────────────────────────────────────────
function Toggle({
  active,
  onChange,
}: {
  active: boolean;
  onChange: () => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={active}
      onClick={onChange}
      className={`relative w-[48px] h-[26px] rounded-full flex-shrink-0 border-none cursor-pointer transition-colors duration-200 ${
        active ? 'bg-[var(--primary)]' : 'bg-[var(--cinza-med)]'
      }`}
    >
      <span
        className={`absolute top-[3px] w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200 ${
          active ? 'left-[24px]' : 'left-[3px]'
        }`}
      />
    </button>
  );
}

// ─── Prop types ────────────────────────────────────────────────
interface PerfilScreenProps {
  onToast: (message: string) => void;
  language: 'pt' | 'en' | 'es';
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

// ─── Main component ────────────────────────────────────────────
export function PerfilScreen({
  onToast,
  language,
  userProfile,
  onUpdateProfile,
}: PerfilScreenProps) {
  const t = translations[language] as typeof translations['pt'] & {
    notifNewsletter: string;
    tabDados: string;
    tabNotificacoes: string;
    tabRoteiros: string;
    tabFavoritos: string;
    tabAvaliacoes: string;
    tabPedidos: string;
    changePasswordTitle: string;
    currentPasswordLabel: string;
    newPasswordLabel: string;
    confirmNewPasswordLabel: string;
    passwordChanged: string;
    filterAll: string;
    filterAtracoes: string;
    filterRestaurantes: string;
    filterHoteis: string;
    noFavorites: string;
    statusPendente: string;
    statusEmProducao: string;
    statusACaminho: string;
    statusEntregue: string;
    viewOrder: string;
    exportPDF: string;
    createNewItinerary: string;
    noReviews: string;
    noItineraries: string;
    partnerResponseLabel: string;
    noOrders: string;
    itineraryDeleted: string;
    favoriteRemoved: string;
    reviewDeleted: string;
  };

  // ── Form state ──
  const isEstabelecimento =
    (userProfile as UserProfile & { role?: string }).role === 'estabelecimento' ||
    userProfile.userType === 'estabelecimento';

  const [fullName, setFullName] = useState(
    isEstabelecimento ? 'Miauteria Cat Café' : userProfile.name
  );
  const [email, setEmail] = useState(
    isEstabelecimento ? 'contato@miauteriacafe.com.br' : userProfile.email
  );
  const [phone, setPhone] = useState(
    isEstabelecimento
      ? '(79) 98765-4321'
      : userProfile.phone || '(79) 98765-4321'
  );
  const [cnpj, setCnpj] = useState(
    isEstabelecimento ? '12.345.678/0001-95' : ''
  );

  // ── Password change ──
  const [showPassword, setShowPassword] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  // ── Notifications ──
  const [notifs, setNotifs] = useState({
    nearby: userProfile.notifications?.nearby ?? true,
    promotions: userProfile.notifications?.promotions ?? true,
    reminders: userProfile.notifications?.reminders ?? false,
    events: userProfile.notifications?.events ?? false,
    newsletter: false,
  });

  // ── Tabs ──
  const [activeTab, setActiveTab] = useState<Tab>('dados');

  // ── Favorites filter ──
  const [favFilter, setFavFilter] = useState<FavFilter>('all');

  // ── Itineraries ──
  const [itineraries, setItineraries] = useState(MOCK_ITINERARIES);

  // ── Reviews ──
  const [reviews, setReviews] = useState(MOCK_REVIEWS);

  // ── Handlers ──
  const handleSaveData = () => {
    onUpdateProfile({
      ...userProfile,
      name: fullName,
      email,
      phone,
      notifications: {
        nearby: notifs.nearby,
        promotions: notifs.promotions,
        reminders: notifs.reminders,
        events: notifs.events,
      },
    });
    onToast(t.dataSaved);
  };

  const handleChangePassword = () => {
    if (!currentPwd || !newPwd || !confirmPwd) return;
    if (newPwd !== confirmPwd) {
      onToast(t.passwordsDontMatch);
      return;
    }
    onToast(t.passwordChanged || '✅ Senha alterada com sucesso!');
    setCurrentPwd('');
    setNewPwd('');
    setConfirmPwd('');
    setShowPassword(false);
  };

  const handleDownloadData = () => {
    const data = JSON.stringify({ fullName, email, phone, cnpj }, null, 2);
    const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meus-dados-sergipanidade.json';
    a.click();
    URL.revokeObjectURL(url);
    onToast(t.downloadDataToast);
  };

  const toggleNotif = (key: keyof typeof notifs) => {
    const next = !notifs[key];
    setNotifs((p) => ({ ...p, [key]: next }));
    onToast(
      `🔔 ${
        key === 'newsletter'
          ? t.notifNewsletter || 'Newsletter semanal'
          : key === 'nearby'
          ? t.notifNearby
          : key === 'promotions'
          ? t.notifPromotions
          : key === 'reminders'
          ? t.notifReminders
          : t.notifEvents
      } ${next ? t.notifActivated : t.notifDeactivated}`
    );
  };

  // ── Badge config ──
  const badgeMap: Record<string, string> = {
    turista: 'TURISTA',
    estabelecimento: 'PARCEIRO',
  };

  const badgeBg: Record<string, string> = {
    turista: 'var(--primary)',
    estabelecimento: '#7C3AED',
  };

  const profileBadge = badgeMap[userProfile.userType] || 'TURISTA';
  const profileBadgeBg = badgeBg[userProfile.userType] || 'var(--primary)';

  // ── Tab config ──
  const TABS: { id: Tab; label: string; Icon: typeof User }[] = [
    { id: 'dados', label: t.tabDados || 'Dados', Icon: User },
    { id: 'notificacoes', label: t.tabNotificacoes || 'Notificações', Icon: Bell },
    { id: 'roteiros', label: t.tabRoteiros || 'Roteiros', Icon: Route },
    { id: 'favoritos', label: t.tabFavoritos || 'Favoritos', Icon: Heart },
    { id: 'avaliacoes', label: t.tabAvaliacoes || 'Avaliações', Icon: Star },
  ];

  const notifItems = [
    { key: 'nearby' as const, label: t.notifNearby },
    { key: 'promotions' as const, label: t.notifPromotions },
    { key: 'reminders' as const, label: t.notifReminders },
    { key: 'events' as const, label: t.notifEvents },
    { key: 'newsletter' as const, label: t.notifNewsletter || 'Newsletter semanal' },
  ];

  const filteredFavs =
    favFilter === 'all'
      ? MOCK_FAVORITES
      : MOCK_FAVORITES.filter((d) => categoryToFilter(d.category) === favFilter);

  // ──────────────────────────────────────────────────────────────
  return (
    <div
      className="bg-[var(--cinza-leve)] min-h-screen"
      style={{
        paddingTop: 'calc(56px + env(safe-area-inset-top))',
        paddingBottom: 'calc(72px + env(safe-area-inset-bottom))',
      }}
    >
      {/* ── PROFILE HEADER ── */}
      <div
        className="px-4 sm:px-8 py-10"
        style={{ backgroundColor: '#111111' }}
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <UserAvatar
            name={userProfile.name}
            size={72}
            bgColor="var(--primary)"
          />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1.5">
              <h1
                className="font-['Fjalla_One'] text-white tracking-wide"
                style={{ fontSize: '28px', lineHeight: 1.1 }}
              >
                {userProfile.name}
              </h1>
              <span
                className="px-2.5 py-0.5 rounded-full text-white font-['Fjalla_One'] tracking-wider"
                style={{ fontSize: '11px', backgroundColor: profileBadgeBg }}
              >
                {profileBadge}
              </span>
            </div>
            <p className="text-white/50" style={{ fontSize: '14px' }}>
              {userProfile.email}&nbsp;·&nbsp;
              {userProfile.userType === 'turista' ? t.touristLabel : t.establishmentLabel}
              &nbsp;·&nbsp;
              {t.memberSince} Jan 2024
            </p>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-6 sm:gap-8 mt-2 sm:mt-0">
            {[
              { value: '2', label: 'Roteiros' },
              { value: '6', label: 'Favoritos' },
              { value: '3', label: 'Avaliações' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div
                  className="font-['Fjalla_One'] text-white"
                  style={{ fontSize: '22px' }}
                >
                  {stat.value}
                </div>
                <div className="text-white/40" style={{ fontSize: '11px' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── STICKY TABS ── */}
      <div
        className="sticky z-[80] bg-white border-b border-[var(--cinza-med)] shadow-sm overflow-x-auto"
        style={{ top: 'calc(56px + env(safe-area-inset-top))' }}
      >
        <div className="flex max-w-4xl mx-auto px-4 sm:px-8">
          {TABS.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-3.5 whitespace-nowrap
                             bg-transparent border-none cursor-pointer min-h-[44px] transition-colors
                             ${isActive ? 'text-[var(--primary)]' : 'text-[var(--cinza-txt)] hover:text-[var(--preto)]'}`}
                style={{ fontSize: '13px', fontWeight: isActive ? 600 : 400 }}
              >
                <Icon size={15} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.split(' ')[0]}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-full bg-[var(--primary)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6">
        {/* ────── ABA DADOS ────── */}
        {activeTab === 'dados' && (
          <div className="space-y-6">
            <div className="bg-white rounded-[var(--radius)] p-6 shadow-[var(--sombra-sm)]">
              <h2
                className="font-['Fjalla_One'] text-[var(--preto)] mb-5"
                style={{ fontSize: '20px' }}
              >
                {t.profileData}
              </h2>

              {/* 2-col grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {[
                  { label: t.fullName, value: fullName, setter: setFullName, type: 'text' },
                  { label: t.email, value: email, setter: setEmail, type: 'email' },
                ].map(({ label, value, setter, type }) => (
                  <div key={label}>
                    <label
                      className="block mb-1.5 text-[var(--cinza-txt)] uppercase tracking-widest"
                      style={{ fontSize: '11px', fontWeight: 700 }}
                    >
                      {label}
                    </label>
                    <input
                      type={type}
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      className="w-full px-4 py-3 border-[1.5px] border-[var(--cinza-med)] rounded-[var(--radius-sm)]
                                 bg-[var(--cinza-leve)] outline-none text-[var(--preto)]
                                 focus:border-[var(--primary)] focus:bg-white transition-all"
                      style={{ fontSize: '14px' }}
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <label
                    className="block mb-1.5 text-[var(--cinza-txt)] uppercase tracking-widest"
                    style={{ fontSize: '11px', fontWeight: 700 }}
                  >
                    {t.phone}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 border-[1.5px] border-[var(--cinza-med)] rounded-[var(--radius-sm)]
                               bg-[var(--cinza-leve)] outline-none text-[var(--preto)]
                               focus:border-[var(--primary)] focus:bg-white transition-all"
                    style={{ fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label
                    className="block mb-1.5 text-[var(--cinza-txt)] uppercase tracking-widest"
                    style={{ fontSize: '11px', fontWeight: 700 }}
                  >
                    CNPJ
                  </label>
                  <input
                    type="text"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    className="w-full px-4 py-3 border-[1.5px] border-[var(--cinza-med)] rounded-[var(--radius-sm)]
                               bg-[var(--cinza-leve)] outline-none text-[var(--preto)]
                               focus:border-[var(--primary)] focus:bg-white transition-all"
                    style={{ fontSize: '14px' }}
                  />
                </div>
              </div>

              <button
                onClick={handleSaveData}
                className="min-h-[48px] px-8 rounded-[var(--radius-sm)] bg-[var(--primary)] text-white
                           border-none cursor-pointer font-['Fjalla_One'] tracking-wider
                           hover:bg-[#D04820] transition-colors"
                style={{ fontSize: '14px' }}
              >
                {t.saveData}
              </button>
            </div>

            {/* Password change collapsible */}
            <div className="bg-white rounded-[var(--radius)] shadow-[var(--sombra-sm)] overflow-hidden">
              <button
                onClick={() => setShowPassword((v) => !v)}
                className="w-full flex items-center justify-between px-6 py-4 bg-transparent border-none
                           cursor-pointer min-h-[56px] text-left hover:bg-[var(--cinza-leve)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[var(--cinza-leve)] flex items-center justify-center">
                    <Lock size={16} color="var(--cinza-txt)" />
                  </div>
                  <span
                    className="font-semibold text-[var(--preto)]"
                    style={{ fontSize: '15px' }}
                  >
                    {t.changePasswordTitle || 'Alterar Senha'}
                  </span>
                </div>
                {showPassword ? (
                  <ChevronUp size={18} color="var(--cinza-txt)" />
                ) : (
                  <ChevronDown size={18} color="var(--cinza-txt)" />
                )}
              </button>

              {showPassword && (
                <div className="px-6 pb-6 pt-2 border-t border-[var(--cinza-med)]">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    {[
                      {
                        label: t.currentPasswordLabel || 'Senha atual',
                        value: currentPwd,
                        setter: setCurrentPwd,
                      },
                      {
                        label: t.newPasswordLabel || 'Nova senha',
                        value: newPwd,
                        setter: setNewPwd,
                      },
                      {
                        label: t.confirmNewPasswordLabel || 'Confirmar nova senha',
                        value: confirmPwd,
                        setter: setConfirmPwd,
                      },
                    ].map(({ label, value, setter }) => (
                      <div key={label}>
                        <label
                          className="block mb-1.5 text-[var(--cinza-txt)] uppercase tracking-widest"
                          style={{ fontSize: '11px', fontWeight: 700 }}
                        >
                          {label}
                        </label>
                        <input
                          type="password"
                          value={value}
                          onChange={(e) => setter(e.target.value)}
                          className="w-full px-4 py-3 border-[1.5px] border-[var(--cinza-med)] rounded-[var(--radius-sm)]
                                     bg-[var(--cinza-leve)] outline-none text-[var(--preto)]
                                     focus:border-[var(--primary)] focus:bg-white transition-all"
                          style={{ fontSize: '14px' }}
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleChangePassword}
                    disabled={!currentPwd || !newPwd || !confirmPwd}
                    className="px-6 py-2.5 rounded-[var(--radius-sm)] bg-[var(--preto)] text-white
                               border-none cursor-pointer font-semibold
                               hover:bg-[#333] transition-colors
                               disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ fontSize: '13px' }}
                  >
                    {t.changePasswordTitle || 'Alterar Senha'}
                  </button>
                </div>
              )}
            </div>

            {/* LGPD */}
            <div className="bg-white rounded-[var(--radius)] p-6 shadow-[var(--sombra-sm)]">
              <div className="flex items-center gap-3 mb-3">
                <Shield size={18} color="var(--cinza-txt)" />
                <h2 className="font-semibold text-[var(--preto)]" style={{ fontSize: '15px' }}>
                  {t.privacyCenter}
                </h2>
              </div>
              <p className="text-[var(--cinza-txt)] leading-relaxed mb-4" style={{ fontSize: '13px' }}>
                {t.lgpdMessage}{' '}
                <strong className="text-[var(--preto)]">{t.lgpdFullName}</strong>
                {t.lgpdRights}
              </p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleDownloadData}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-sm)] border border-[var(--cinza-med)]
                             bg-white text-[var(--preto)] cursor-pointer hover:border-[var(--preto)] transition-colors"
                  style={{ fontSize: '13px' }}
                >
                  <Download size={14} />
                  {t.downloadData}
                </button>
                <button
                  onClick={() => onToast(t.termsOpened)}
                  className="px-4 py-2 rounded-[var(--radius-sm)] border border-[var(--cinza-med)]
                             bg-white text-[var(--preto)] cursor-pointer hover:border-[var(--preto)] transition-colors"
                  style={{ fontSize: '13px' }}
                >
                  {t.termsOfUse}
                </button>
                <button
                  onClick={() => onToast(t.privacyOpened)}
                  className="px-4 py-2 rounded-[var(--radius-sm)] border border-[var(--cinza-med)]
                             bg-white text-[var(--preto)] cursor-pointer hover:border-[var(--preto)] transition-colors"
                  style={{ fontSize: '13px' }}
                >
                  {t.privacyPolicy}
                </button>
                <button
                  onClick={() => onToast(t.deleteAccountToast)}
                  className="px-4 py-2 rounded-[var(--radius-sm)] border border-[var(--vermelho)]
                             bg-white text-[var(--vermelho)] cursor-pointer hover:bg-red-50 transition-colors"
                  style={{ fontSize: '13px' }}
                >
                  {t.deleteAccount}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ────── ABA NOTIFICAÇÕES ────── */}
        {activeTab === 'notificacoes' && (
          <div className="bg-white rounded-[var(--radius)] p-6 shadow-[var(--sombra-sm)]">
            <h2
              className="font-['Fjalla_One'] text-[var(--preto)] mb-5"
              style={{ fontSize: '20px' }}
            >
              {t.notifications}
            </h2>
            <div className="space-y-1">
              {notifItems.map(({ key, label }) => (
                <div
                  key={key}
                  className="flex items-center justify-between px-4 py-3.5 rounded-[var(--radius-sm)]
                             hover:bg-[var(--cinza-leve)] transition-colors"
                >
                  <div>
                    <p className="text-[var(--preto)] font-medium" style={{ fontSize: '14px' }}>
                      {label}
                    </p>
                    <p className="text-[var(--cinza-txt)]" style={{ fontSize: '12px' }}>
                      {notifs[key] ? 'Ativo' : 'Inativo'}
                    </p>
                  </div>
                  <Toggle active={notifs[key]} onChange={() => toggleNotif(key)} />
                </div>
              ))}
            </div>
            <p className="text-[var(--cinza-txt)] mt-4 px-4" style={{ fontSize: '12px' }}>
              {t.notificationsSavedAutomatically}
            </p>
          </div>
        )}

        {/* ────── ABA ROTEIROS SALVOS ────── */}
        {activeTab === 'roteiros' && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {itineraries.map((itin) => (
                <div
                  key={itin.id}
                  className="bg-white rounded-[var(--radius)] shadow-[var(--sombra-sm)] overflow-hidden"
                >
                  {/* Thumbnail */}
                  <div className="relative h-[140px] overflow-hidden">
                    <ImageWithFallback
                      src={itin.img}
                      alt={itin.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <p
                        className="font-['Fjalla_One'] text-white tracking-wide"
                        style={{ fontSize: '16px' }}
                      >
                        {itin.title}
                      </p>
                      <div className="flex items-center gap-2 text-white/70" style={{ fontSize: '12px' }}>
                        <Calendar size={11} />
                        <span>{itin.days} dias</span>
                        <span>·</span>
                        <span>{itin.type}</span>
                        <span>·</span>
                        <MapPin size={11} />
                        <span>{itin.stops} paradas</span>
                      </div>
                    </div>
                    <div
                      className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/50 text-white"
                      style={{ fontSize: '10px' }}
                    >
                      {itin.date}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 px-3 py-3 border-t border-[var(--cinza-med)]">
                    {[
                      { label: 'Ver', Icon: Eye },
                      { label: 'Editar', Icon: Edit3 },
                      { label: t.exportPDF || 'PDF', Icon: FileDown },
                    ].map(({ label, Icon }) => (
                      <button
                        key={label}
                        onClick={() => onToast(`📄 ${label}: ${itin.title}`)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-[var(--radius-sm)]
                                   border border-[var(--cinza-med)] bg-white text-[var(--preto)]
                                   cursor-pointer hover:border-[var(--primary)] hover:text-[var(--primary)]
                                   transition-colors min-h-[36px]"
                        style={{ fontSize: '12px' }}
                      >
                        <Icon size={12} />
                        {label}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setItineraries((p) => p.filter((it) => it.id !== itin.id));
                        onToast(t.itineraryDeleted || '🗑️ Roteiro excluído');
                      }}
                      className="ml-auto flex items-center gap-1 px-2.5 py-1.5 rounded-[var(--radius-sm)]
                                 border border-red-200 bg-white text-red-500
                                 cursor-pointer hover:bg-red-50 transition-colors min-h-[36px]"
                      style={{ fontSize: '12px' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Create new */}
              <button
                onClick={() => onToast('🗺️ Abrindo wizard de roteiro…')}
                className="min-h-[200px] rounded-[var(--radius)] border-2 border-dashed border-[var(--cinza-med)]
                           bg-white flex flex-col items-center justify-center gap-3
                           cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--laranja-leve)]
                           transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--cinza-leve)] group-hover:bg-[var(--primary)]/10
                                flex items-center justify-center transition-colors">
                  <Plus size={22} color="var(--primary)" />
                </div>
                <p
                  className="text-[var(--cinza-txt)] group-hover:text-[var(--primary)] font-medium transition-colors"
                  style={{ fontSize: '14px' }}
                >
                  {t.createNewItinerary || 'Criar novo roteiro'}
                </p>
              </button>
            </div>
          </div>
        )}

        {/* ────── ABA FAVORITOS ────── */}
        {activeTab === 'favoritos' && (
          <div>
            {/* Filter chips */}
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
              {[
                { id: 'all' as const, label: t.filterAll || 'Todos' },
                { id: 'atracoes' as const, label: t.filterAtracoes || 'Atrações' },
                { id: 'restaurantes' as const, label: t.filterRestaurantes || 'Restaurantes' },
                { id: 'hoteis' as const, label: t.filterHoteis || 'Hotéis' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setFavFilter(id)}
                  className={`px-4 py-2 rounded-full border whitespace-nowrap cursor-pointer transition-all min-h-[36px]
                               ${
                                 favFilter === id
                                   ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                                   : 'bg-white border-[var(--cinza-med)] text-[var(--cinza-txt)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
                               }`}
                  style={{ fontSize: '13px' }}
                >
                  {label}
                </button>
              ))}
            </div>

            {filteredFavs.length === 0 ? (
              <div className="text-center py-16 text-[var(--cinza-txt)]">
                <Heart size={40} className="mx-auto mb-3 opacity-30" />
                <p style={{ fontSize: '15px' }}>{t.noFavorites || 'Nenhum favorito salvo ainda'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredFavs.map((dest) => (
                  <div
                    key={dest.id}
                    className="bg-white rounded-[var(--radius)] overflow-hidden shadow-[var(--sombra-sm)]
                               hover:shadow-[var(--sombra-md)] transition-shadow cursor-pointer group"
                  >
                    <div className="relative h-[110px] overflow-hidden">
                      <ImageWithFallback
                        src={dest.image}
                        alt={dest.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Heart button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToast(t.favoriteRemoved || '💔 Removido dos favoritos');
                        }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90
                                   flex items-center justify-center border-none cursor-pointer
                                   hover:scale-110 transition-transform shadow-sm"
                      >
                        <Heart size={14} color="var(--primary)" fill="var(--primary)" />
                      </button>
                    </div>
                    <div className="px-3 py-2">
                      <p
                        className="font-semibold text-[var(--preto)] truncate"
                        style={{ fontSize: '13px' }}
                      >
                        {dest.name}
                      </p>
                      <p className="text-[var(--cinza-txt)] truncate" style={{ fontSize: '11px' }}>
                        {dest.category} · {dest.region}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ────── ABA AVALIAÇÕES ────── */}
        {activeTab === 'avaliacoes' && (
          <div className="space-y-4">
            {reviews.length === 0 && (
              <div className="text-center py-16 text-[var(--cinza-txt)]">
                <Star size={40} className="mx-auto mb-3 opacity-30" />
                <p style={{ fontSize: '15px' }}>{t.noReviews || 'Nenhuma avaliação feita ainda'}</p>
              </div>
            )}
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-[var(--radius)] p-5 shadow-[var(--sombra-sm)]"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p
                      className="font-semibold text-[var(--preto)]"
                      style={{ fontSize: '15px' }}
                    >
                      {rev.place}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Stars rating={rev.rating} />
                      <span className="text-[var(--cinza-txt)]" style={{ fontSize: '12px' }}>
                        {rev.date}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => onToast('✏️ Editar avaliação')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-[var(--radius-sm)]
                                 border border-[var(--cinza-med)] bg-white text-[var(--cinza-txt)]
                                 cursor-pointer hover:text-[var(--preto)] hover:border-[var(--preto)]
                                 transition-colors min-h-[36px]"
                      style={{ fontSize: '12px' }}
                    >
                      <Edit3 size={12} />
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        setReviews((p) => p.filter((r) => r.id !== rev.id));
                        onToast(t.reviewDeleted || '🗑️ Avaliação excluída');
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-[var(--radius-sm)]
                                 border border-red-200 bg-white text-red-500
                                 cursor-pointer hover:bg-red-50 transition-colors min-h-[36px]"
                      style={{ fontSize: '12px' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Comment */}
                <p
                  className="text-[var(--cinza-txt)] leading-relaxed mb-3"
                  style={{ fontSize: '14px' }}
                >
                  {rev.text}
                </p>

                {/* Partner response */}
                {rev.partnerResponse && (
                  <div className="ml-4 pl-4 border-l-2 border-[var(--primary)]/30 bg-[var(--laranja-leve)] rounded-r-[var(--radius-sm)] px-3 py-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className="w-7 h-7 rounded-full bg-[var(--primary)] flex items-center justify-center flex-shrink-0"
                        style={{ fontSize: '10px', color: 'white', fontWeight: 700 }}
                      >
                        {rev.partnerInitials}
                      </div>
                      <p
                        className="font-semibold text-[var(--preto)]"
                        style={{ fontSize: '12px' }}
                      >
                        {t.partnerResponseLabel || 'Resposta do estabelecimento:'}
                      </p>
                    </div>
                    <p className="text-[var(--cinza-txt)] leading-relaxed" style={{ fontSize: '13px' }}>
                      {rev.partnerResponse}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
