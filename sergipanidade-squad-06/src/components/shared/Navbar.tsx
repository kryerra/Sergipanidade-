import { useState, useEffect } from 'react';
import { SergipanidadeLogo } from './SergipanidadeLogo';
import { UserAvatar } from './UserAvatar';
import { translations } from '../../constants/translations';
import sergipanidadeLight from '@/assets/images/SERGIPANIDADE FUNDO CLARO.png';
import sergipanidadeIcon from '@/assets/images/SERGIPANIDADE.png';
import homemImage from '@/assets/images/Homem.png';
import mulherImage from '@/assets/images/MULHER.png';
import fogueiraImage from '@/assets/images/FOGUEIRA.png';
import palmeiraImage from '@/assets/images/PALMEIRA.png';
import {
  Home,
  Map as MapIcon,
  Route,
  Landmark,
  Award,
  ChevronDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useAppContext } from '../../context/AppContext';

interface NavbarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  isVisible: boolean;
  language: 'pt' | 'en' | 'es';
  onChangeLanguage: (lang: 'pt' | 'en' | 'es') => void;
}

export function Navbar({
  currentScreen,
  onNavigate,
  isVisible,
  language,
}: NavbarProps) {
  if (!isVisible) return null;

  const t = translations[language] as typeof translations.pt;
  const { userProfile } = useAppContext();
  const isDev = Boolean((import.meta as any).env?.DEV);
  const isAdminUser = Boolean(
    userProfile?.email === 'admin@sergipanidade.local' ||
    (userProfile as any)?.isAdmin === true ||
    userProfile.userType === 'administrador'
  );
  const isEstablishmentUser = userProfile.userType === 'estabelecimento';

  const bottomNavItems = [
    { label: 'Home', screen: 'home', icon: Home },
    { label: t?.destinations || 'Destinos', screen: 'guia', icon: MapIcon },
    { label: 'Cultura', screen: 'cultura', icon: Landmark },
  ];

  if (isEstablishmentUser) {
    bottomNavItems.push({ label: t?.partner || 'Parceiro', screen: 'parceiro', icon: Award });
  }

  bottomNavItems.push({ label: t?.itinerary || 'Roteiro', screen: 'roteiro', icon: Route });

  const desktopNavItems = [
    { label: 'Home', screen: 'home' },
    { label: t?.destinations || 'Destinos', screen: 'guia' },
    { label: 'Cultura', screen: 'cultura' },
    { label: t?.itinerary || 'Roteiro', screen: 'roteiro' },
  ];

  if (isEstablishmentUser) {
    desktopNavItems.push({ label: t?.partner || 'Parceiro', screen: 'parceiro' });
  }

  // Dev-only controls for logo positioning + multiple image toggles
  const localStorageKey = 'sergipanidade_navbar_dev_settings';
  const navImageOptions = [
    { name: 'SERGIPANIDADE.png', src: sergipanidadeIcon },
    { name: 'Sergipanidade fundo claro.png', src: sergipanidadeLight },
    { name: 'Homem.png', src: homemImage },
    { name: 'MULHER.png', src: mulherImage },
    { name: 'FOGUEIRA.png', src: fogueiraImage },
    { name: 'PALMEIRA.png', src: palmeiraImage },
  ];

  const defaultNavImageSettings = Object.fromEntries(navImageOptions.map((img) => [img.name, { enabled: false, offsetX: 0, offsetY: 0, scale: 1 }])) as Record<string, { enabled: boolean; offsetX: number; offsetY: number; scale: number }>;

  const readStoredNavbarDevSettings = () => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem(localStorageKey);
      if (!saved) return null;
      return JSON.parse(saved) as {
        navOffsetX: number;
        navOffsetY: number;
        navScale: number;
        navImageSettings: Record<string, { enabled: boolean; offsetX: number; offsetY: number; scale: number }>;
      };
    } catch {
      return null;
    }
  };

  const storedNavbarSettings = readStoredNavbarDevSettings();
  const sharedNavbarSettings = (() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem('sergipanidade_navbar_shared_settings');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();
  const [navOffsetX, setNavOffsetX] = useState<number>(() => sharedNavbarSettings?.navOffsetX ?? storedNavbarSettings?.navOffsetX ?? 0);
  const [navOffsetY, setNavOffsetY] = useState<number>(() => sharedNavbarSettings?.navOffsetY ?? storedNavbarSettings?.navOffsetY ?? 0);
  const [navScale, setNavScale] = useState<number>(() => sharedNavbarSettings?.navScale ?? storedNavbarSettings?.navScale ?? 1);
  const [navImageSettings, setNavImageSettings] = useState<Record<string, { enabled: boolean; offsetX: number; offsetY: number; scale: number }>>(() => {
    const sharedSettings = sharedNavbarSettings?.navImageSettings;
    const devSettings = storedNavbarSettings?.navImageSettings;
    if (sharedSettings) return { ...defaultNavImageSettings, ...sharedSettings };
    if (devSettings) return { ...defaultNavImageSettings, ...devSettings };
    return defaultNavImageSettings;
  });

  useEffect(() => {
    if (!isDev || !isAdminUser) return;
    const payload = {
      navOffsetX,
      navOffsetY,
      navScale,
      navImageSettings,
    };
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(payload));
    } catch {
      // ignore storage errors
    }
  }, [navOffsetX, navOffsetY, navScale, navImageSettings, isDev, isAdminUser]);

  useEffect(() => {
    document.documentElement.style.setProperty('--navbar-logo-offset', `${navOffsetX}px`);
    document.documentElement.style.setProperty('--navbar-logo-vertical-offset', `${navOffsetY}px`);
    document.documentElement.style.setProperty('--navbar-logo-scale', `${navScale}`);
  }, [navOffsetX, navOffsetY, navScale]);

  return (
    <>
      {/* Top Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-[900] overflow-visible relative"
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #D9D9D9',
          boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
        }}
      >
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between px-6 h-[76px] w-full mx-auto overflow-visible">
          <div className="flex items-center min-w-0">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center justify-center p-0 bg-transparent border-none cursor-pointer hover:opacity-80 transition-opacity min-h-[56px] overflow-visible"
            >
              <div className="flex items-center justify-center h-[56px] w-auto overflow-visible relative" style={{ transform: 'translateX(var(--navbar-logo-offset, 0px)) translateY(var(--navbar-logo-vertical-offset, 0px)) scale(var(--navbar-logo-scale, 1))' }}>
                <div className="relative inline-block">
                  <SergipanidadeLogo
                    variant="light"
                    iconSize={142}
                    showSlogan={false}
                  />

                  {/* Render additional dev images (multi-select) as absolute overlays so they don't get pushed */}
                  {navImageOptions.length > 0 && Object.entries(navImageSettings).map(([name, settings]) => {
                    if (!settings.enabled) return null;
                    const item = navImageOptions.find((a) => a.name === name);
                    if (!item) return null;
                    return (
                      <img
                        key={name}
                        src={item.src}
                        alt={name}
                        className="h-10 object-contain absolute pointer-events-none"
                        style={{
                          left: '100%',
                          top: '50%',
                          transform: `translate(-50%,-50%) translateX(${settings.offsetX}px) translateY(${settings.offsetY}px) scale(${settings.scale})`,
                          zIndex: 1100,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </button>
          </div>

          <div className="flex items-end flex-1 justify-between gap-2 h-full pb-1">
            <div className="flex items-center gap-3 ml-auto">
              {desktopNavItems.map((item) => {
                const isActive = currentScreen === item.screen;

                return (
                  <button
                    key={item.screen}
                    onClick={() => onNavigate(item.screen)}
                    className={`relative min-h-[60px] min-w-[120px] px-5 py-3 flex items-center justify-center border-none rounded-full transition-all duration-200 ease-out text-[18px] font-semibold bg-white ${
                      isActive
                        ? 'text-[#1A1A1A]'
                        : 'text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#0F1820]'
                    }`}
                  >
                    <span className="relative z-10">{item.label}</span>
                    <span
                      className={`absolute inset-x-4 bottom-3 h-1 rounded-full bg-black transition-all duration-300 ease-out ${
                        isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="relative z-[1100] self-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center justify-between min-h-[50px] px-4 py-3 bg-white border border-[#E5E7EB] rounded-full text-left transition-colors hover:bg-[#F8FAFC]"
                    type="button"
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={userProfile.name || t?.profile || 'Perfil'}
                        size={38}
                        bgColor="#0D7377"
                        textColor="#FFFFFF"
                      />
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="text-[14px] font-medium text-[#1A1A1A]">
                          {userProfile.name || t?.profile || 'Perfil'}
                        </span>
                        <span className="text-[12px] text-[#6B7280]">
                          {userProfile.userType === 'turista'
                            ? t?.touristLabel || 'Turista'
                            : userProfile.userType === 'administrador'
                            ? 'Administrador'
                            : t?.establishmentLabel || 'Estabelecimento'}
                        </span>
                      </div>
                    </div>
                    <ChevronDown size={14} />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent sideOffset={8} className="min-w-[180px] z-[1100]">
                  <DropdownMenuItem onSelect={() => onNavigate('perfil')}>
                    {t?.profile || 'Perfil'}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => onNavigate('login')}
                  >
                    {t?.logout || 'Sair'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div
          className="md:hidden flex items-center justify-between px-4 h-[56px] w-full overflow-visible"
        >
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center justify-start gap-2 p-0 bg-transparent border-none cursor-pointer min-h-[44px] overflow-visible"
          >
            <div className="relative inline-block" style={{ transform: 'translateX(var(--navbar-logo-offset, 0px)) translateY(var(--navbar-logo-vertical-offset, 0px)) scale(var(--navbar-logo-scale, 1))' }}>
              <SergipanidadeLogo
                variant="light"
                iconSize={110}
                showSlogan={false}
              />

              {navImageOptions.length > 0 && Object.entries(navImageSettings).map(([name, settings]) => {
                if (!settings.enabled) return null;
                const item = navImageOptions.find((a) => a.name === name);
                if (!item) return null;
                return (
                  <img
                    key={name}
                    src={item.src}
                    alt={name}
                    className="h-8 object-contain absolute pointer-events-none"
                    style={{
                      left: '100%',
                      top: '50%',
                      transform: `translate(-50%,-50%) translateX(${settings.offsetX}px) translateY(${settings.offsetY}px) scale(${settings.scale})`,
                      zIndex: 1100,
                    }}
                  />
                );
              })}
            </div>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center justify-between min-h-[44px] px-3 py-2 bg-white border border-[#E5E7EB] rounded-full transition-colors hover:bg-[#F8FAFC]"
                type="button"
              >
                <UserAvatar
                  name={userProfile.name || t?.profile || 'Perfil'}
                  size={32}
                  bgColor="#0D7377"
                  textColor="#FFFFFF"
                />
                <ChevronDown size={14} className="ml-2" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent sideOffset={8} className="min-w-[180px] z-[1100]">
              <DropdownMenuItem onSelect={() => onNavigate('perfil')}>
                {t?.profile || 'Perfil'}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => onNavigate('login')}
              >
                {t?.logout || 'Sair'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Dev controls (bottom-right) */}
      {isDev && isAdminUser && (
        <div className="fixed right-4 bottom-4 z-[1200] bg-white border rounded-lg p-3 shadow-lg w-[320px] text-sm">
          <div className="font-semibold mb-2">Navbar Dev Controls</div>
          <div className="mb-2">
            <label className="text-xs">X offset: <span className="font-medium">{navOffsetX}px</span></label>
            <input className="w-full" type="range" min={-1000} max={500} step={1} value={navOffsetX} onChange={(e) => setNavOffsetX(Number(e.target.value))} />
          </div>
          <div className="mb-2">
            <label className="text-xs">Y offset: <span className="font-medium">{navOffsetY}px</span></label>
            <input className="w-full" type="range" min={-500} max={500} step={1} value={navOffsetY} onChange={(e) => setNavOffsetY(Number(e.target.value))} />
          </div>
          <div className="mb-2">
            <label className="text-xs">Scale: <span className="font-medium">{navScale.toFixed(2)}×</span></label>
            <input className="w-full" type="range" min={0.5} max={3} step={0.05} value={navScale} onChange={(e) => setNavScale(Number(e.target.value))} />
          </div>

          <div className="mt-2">
            <div className="font-medium mb-1">Images</div>
            <div className="max-h-72 overflow-auto space-y-3">
              {navImageOptions.map((img) => {
                const settings = navImageSettings[img.name];
                return (
                  <div key={img.name} className="border rounded-xl p-3 bg-[#FAFAFA]">
                    <label className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        checked={settings?.enabled ?? false}
                        onChange={() => setNavImageSettings((prev) => {
                          const current = prev[img.name] ?? defaultNavImageSettings[img.name];
                          return {
                            ...prev,
                            [img.name]: {
                              ...current,
                              enabled: !current.enabled,
                            },
                          };
                        })}
                      />
                      <img src={img.src} alt={img.name} className="h-6 object-contain" />
                      <span className="truncate font-medium">{img.name}</span>
                    </label>
                    <div className="space-y-2">
                      <div className="text-xs text-[#555]">X offset: <span className="font-medium">{settings?.offsetX}px</span></div>
                      <input
                        type="range"
                        min={-1000}
                        max={500}
                        step={1}
                        value={settings?.offsetX ?? 0}
                        onChange={(e) => setNavImageSettings((prev) => {
                          const current = prev[img.name] ?? defaultNavImageSettings[img.name];
                          return {
                            ...prev,
                            [img.name]: {
                              ...current,
                              offsetX: Number(e.target.value),
                            },
                          };
                        })}
                        className="w-full"
                      />
                      <div className="text-xs text-[#555]">Y offset: <span className="font-medium">{settings?.offsetY}px</span></div>
                      <input
                        type="range"
                        min={-500}
                        max={500}
                        step={1}
                        value={settings?.offsetY ?? 0}
                        onChange={(e) => setNavImageSettings((prev) => {
                          const current = prev[img.name] ?? defaultNavImageSettings[img.name];
                          return {
                            ...prev,
                            [img.name]: {
                              ...current,
                              offsetY: Number(e.target.value),
                            },
                          };
                        })}
                        className="w-full"
                      />
                      <div className="text-xs text-[#555]">Scale: <span className="font-medium">{(settings?.scale ?? 1).toFixed(2)}×</span></div>
                      <input
                        type="range"
                        min={0.5}
                        max={3}
                        step={0.05}
                        value={settings?.scale ?? 1}
                        onChange={(e) => setNavImageSettings((prev) => {
                          const current = prev[img.name] ?? defaultNavImageSettings[img.name];
                          return {
                            ...prev,
                            [img.name]: {
                              ...current,
                              scale: Number(e.target.value),
                            },
                          };
                        })}
                        className="w-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Save shared settings button */}
          <button
            className="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            onClick={() => {
              const payload = {
                navOffsetX,
                navOffsetY,
                navScale,
                navImageSettings,
              };
              try {
                localStorage.setItem('sergipanidade_navbar_shared_settings', JSON.stringify(payload));
                // Optionally notify user
                // eslint-disable-next-line no-alert
                alert('Navbar settings saved as shared defaults.');
              } catch (e) {
                console.error('Failed to save shared navbar settings', e);
              }
            }}
          >
            Save as Default for All Users
          </button>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 border-t flex items-center justify-around px-2 z-[900]"
        style={{
          height: 'calc(64px + env(safe-area-inset-bottom))',
          paddingBottom: 'env(safe-area-inset-bottom)',
          backgroundColor: '#FFFFFF',
          borderColor: '#D9D9D9',
          boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
        }}
      >
        {bottomNavItems.map((item) => {
          const isActive = currentScreen === item.screen;
          const Icon = item.icon;

          return (
            <button
              key={item.screen}
              onClick={() => onNavigate(item.screen)}
              className="flex flex-col items-center justify-center flex-1 h-full gap-1 bg-transparent border-none cursor-pointer min-h-[44px]"
              aria-label={item.label}
            >
              <Icon
                size={22}
                color={isActive ? '#0D7377' : '#8A8A8A'}
                strokeWidth={isActive ? 2.5 : 1.8}
              />

              <span
                className="text-[10px] font-medium tracking-wide"
                style={{
                  color: isActive ? '#0D7377' : '#8A8A8A',
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
