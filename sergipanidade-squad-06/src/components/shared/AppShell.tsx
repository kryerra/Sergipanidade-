import { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Navbar } from './Navbar';
import { ChatBot } from './ChatBot';
import { Toast } from './Toast';
import { GPSModal } from './GPSModal';
import { useAppContext } from '@/context/AppContext';
import { translations } from '@/constants/translations';
import { getDestinationById } from '@/constants/destinations';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const {
    language,
    setLanguage,
    toastMessage,
    showToast,
    handleToast,
    hideToast,
    gpsDestinationId,
    showGPSModal,
    closeGPS,
  } = useAppContext();

  const location = useLocation();
  const navigate = useNavigate();

  const onNavigate = (screen: string, destinationId?: string): void => {
    switch (screen) {
      case 'home':
        navigate('/home');
        break;
      case 'guia':
        navigate('/guia');
        break;
      case 'detalhe':
        if (destinationId) {
          navigate(`/detalhe/${destinationId}`);
        }
        break;
      case 'roteiro':
        navigate('/roteiro');
        break;
      case 'parceiro':
        navigate('/parceiro');
        break;
      case 'perfil':
        navigate('/perfil');
        break;
      case 'cultura':
        navigate('/cultura');
        break;
      case 'playlist':
        window.open('https://open.spotify.com/playlist/5WHu1dFKmpDCC90eD1Dkf6?si=mDnYttIqQPGmEBpCPhO6Kg&pi=FzmppWApTg23l', '_blank', 'noopener,noreferrer');
        break;
      case 'login':
      default:
        navigate('/');
        break;
    }
  };

  const handleChangeLanguage = (lang: 'pt' | 'en' | 'es' | 'sp') => {
    setLanguage(lang);
    handleToast(translations[lang].languageChanged);
  };

  const currentPath = location.pathname;
  let currentScreen = 'login';
  if (currentPath.includes('/home')) currentScreen = 'home';
  else if (currentPath.includes('/guia')) currentScreen = 'guia';
  else if (currentPath.includes('/detalhe')) currentScreen = 'detalhe';
  else if (currentPath.includes('/roteiro')) currentScreen = 'roteiro';
  else if (currentPath.includes('/parceiro')) currentScreen = 'parceiro';
  else if (currentPath.includes('/perfil')) currentScreen = 'perfil';
  else if (currentPath.includes('/cultura')) currentScreen = 'cultura';

  const isNavbarVisible = currentScreen !== 'login';
  const isChatBotVisible = currentScreen !== 'login';
  const gpsDestination = gpsDestinationId ? getDestinationById(gpsDestinationId) : undefined;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {isNavbarVisible ? (
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
          <Navbar
            currentScreen={currentScreen}
            onNavigate={onNavigate}
            isVisible={isNavbarVisible}
            language={language}
          />
        </header>
      ) : null}

      <main className={isNavbarVisible ? "pt-[var(--navbar-height)] min-h-[calc(100vh-var(--navbar-height))]" : "min-h-screen"}>
        {children}
      </main>

      <ChatBot isVisible={isChatBotVisible} language={language} />
      <Toast message={toastMessage} isVisible={showToast} onHide={hideToast} />
      <GPSModal
        isOpen={showGPSModal}
        onClose={closeGPS}
        onConfirm={() => handleToast(translations[language].openingGPS)}
        language={language}
        destinationName={gpsDestination?.name}
        lat={gpsDestination?.lat}
        lon={gpsDestination?.lon}
      />
    </div>
  );
}
