import { useLocation, useNavigate } from 'react-router';
import { Navbar } from "@/components/shared/Navbar";
import { ChatBot } from "@/components/shared/ChatBot";
import { Toast } from "@/components/shared/Toast";
import { GPSModal } from "@/components/shared/GPSModal";
import { translations } from "@/constants/translations";
import { getDestinationById } from "@/constants/destinations";
import { useAppContext } from "@/context/AppContext";
import { AppRoutes } from "@/routes/AppRoutes";

export default function App(): JSX.Element {
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

  const handleNavigate = (screen: string, destinationId?: string): void => {
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
        navigate('/playlist');
        break;
      case 'login':
      default:
        navigate('/');
        break;
    }
  };
  const handleGPSConfirm = (): void => {
    handleToast(translations[language].openingGPS);
  };

  const handleChangeLanguage = (lang: 'pt' | 'en' | 'es' | 'sp'): void => {
    setLanguage(lang);
    handleToast(translations[lang].languageChanged);
  };

  // Convert pathname to currentScreen format for Navbar
  const currentPath = location.pathname;
  let currentScreen = 'login';
  if (currentPath.includes('/home')) currentScreen = 'home';
  else if (currentPath.includes('/guia')) currentScreen = 'guia';
  else if (currentPath.includes('/detalhe')) currentScreen = 'detalhe';
  else if (currentPath.includes('/roteiro')) currentScreen = 'roteiro';
  else if (currentPath.includes('/parceiro')) currentScreen = 'parceiro';
  else if (currentPath.includes('/perfil')) currentScreen = 'perfil';
  else if (currentPath.includes('/cultura')) currentScreen = 'cultura';
  else if (currentPath.includes('/playlist')) currentScreen = 'playlist';

  const isNavbarVisible = currentScreen !== 'login';
  const isChatBotVisible = currentScreen !== 'login';

  const gpsDestination = gpsDestinationId ? getDestinationById(gpsDestinationId) : undefined;

  return (
    <div className="min-h-screen bg-(--branco) relative">
      <Navbar
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        isVisible={isNavbarVisible}
        language={language}
        onChangeLanguage={handleChangeLanguage}
      />

      <ChatBot isVisible={isChatBotVisible} language={language} />

      <AppRoutes 
        onNavigate={handleNavigate} 
        onToast={handleToast}
        onChangeLanguage={handleChangeLanguage}
        currentScreen={currentScreen}
        language={language}
      />

      <Toast
        message={toastMessage}
        isVisible={showToast}
        onHide={hideToast}
      />

      <GPSModal
        isOpen={showGPSModal}
        onClose={closeGPS}
        onConfirm={handleGPSConfirm}
        language={language}
        destinationName={gpsDestination?.name}
        lat={gpsDestination?.lat}
        lon={gpsDestination?.lon}
      />
    </div>
  );
}