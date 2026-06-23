import { useState, useEffect, lazy, Suspense } from 'react';
import { useToast } from "@/context/AppContext";
import {
  User,
  Bell,
  Heart,
  Star,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  Lock,
  Download,
  Shield,
} from 'lucide-react';
import { translations } from "@/constants/translations";
import { UserAvatar } from '@/components/shared/UserAvatar';
import { destinations } from "@/constants/destinations";
import type { UserProfile } from '@/types';
import { ImageWithFallback } from '@/components/shared/ImageWithFallback';
const LazyDocumentosModal = lazy(() => import('@/components/shared/DocumentosModal').then(m => ({ default: m.DocumentosModal })));

import { mockService, UserReview, Itinerary } from '@/services/mock.service';

// ─── Types ────────────────────────────────────────────────────
type Tab =
  | 'dados'
  | 'notificacoes'
  | 'favoritos'
  | 'avaliacoes';
type FavFilter = 'all' | 'atracoes' | 'restaurantes' | 'hoteis';

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
function Stars({ rating }: { rating: number }): JSX.Element {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n: number): JSX.Element => (
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
}): JSX.Element {
  return (
    <button
      role="switch"
      aria-checked={active}
      onClick={onChange}
      className={`relative w-12 h-6.5 rounded-full shrink-0 border-none cursor-pointer transition-colors duration-200 ${
        active ? 'bg-primary' : 'bg-(--cinza-med)'
      }`}
    >
      <span
        className={`absolute top-0.75 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200 ${
          active ? 'left-6' : 'left-0.75'
        }`}
      />
    </button>
  );
}

// ─── Prop types ────────────────────────────────────────────────
interface PerfilScreenProps {
  language: 'pt' | 'en' | 'es' | 'sp';
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

// ─── Main component ────────────────────────────────────────────
export function PerfilScreen({
  language,
  userProfile,
  onUpdateProfile,
}: PerfilScreenProps): JSX.Element {
  const { toast: onToast } = useToast();
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

  const [fullName, setFullName] = useState<string>(
    isEstabelecimento ? 'Miauteria Cat Café' : userProfile.name
  );
  const [email, setEmail] = useState<string>(
    isEstabelecimento ? 'contato@miauteriacafe.com.br' : userProfile.email
  );
  const [phone, setPhone] = useState<string>(
    isEstabelecimento
      ? '(79) 98765-4321'
      : userProfile.phone || '(79) 98765-4321'
  );
  const [cnpj, setCnpj] = useState<string>(
    isEstabelecimento ? '12.345.678/0001-95' : ''
  );

  // ── Password change ──
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [currentPwd, setCurrentPwd] = useState<string>('');
  const [newPwd, setNewPwd] = useState<string>('');
  const [confirmPwd, setConfirmPwd] = useState<string>('');

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
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);

  // ── Reviews ──
  const [reviews, setReviews] = useState<UserReview[]>([]);

  // ── Favorites ──
  const [favorites, setFavorites] = useState<typeof destinations>([]);

  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [docsTab, setDocsTab] = useState<'termos' | 'privacidade'>('termos');

  useEffect(() => {
    mockService.itineraries.getItineraries().then(setItineraries);
    mockService.reviews.getUserReviews().then(setReviews);
    mockService.favorites.getFavorites().then(setFavorites);
  }, []);

  // ── Handlers ──
  const handleSaveData = (): void => {
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

  const handleChangePassword = (): void => {
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

  const handleDownloadData = (): void => {
    const data = JSON.stringify({ fullName, email, phone, cnpj }, null, 2);
    const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meus-dados-sergipanidade.json';
    a.click();
    URL.revokeObjectURL(url);
    onToast(t.downloadDataToast);
  };

  const toggleNotif = (key: keyof typeof notifs): void => {
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
    ...(!isEstabelecimento ? [
      { id: 'notificacoes' as Tab, label: t.tabNotificacoes || 'Notificações', Icon: Bell },
      { id: 'favoritos' as Tab, label: t.tabFavoritos || 'Favoritos', Icon: Heart },
      { id: 'avaliacoes' as Tab, label: t.tabAvaliacoes || 'Avaliações', Icon: Star },
    ] : []),
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
      ? favorites
      : favorites.filter((d) => categoryToFilter(d.category) === favFilter);

  // ──────────────────────────────────────────────────────────────
  // ──────────────────────────────────────────────────────────────
  return (
    <div
      className="bg-(--cinza-leve) min-h-screen"
      style={{
        paddingTop: 'calc(56px + env(safe-area-inset-top))',
        paddingBottom: 'calc(72px + env(safe-area-inset-bottom))',
      }}
    >
      {/* ── PROFILE HEADER ── */}
      <div
        className="px-4 sm:px-8 py-10"
        style={{ background: 'linear-gradient(135deg, #0D2B2E 0%, #0D7377 60%, #14544A 100%)' }}
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <UserAvatar
            name={userProfile.name}
            photoUrl={userProfile.photo}
            size={72}
            bgColor="var(--primary)"
          />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1.5">
              <h1
                className="font-semibold font-display text-white tracking-tight"
                style={{ fontSize: '28px', lineHeight: 1.1 }}
              >
                {userProfile.name}
              </h1>
              <span
                className="px-2.5 py-0.5 rounded-full text-white font-bold tracking-wider"
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
            ].map((stat: { value: string; label: string }): JSX.Element => (
              <div key={stat.label} className="text-center">
                <div
                  className="font-semibold font-display text-white"
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
        className="sticky z-80 bg-white border-b border-(--cinza-med) shadow-sm overflow-x-auto"
        style={{ top: 'calc(56px + env(safe-area-inset-top))' }}
      >
        <div className="flex max-w-4xl mx-auto px-4 sm:px-8">
          {TABS.map(({ id, label, Icon }: { id: Tab; label: string; Icon: typeof User }): JSX.Element => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-3.5 whitespace-nowrap
                             bg-transparent border-none cursor-pointer min-h-11 transition-colors
                             ${isActive ? 'text-primary' : 'text-(--cinza-txt) hover:text-(--preto)'}`}
                style={{ fontSize: '13px', fontWeight: isActive ? 600 : 400 }}
              >
                <Icon size={15} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.split(' ')[0]}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-full bg-primary" />
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
            <div className="bg-white rounded-lg p-6 shadow-(--sombra-sm)">
              <h2
                className="font-semibold font-display text-(--preto) mb-5"
                style={{ fontSize: '20px' }}
              >
                {t.profileData}
              </h2>

              {/* 2-col grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {[
                  { label: t.fullName, value: fullName, setter: setFullName, type: 'text' },
                  { label: t.email, value: email, setter: setEmail, type: 'email' },
                ].map(({ label, value, setter, type }: { label: string; value: string; setter: (v: string) => void; type: string }): JSX.Element => (
                  <div key={label}>
                    <label
                      className="block mb-1.5 text-(--cinza-txt) uppercase tracking-widest"
                      style={{ fontSize: '11px', fontWeight: 700 }}
                    >
                      {label}
                    </label>
                    <input
                      type={type}
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      className="w-full px-4 py-3 border-[1.5px] border-(--cinza-med) rounded-sm
                                 bg-(--cinza-leve) outline-none text-(--preto)
                                 focus:border-primary focus:bg-white transition-all"
                      style={{ fontSize: '14px' }}
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <label
                    className="block mb-1.5 text-(--cinza-txt) uppercase tracking-widest"
                    style={{ fontSize: '11px', fontWeight: 700 }}
                  >
                    {t.phone}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 border-[1.5px] border-(--cinza-med) rounded-sm
                               bg-(--cinza-leve) outline-none text-(--preto)
                               focus:border-primary focus:bg-white transition-all"
                    style={{ fontSize: '14px' }}
                  />
                </div>
                {isEstabelecimento && (
                  <div>
                    <label
                      className="block mb-1.5 text-(--cinza-txt) uppercase tracking-widest"
                      style={{ fontSize: '11px', fontWeight: 700 }}
                    >
                      CNPJ
                    </label>
                    <input
                      type="text"
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      className="w-full px-4 py-3 border-[1.5px] border-(--cinza-med) rounded-sm
                                 bg-(--cinza-leve) outline-none text-(--preto)
                                 focus:border-primary focus:bg-white transition-all"
                      style={{ fontSize: '14px' }}
                    />
                  </div>
                )}
              </div>

              <button
                onClick={handleSaveData}
                 className="min-h-12 px-8 rounded-sm bg-primary text-white
                            border-none cursor-pointer font-bold tracking-wider
                            hover:bg-[#D04820] transition-colors"
                style={{ fontSize: '14px' }}
              >
                {t.saveData}
              </button>
            </div>

            {/* Password change collapsible */}
            <div className="bg-white rounded-lg shadow-(--sombra-sm) overflow-hidden">
              <button
                onClick={() => setShowPassword((v) => !v)}
                className="w-full flex items-center justify-between px-6 py-4 bg-transparent border-none
                           cursor-pointer min-h-14 text-left hover:bg-(--cinza-leve) transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-(--cinza-leve) flex items-center justify-center">
                    <Lock size={16} color="var(--cinza-txt)" />
                  </div>
                  <span
                    className="font-semibold text-(--preto)"
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
                <div className="px-6 pb-6 pt-2 border-t border-(--cinza-med)">
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
                    ].map(({ label, value, setter }: { label: string; value: string; setter: (v: string) => void }): JSX.Element => (
                      <div key={label}>
                        <label
                          className="block mb-1.5 text-(--cinza-txt) uppercase tracking-widest"
                          style={{ fontSize: '11px', fontWeight: 700 }}
                        >
                          {label}
                        </label>
                        <input
                          type="password"
                          value={value}
                          onChange={(e) => setter(e.target.value)}
                          className="w-full px-4 py-3 border-[1.5px] border-(--cinza-med) rounded-sm
                                     bg-(--cinza-leve) outline-none text-(--preto)
                                     focus:border-primary focus:bg-white transition-all"
                          style={{ fontSize: '14px' }}
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleChangePassword}
                    disabled={!currentPwd || !newPwd || !confirmPwd}
                    className="px-6 py-2.5 rounded-sm bg-(--preto) text-white
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
            <div className="bg-white rounded-lg p-6 shadow-(--sombra-sm)">
              <div className="flex items-center gap-3 mb-3">
                <Shield size={18} color="var(--cinza-txt)" />
                <h2 className="font-semibold text-(--preto)" style={{ fontSize: '15px' }}>
                  {t.privacyCenter}
                </h2>
              </div>
              <p className="text-(--cinza-txt) leading-relaxed mb-4" style={{ fontSize: '13px' }}>
                {t.lgpdMessage}{' '}
                <strong className="text-(--preto)">{t.lgpdFullName}</strong>
                {t.lgpdRights}
              </p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleDownloadData}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-sm border border-(--cinza-med)
                             bg-white text-(--preto) cursor-pointer hover:border-(--preto) transition-colors"
                  style={{ fontSize: '13px' }}
                >
                  <Download size={14} />
                  {t.downloadData}
                </button>
                <button
                  onClick={() => { setDocsTab('termos'); setIsDocsOpen(true); }}
                  className="px-4 py-2 rounded-sm border border-(--cinza-med)
                             bg-white text-(--preto) cursor-pointer hover:border-(--preto) transition-colors"
                  style={{ fontSize: '13px' }}
                >
                  {t.termsOfUse}
                </button>
                <button
                  onClick={() => { setDocsTab('privacidade'); setIsDocsOpen(true); }}
                  className="px-4 py-2 rounded-sm border border-(--cinza-med)
                             bg-white text-(--preto) cursor-pointer hover:border-(--preto) transition-colors"
                  style={{ fontSize: '13px' }}
                >
                  {t.privacyPolicy}
                </button>
                <button
                  onClick={() => onToast(t.deleteAccountToast)}
                  className="px-4 py-2 rounded-sm border border-(--vermelho)
                             bg-white text-(--vermelho) cursor-pointer hover:bg-red-55 transition-colors"
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
          <div className="bg-white rounded-lg p-6 shadow-(--sombra-sm)">
            <h2
              className="font-semibold font-display text-(--preto) mb-5"
              style={{ fontSize: '20px' }}
            >
              {t.notifications}
            </h2>
            <div className="space-y-1">
              {notifItems.map(({ key, label }: { key: keyof typeof notifs; label: string }): JSX.Element => (
                <div
                  key={key}
                  className="flex items-center justify-between px-4 py-3.5 rounded-sm
                             hover:bg-(--cinza-leve) transition-colors"
                >
                  <div>
                    <p className="text-(--preto) font-medium" style={{ fontSize: '14px' }}>
                      {label}
                    </p>
                    <p className="text-(--cinza-txt)" style={{ fontSize: '12px' }}>
                      {notifs[key] ? 'Ativo' : 'Inativo'}
                    </p>
                  </div>
                  <Toggle active={notifs[key]} onChange={() => toggleNotif(key)} />
                </div>
              ))}
            </div>
            <p className="text-(--cinza-txt) mt-4 px-4" style={{ fontSize: '12px' }}>
              {t.notificationsSavedAutomatically}
            </p>
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
              ].map(({ id, label }: { id: FavFilter; label: string }): JSX.Element => (
                <button
                  key={id}
                  onClick={() => setFavFilter(id)}
                  className={`px-4 py-2 rounded-full border whitespace-nowrap cursor-pointer transition-all min-h-9
                               ${
                                 favFilter === id
                                   ? 'bg-primary border-primary text-white'
                                   : 'bg-white border-(--cinza-med) text-(--cinza-txt) hover:border-primary hover:text-primary'
                               }`}
                  style={{ fontSize: '13px' }}
                >
                  {label}
                </button>
              ))}
            </div>

            {filteredFavs.length === 0 ? (
              <div className="text-center py-16 text-(--cinza-txt)">
                <Heart size={40} className="mx-auto mb-3 opacity-30" />
                <p style={{ fontSize: '15px' }}>{t.noFavorites || 'Nenhum favorito salvo ainda'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredFavs.map((dest: typeof destinations[0]): JSX.Element => (
                  <div
                    key={dest.id}
                    className="bg-white rounded-lg overflow-hidden shadow-(--sombra-sm)
                               hover:shadow-(--sombra-md) transition-shadow cursor-pointer group"
                  >
                    <div className="relative h-27.5 overflow-hidden">
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
                        className="font-semibold text-(--preto) truncate"
                        style={{ fontSize: '13px' }}
                      >
                        {dest.name}
                      </p>
                      <p className="text-(--cinza-txt) truncate" style={{ fontSize: '11px' }}>
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
              <div className="text-center py-16 text-(--cinza-txt)">
                <Star size={40} className="mx-auto mb-3 opacity-30" />
                <p style={{ fontSize: '15px' }}>{t.noReviews || 'Nenhuma avaliação feita ainda'}</p>
              </div>
            )}
            {reviews.map((rev: UserReview): JSX.Element => (
              <div
                key={rev.id}
                className="bg-white rounded-lg p-5 shadow-(--sombra-sm)"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p
                      className="font-semibold text-(--preto)"
                      style={{ fontSize: '15px' }}
                    >
                      {rev.place}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Stars rating={rev.rating} />
                      <span className="text-(--cinza-txt)" style={{ fontSize: '12px' }}>
                        {rev.date}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => onToast('✏️ Editar avaliação')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-sm
                                 border border-(--cinza-med) bg-white text-(--cinza-txt)
                                 cursor-pointer hover:text-(--preto) hover:border-(--preto)
                                 transition-colors min-h-9"
                      style={{ fontSize: '12px' }}
                    >
                      <Edit3 size={12} />
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        setReviews((p: UserReview[]): UserReview[] => p.filter((r: UserReview): boolean => r.id !== rev.id));
                        onToast(t.reviewDeleted || '🗑️ Avaliação excluída');
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-sm
                                 border border-red-200 bg-white text-red-500
                                 cursor-pointer hover:bg-red-55 transition-colors min-h-9"
                      style={{ fontSize: '12px' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Comment */}
                <p
                  className="text-(--cinza-txt) leading-relaxed mb-3"
                  style={{ fontSize: '14px' }}
                >
                  {rev.text}
                </p>

                {/* Partner response */}
                {rev.partnerResponse && (
                  <div className="ml-4 pl-4 border-l-2 border-primary/30 bg-(--laranja-leve) rounded-r-sm px-3 py-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0"
                        style={{ fontSize: '10px', color: 'white', fontWeight: 700 }}
                      >
                        {rev.partnerInitials}
                      </div>
                      <p
                        className="font-semibold text-(--preto)"
                        style={{ fontSize: '12px' }}
                      >
                        {t.partnerResponseLabel || 'Resposta do estabelecimento:'}
                      </p>
                    </div>
                    <p className="text-(--cinza-txt) leading-relaxed" style={{ fontSize: '13px' }}>
                      {rev.partnerResponse}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
      
      <Suspense fallback={null}>
        <LazyDocumentosModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} defaultTab={docsTab} />
      </Suspense>
    </div>
  );
}
