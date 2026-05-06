import React, { Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router';
import { Navbar } from './components/Navbar';
import { ChatBot } from './components/ChatBot';
import { Toast } from './components/Toast';
import { GPSModal } from './components/GPSModal';
import { translations } from './data/translations';
import { getDestinationById } from './data/destinations';
import { useAppContext } from './context/AppContext';

// Lazy loaded screens
const LoginScreen = React.lazy(() => import('./screens/LoginScreen').then(m => ({ default: m.LoginScreen })));
const HomeScreen = React.lazy(() => import('./screens/HomeScreen').then(m => ({ default: m.HomeScreen })));
const GuiaScreen = React.lazy(() => import('./screens/GuiaScreen').then(m => ({ default: m.GuiaScreen })));
const DetalheScreen = React.lazy(() => import('./screens/DetalheScreen').then(m => ({ default: m.DetalheScreen })));
const RoteiroScreen = React.lazy(() => import('./screens/RoteiroScreen').then(m => ({ default: m.RoteiroScreen })));
const ParceiroScreen = React.lazy(() => import('./screens/ParceiroScreen').then(m => ({ default: m.ParceiroScreen })));
const PerfilScreen = React.lazy(() => import('./screens/PerfilScreen').then(m => ({ default: m.PerfilScreen })));
const SOSScreen = React.lazy(() => import('./screens/SOSScreen').then(m => ({ default: m.SOSScreen })));
const CulturaScreen = React.lazy(() => import('./screens/CulturaScreen').then(m => ({ default: m.CulturaScreen })));

// Types exported from App.tsx originally
export interface RoteiroItem {
  destinationId: string;
  time?: string;
  note?: string;
}

export interface Review {
  id: string;
  destinationId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface UserProfile {
  name: string;
  email: string;
  userType: 'turista' | 'morador' | 'estabelecimento';
  phone?: string;
  notifications?: {
    nearby: boolean;
    promotions: boolean;
    reminders: boolean;
    events: boolean;
  };
}

export default function App() {
  const {
    language,
    setLanguage,
    userProfile,
    setUserProfile,
    roteiro,
    setRoteiro,
    addToRoteiro,
    removeFromRoteiro,
    reviews,
    addReview,
    toastMessage,
    showToast,
    handleToast,
    hideToast,
    gpsDestinationId,
    showGPSModal,
    openGPS,
    closeGPS,
  } = useAppContext();

  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (screen: string, destinationId?: string) => {
    if (screen === 'detalhe' && destinationId) {
      navigate(`/detalhe/${destinationId}`);
    } else {
      navigate(`/${screen === 'login' ? '' : screen}`);
    }
    window.scrollTo(0, 0);
  };

  const handleGPSConfirm = () => {
    handleToast(translations[language].openingGPS);
  };

  const handleChangeLanguage = (lang: 'pt' | 'en' | 'es') => {
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
  else if (currentPath.includes('/sos')) currentScreen = 'sos';
  else if (currentPath.includes('/cultura')) currentScreen = 'cultura';

  const isNavbarVisible = currentScreen !== 'login';
  const isChatBotVisible = currentScreen !== 'login';

  const gpsDestination = gpsDestinationId ? getDestinationById(gpsDestinationId) : undefined;

  // Wrapper components for routes that need params or complex props
  const DetalheWrapper = () => {
    const { id } = useParams<{ id: string }>();
    return (
      <DetalheScreen
        destinationId={id}
        onNavigate={handleNavigate}
        onToast={handleToast}
        onOpenGPS={openGPS}
        onAddToRoteiro={addToRoteiro}
        isInRoteiro={!!roteiro.find(item => item.destinationId === id)}
        language={language}
        reviews={reviews.filter(r => r.destinationId === id)}
        onAddReview={addReview}
        userProfile={userProfile}
      />
    );
  };

  // Simple loading state matching the app background
  const LoadingFallback = () => <div className="min-h-screen" style={{ backgroundColor: 'var(--branco)' }}></div>;

  return (
    <div className="min-h-screen bg-[var(--branco)] relative">
      <Navbar
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        isVisible={isNavbarVisible}
        language={language}
        onChangeLanguage={handleChangeLanguage}
      />

      <ChatBot isVisible={isChatBotVisible} language={language} />

      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={
            <LoginScreen 
              onNavigate={handleNavigate} 
              onToast={handleToast} 
              language={language} 
              onChangeLanguage={handleChangeLanguage}
              onLogin={setUserProfile}
            />
          } />
          
          <Route path="/home" element={
            <HomeScreen
              onNavigate={handleNavigate}
              onToast={handleToast}
              language={language}
              onChangeLanguage={handleChangeLanguage}
              userProfile={userProfile}
            />
          } />

          <Route path="/guia" element={
            <GuiaScreen onNavigate={handleNavigate} onToast={handleToast} onOpenGPS={openGPS} language={language} />
          } />

          <Route path="/detalhe/:id" element={<DetalheWrapper />} />

          <Route path="/roteiro" element={
            <RoteiroScreen
              onNavigate={handleNavigate}
              onToast={handleToast}
              roteiro={roteiro}
              onAddToRoteiro={addToRoteiro}
              onRemoveFromRoteiro={removeFromRoteiro}
              onSetRoteiro={setRoteiro}
              onOpenGPS={openGPS}
              language={language}
            />
          } />

          <Route path="/parceiro" element={
            <ParceiroScreen onToast={handleToast} language={language} />
          } />

          <Route path="/perfil" element={
            <PerfilScreen 
              onToast={handleToast} 
              language={language}
              userProfile={userProfile}
              onUpdateProfile={setUserProfile}
            />
          } />

          <Route path="/sos" element={
            <SOSScreen onToast={handleToast} language={language} />
          } />

          <Route path="/cultura" element={
            <CulturaScreen onToast={handleToast} language={language} />
          } />
        </Routes>
      </Suspense>

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