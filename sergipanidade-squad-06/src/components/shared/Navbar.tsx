import { useState } from 'react';
import { SergipanidadeLogo } from './SergipanidadeLogo';
import { translations } from '../../constants/translations';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import {
  Menu,
  Home,
  Map as MapIcon,
  Route,
  User,
  LogOut,
  Search,
  ChevronDown,
  MapPin,
  Landmark,
} from 'lucide-react';
import { PrimaryButton } from '../ui/PrimaryButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

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
  const [selectedCity, setSelectedCity] = useState('Aracaju');

  const cities = [
    'Aracaju',
    'São Cristóvão',
    'Laranjeiras',
    'Canindé',
    'Lagarto',
    'Itabaiana',
  ];

  const cityOptions = cities.filter((city) => city !== selectedCity);

  if (!isVisible) return null;

  const t = translations[language] as typeof translations.pt;

  const bottomNavItems = [
    { label: 'Home', screen: 'home', icon: Home },
    { label: t?.destinations || 'Destinos', screen: 'guia', icon: MapIcon },
    { label: 'Cultura', screen: 'cultura', icon: Landmark },
    { label: t?.itinerary || 'Roteiro', screen: 'roteiro', icon: Route },
    { label: t?.profile || 'Perfil', screen: 'perfil', icon: User },
  ];

  const desktopNavItems = [
    { label: 'Home', screen: 'home' },
    { label: t?.destinations || 'Destinos', screen: 'guia' },
    { label: 'Cultura', screen: 'cultura' },
    { label: t?.itinerary || 'Roteiro', screen: 'roteiro' },
    { label: t?.partner || 'Parceiro', screen: 'parceiro' },
    { label: 'SOS', screen: 'sos', isSos: true },
    { label: t?.profile || 'Perfil', screen: 'perfil' },
  ];

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
        <div className="hidden md:flex items-center justify-between px-8 h-[76px] w-full mx-auto overflow-visible">
          {/* Left: Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center justify-center p-0 bg-transparent border-none cursor-pointer hover:opacity-80 transition-opacity min-h-[56px] overflow-visible"
          >
            <div className="flex items-center justify-center h-[56px] w-[150px] overflow-visible">
              <SergipanidadeLogo
                variant="light"
                iconSize={30}
                showSlogan={false}
              />
            </div>
          </button>

          {/* Center: Breadcrumb */}
          <div
            className="flex items-center gap-1.5 text-[13px]"
            style={{ color: '#8A8A8A' }}
          >
            <span className="cursor-pointer hover:text-[#1A1A1A] transition-colors">
              Brasil
            </span>

            <span style={{ color: '#D9D9D9' }}>›</span>

            <span className="cursor-pointer hover:text-[#1A1A1A] transition-colors">
              Sergipe (SE)
            </span>

            <span style={{ color: '#D9D9D9' }}>›</span>

            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex items-center gap-1 font-medium outline-none cursor-pointer bg-transparent border-none transition-colors min-h-[44px]"
                style={{ color: '#1A1A1A' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#0D7377';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#1A1A1A';
                }}
              >
                {selectedCity}
                <ChevronDown size={14} className="opacity-60" />
              </DropdownMenuTrigger>

              <DropdownMenuContent>
                {cityOptions.map((city) => (
                  <DropdownMenuItem
                    key={city}
                    onSelect={() => setSelectedCity(city)}
                    className="cursor-pointer"
                  >
                    {city}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <button
              className="p-2 bg-transparent border-none cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors rounded-lg hover:bg-[#EEEDE9]"
              style={{ color: '#8A8A8A' }}
            >
              <Search size={18} />
            </button>

            <div className="flex items-center gap-1 text-[13px] font-medium ml-1">
              {desktopNavItems.map((item) => {
                const isActive = currentScreen === item.screen;

                if (item.isSos) {
                  return (
                    <button
                      key={item.screen}
                      onClick={() => onNavigate(item.screen)}
                      className="relative min-h-[44px] px-3 ml-1 flex items-center justify-center rounded-lg bg-transparent cursor-pointer transition-colors text-[13px]"
                      style={{
                        color: '#0D7377',
                        border: '1px solid rgba(224,92,0,0.35)',
                        backgroundColor: isActive
                          ? 'rgba(224,92,0,0.06)'
                          : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          'rgba(224,92,0,0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isActive
                          ? 'rgba(224,92,0,0.06)'
                          : 'transparent';
                      }}
                    >
                      {item.label}
                    </button>
                  );
                }

                return (
                  <button
                    key={item.screen}
                    onClick={() => onNavigate(item.screen)}
                    className="relative min-h-[44px] px-3 flex items-center justify-center border-none bg-transparent cursor-pointer group rounded-lg transition-colors"
                    style={{
                      color: isActive ? '#1A1A1A' : '#8A8A8A',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.color = '#1A1A1A';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.color = '#8A8A8A';
                    }}
                  >
                    {item.label}

                    <span
                      className="absolute bottom-[8px] left-3 right-3 h-[2px] rounded-full transition-transform origin-left"
                      style={{
                        backgroundColor: '#0D7377',
                        transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                      }}
                    />
                  </button>
                );
              })}

              <div className="ml-2">
                <PrimaryButton
                  size="sm"
                  onClick={() => onNavigate('login')}
                  style={{ minWidth: '80px' }}
                >
                  {t?.logout || 'Sair'}
                </PrimaryButton>
              </div>
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

          {/* Center: Location */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center justify-center gap-1.5 text-[15px] font-medium outline-none cursor-pointer bg-transparent border-none min-h-[44px] px-2"
              style={{ color: '#1A1A1A' }}
            >
              <MapPin size={16} color="#0D7377" />
              {selectedCity}
              <ChevronDown size={14} style={{ color: '#8A8A8A' }} />
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              {cityOptions.map((city) => (
                <DropdownMenuItem
                  key={city}
                  onSelect={() => setSelectedCity(city)}
                  className="cursor-pointer"
                >
                  {city}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

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
                  </div>

                  <div className="p-4 border-t border-white/8">
                    <button
                      onClick={() => {
                        onNavigate('login');
                        setMobileOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 text-white px-4 py-3 rounded-[10px] font-medium text-[15px] cursor-pointer border-none min-h-[48px] transition-colors hover:opacity-90"
                      style={{ backgroundColor: '#0D7377' }}
                    >
                      <LogOut size={18} />
                      {t?.logout || 'Sair'}
                    </button>
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