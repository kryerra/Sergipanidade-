/**
 * AppRoutes — Route definitions and navigation
 * Extracted from App.tsx to separate concerns
 */
import React, { Suspense } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router';
import { useAppContext } from "@/context/AppContext";

// Lazy loaded screens
const LoginScreen = React.lazy(() => import("@/features/auth/LoginScreen").then(m => ({ default: m.LoginScreen })));
const HomeScreen = React.lazy(() => import("@/features/home/HomeScreen").then(m => ({ default: m.HomeScreen })));
const GuiaScreen = React.lazy(() => import("@/features/guia/GuiaScreen").then(m => ({ default: m.GuiaScreen })));
const DetalheScreen = React.lazy(() => import("@/features/detalhe/DetalheScreen").then(m => ({ default: m.DetalheScreen })));

const RoteiroScreen = React.lazy(() => import("@/features/roteiro/RoteiroScreen").then(m => ({ default: m.RoteiroScreen })));
const ParceiroScreen = React.lazy(() => import("@/features/parceiro/ParceiroScreen").then(m => ({ default: m.ParceiroScreen })));
const PerfilScreen = React.lazy(() => import("@/features/perfil/PerfilScreen").then(m => ({ default: m.PerfilScreen })));
const CulturaScreen = React.lazy(() => import("@/features/cultura/CulturaScreen").then(m => ({ default: m.CulturaScreen })));

export function AppRoutes() {
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
    openGPS,
  } = useAppContext();

  const navigate = useNavigate();

  const cleanLanguage = language === 'sp' ? 'pt' : language;

  const handleChangeLanguage = (lang: 'pt' | 'en' | 'es' | 'sp') => {
    setLanguage(lang);
  };

  const handleNavigate = (screen: string, destinationId?: string) => {
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
        window.open(
          'https://open.spotify.com/playlist/5WHu1dFKmpDCC90eD1Dkf6?si=mDnYttIqQPGmEBpCPhO6Kg&pi=FzmppWApTg23l',
          '_blank',
          'noopener,noreferrer',
        );
        break;
      case 'login':
      default:
        navigate('/');
        break;
    }
  };

  const DetalheWrapper = () => {
    const { id } = useParams<{ id: string }>();
    return (
      <DetalheScreen
        destinationId={id}
        onNavigate={handleNavigate}
        onOpenGPS={openGPS}
        onAddToRoteiro={addToRoteiro}
        isInRoteiro={!!roteiro.find(item => item.destinationId === id)}
        language={cleanLanguage}
        reviews={reviews.filter(r => r.destinationId === id)}
        onAddReview={addReview}
        userProfile={userProfile}
      />
    );
  };

  const LoadingFallback = () => <div className="min-h-screen" style={{ backgroundColor: 'var(--branco)' }} />;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={
          <LoginScreen
            onNavigate={handleNavigate}
            language={cleanLanguage}
            onChangeLanguage={handleChangeLanguage}
            onLogin={setUserProfile}
          />
        } />
        
        <Route path="/home" element={
          <HomeScreen
            onNavigate={handleNavigate}
            language={cleanLanguage}
            onChangeLanguage={handleChangeLanguage}
            userProfile={userProfile}
          />
        } />

        <Route path="/guia" element={
          <GuiaScreen onNavigate={handleNavigate} onOpenGPS={openGPS} language={cleanLanguage} />
        } />

        <Route path="/detalhe/:id" element={<DetalheWrapper />} />

        <Route path="/roteiro" element={
          <RoteiroScreen
            onNavigate={handleNavigate}
            roteiro={roteiro}
            onAddToRoteiro={addToRoteiro}
            onRemoveFromRoteiro={removeFromRoteiro}
            onSetRoteiro={setRoteiro}
            onOpenGPS={openGPS}
            language={cleanLanguage}
          />
        } />

        <Route path="/parceiro" element={
          <ParceiroScreen language={cleanLanguage} />
        } />

        <Route path="/perfil" element={
          <PerfilScreen 
            language={cleanLanguage}
            userProfile={userProfile}
            onUpdateProfile={setUserProfile}
          />
        } />

        <Route path="/cultura" element={
          <CulturaScreen language={cleanLanguage} />
        } />
      </Routes>
    </Suspense>
  );
}
