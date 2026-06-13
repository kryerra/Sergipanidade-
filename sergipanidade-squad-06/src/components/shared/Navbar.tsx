import { UserAvatar } from './UserAvatar';
import { translations } from '../../constants/translations';
import logoNav from '@/assets/images/logo-nav.png';

// Configuração do logo da Navbar (logo-nav.png)
const DESKTOP_LOGO_STYLE = {
  height: '48px',  // Altura do logo limitada a 48px
  objectFit: 'contain' as const,
};

const MOBILE_LOGO_STYLE = {
  height: '32px',  // Altura do logo no mobile
  objectFit: 'contain' as const,
};
import {
  Home,
  Map as MapIcon,
  Route,
  Landmark,
  Award,
  Music,
  ChevronDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useAppContext } from '../../context/AppContext';

type NavItem = {
  label: string;
  screen: string;
  icon?: typeof Home;
  href?: string;
};

interface NavbarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  isVisible: boolean;
  language: 'pt' | 'en' | 'es' | 'sp';
}

export function Navbar({
  currentScreen,
  onNavigate,
  isVisible,
  language,
}: NavbarProps) {
  if (!isVisible) return null;

  const desktopLogoStyle = DESKTOP_LOGO_STYLE;
  const mobileLogoStyle = MOBILE_LOGO_STYLE;

  const t = translations[language] as typeof translations.pt;
  const { userProfile } = useAppContext();

  const bottomNavItems: NavItem[] = [
    { label: 'Home', screen: 'home', icon: Home },
    { label: t?.destinations || 'Destinos', screen: 'guia', icon: MapIcon },
    { label: t?.culture || 'Cultura', screen: 'cultura', icon: Landmark },
  ];

  if (userProfile.userType === 'turista') {
    bottomNavItems.push({
      label: 'Playlist',
      screen: 'playlist',
      icon: Music,
      href: 'https://open.spotify.com/playlist/5WHu1dFKmpDCC90eD1Dkf6?si=mDnYttIqQPGmEBpCPhO6Kg&pi=FzmppWApTg23l',
    });
  }

  if (userProfile.userType === 'estabelecimento') {
    bottomNavItems.push({ label: t?.partner || 'Parceiro', screen: 'parceiro', icon: Award });
  }

  bottomNavItems.push({ label: t?.itinerary || 'Roteiro', screen: 'roteiro', icon: Route });

  const desktopNavItems: NavItem[] = [
    { label: 'Home', screen: 'home' },
    { label: t?.destinations || 'Destinos', screen: 'guia' },
    { label: t?.culture || 'Cultura', screen: 'cultura' },
  ];

  if (userProfile.userType === 'turista') {
    desktopNavItems.push({
      label: 'Playlist',
      screen: 'playlist',
      href: 'https://open.spotify.com/playlist/5WHu1dFKmpDCC90eD1Dkf6?si=mDnYttIqQPGmEBpCPhO6Kg&pi=FzmppWApTg23l',
    });
  }

  desktopNavItems.push({ label: t?.itinerary || 'Roteiro', screen: 'roteiro' });

  if (userProfile.userType === 'estabelecimento') {
    desktopNavItems.push({ label: t?.partner || 'Parceiro', screen: 'parceiro' });
  }

  return (
    <>
      {/* Top Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-[900] overflow-visible"
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #D9D9D9',
          boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
        }}
      >
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between px-6 h-[72px] w-full mx-auto overflow-visible">
          <div className="flex items-center min-w-0">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center justify-center p-0 bg-transparent border-none cursor-pointer hover:opacity-80 transition-opacity min-h-[48px] overflow-visible"
            >
              <div className="flex items-center justify-center h-[48px] w-auto overflow-visible">
                <img
                  src={logoNav}
                  alt="Logo Navbar"
                  style={desktopLogoStyle}
                />
              </div>
            </button>
          </div>

          <div className="flex items-end flex-1 justify-between gap-2 h-full pb-1">
            <div className="flex items-center gap-3 ml-auto">
              {desktopNavItems.map((item) => {
                const isActive = currentScreen === item.screen;
                const buttonClass = `relative min-h-[60px] min-w-[120px] px-5 py-3 flex items-center justify-center border-none rounded-full transition-all duration-200 ease-out text-[18px] font-semibold bg-white no-underline ${
                  isActive
                    ? 'text-[#1A1A1A]'
                    : 'text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#0F1820]'
                }`;
                const innerContent = (
                  <>
                    <span className="relative z-10">{item.label}</span>
                    <span
                      className={`absolute inset-x-4 bottom-3 h-1 rounded-full bg-black transition-all duration-300 ease-out ${
                        isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                      }`}
                    />
                  </>
                );

                if (item.href) {
                  return (
                    <a
                      key={item.screen}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonClass}
                    >
                      {innerContent}
                    </a>
                  );
                }

                return (
                  <button
                    key={item.screen}
                    onClick={() => onNavigate(item.screen)}
                    className={buttonClass}
                  >
                    {innerContent}
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
                        photoUrl={userProfile.photo}
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
            <img
              src={logoNav}
              alt="Logo Navbar"
              style={mobileLogoStyle}
            />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center justify-between min-h-[44px] px-3 py-2 bg-white border border-[#E5E7EB] rounded-full transition-colors hover:bg-[#F8FAFC]"
                type="button"
              >
                <UserAvatar
                  name={userProfile.name || t?.profile || 'Perfil'}
                    photoUrl={userProfile.photo}
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
          const Icon = item.icon as typeof Home;

          if (item.href) {
            return (
              <a
                key={item.screen}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center flex-1 h-full gap-1 bg-transparent border-none cursor-pointer min-h-[44px] no-underline"
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
              </a>
            );
          }

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
