import { useState } from 'react';
import { SergipanidadeLogo } from './SergipanidadeLogo';
import { UserAvatar } from './UserAvatar';
import { translations } from '../../constants/translations';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import {
  Menu,
  Home,
  Map as MapIcon,
  Route,
  User,
  Landmark,
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
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isVisible) return null;

  const t = translations[language] as typeof translations.pt;
  const { userProfile } = useAppContext();

  const bottomNavItems = [
    { label: 'Home', screen: 'home', icon: Home },
    { label: t?.destinations || 'Destinos', screen: 'guia', icon: MapIcon },
    { label: 'Cultura', screen: 'cultura', icon: Landmark },
    { label: t?.itinerary || 'Roteiro', screen: 'roteiro', icon: Route },
  ];

  const desktopNavItems = [
    { label: 'Home', screen: 'home' },
    { label: t?.destinations || 'Destinos', screen: 'guia' },
    { label: 'Cultura', screen: 'cultura' },
    { label: t?.itinerary || 'Roteiro', screen: 'roteiro' },
  ];

  if (userProfile.userType === 'estabelecimento') {
    desktopNavItems.push({ label: t?.partner || 'Parceiro', screen: 'parceiro' });
  }

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
              <div className="flex items-center justify-center h-[56px] w-auto overflow-visible">
                <SergipanidadeLogo
                  variant="light"
                  iconSize={30}
                  showSlogan={false}
                />
              </div>
            </button>
          </div>

          <div className="flex items-end flex-1 justify-between gap-2 h-full pb-1">
            <div className="flex items-center flex-1 gap-3">
              {desktopNavItems.map((item) => {
                const isActive = currentScreen === item.screen;

                return (
                  <button
                    key={item.screen}
                    onClick={() => onNavigate(item.screen)}
                    className={`relative flex-1 min-h-[60px] min-w-[120px] px-5 py-3 flex items-center justify-center border-none rounded-full transition-all duration-200 ease-out text-[18px] font-semibold bg-white ${
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

            <div className="relative z-[1100] ml-auto self-end">
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
                            : userProfile.userType === 'morador'
                            ? t?.residentLabel || 'Morador'
                            : userProfile.userType === 'estabelecimento'
                            ? t?.establishmentLabel || 'Estabelecimento'
                            : userProfile.userType}
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
          className="md:hidden flex items-center justify-between px-4 h-[64px] w-full overflow-visible"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          {/* Left: Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center justify-center p-0 bg-transparent border-none cursor-pointer min-w-[46px] min-h-[46px] overflow-visible"
          >
            <div className="flex items-center justify-center h-[46px] w-[46px] overflow-visible">
              <SergipanidadeLogo
                variant="light"
                iconSize={24}
                iconOnly={true}
              />
            </div>
          </button>

          {/* Right: Hamburger */}
          <div className="flex items-center">

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  className="p-2 bg-transparent border-none cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
                  style={{ color: '#1A1A1A' }}
                >
                  <Menu size={24} />
                </button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="border-l-[rgba(255,255,255,0.05)] p-0 text-white w-[280px]"
                style={{ backgroundColor: '#111111' }}
              >
                <div className="flex flex-col h-full">
                  <div className="px-6 pt-12 pb-6 border-b border-white/8">
                    <SergipanidadeLogo
                      variant="dark"
                      iconSize={32}
                      showSlogan={true}
                    />
                  </div>

                  <div className="flex flex-col p-4 gap-1 flex-1 overflow-y-auto">
                    <p className="text-white/35 text-[11px] uppercase font-bold tracking-widest mb-2 px-4">
                      Menu
                    </p>

                    {desktopNavItems.map((item) => (
                      <button
                        key={item.screen}
                        onClick={() => {
                          onNavigate(item.screen);
                          setMobileOpen(false);
                        }}
                        className={`w-full flex items-center px-4 py-3 rounded-lg bg-transparent border-none cursor-pointer text-left min-h-[44px] text-[15px] transition-colors ${
                          currentScreen === item.screen
                            ? 'bg-[rgba(224,92,0,0.12)] text-[#0D7377] font-medium'
                            : 'text-white/65 hover:bg-white/5 hover:text-white/90'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}

                    <div className="border-t border-white/10 mt-4 pt-4">
                      <button
                        onClick={() => {
                          onNavigate('perfil');
                          setMobileOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 rounded-lg bg-transparent border-none cursor-pointer text-[15px] text-white/80 hover:bg-white/5"
                      >
                        {t?.profile || 'Perfil'}
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('login');
                          setMobileOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 rounded-lg bg-transparent border-none cursor-pointer text-[15px] text-[#f87171] hover:bg-white/5"
                      >
                        {t?.logout || 'Sair'}
                      </button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
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