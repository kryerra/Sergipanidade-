/**
 * AppRoutes — Route definitions and navigation
 * Extracted from App.tsx to separate concerns
 */
import React, { Suspense } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router';
import { useAppContext } from "@/context/AppContext";
import { translations } from "@/constants/translations";
import { getDestinationById } from "@/constants/destinations";

// Lazy loaded screens
const LoginScreen = React.lazy(() => import("@/features/auth/LoginScreen").then(m => ({ default: m.LoginScreen })));
const HomeScreen = React.lazy(() => import("@/features/home/HomeScreen").then(m => ({ default: m.HomeScreen })));
const GuiaScreen = React.lazy(() => import("@/features/guia/GuiaScreen").then(m => ({ default: m.GuiaScreen })));
const DetalheScreen = React.lazy(() => import("@/features/detalhe/DetalheScreen").then(m => ({ default: m.DetalheScreen })));

const RoteiroScreen = React.lazy(() => import("@/features/roteiro/RoteiroScreen").then(m => ({ default: m.RoteiroScreen })));
const ParceiroScreen = React.lazy(() => import("@/features/parceiro/ParceiroScreen").then(m => ({ default: m.ParceiroScreen })));
const PerfilScreen = React.lazy(() => import("@/features/perfil/PerfilScreen").then(m => ({ default: m.PerfilScreen })));
const CulturaScreen = React.lazy(() => import("@/features/cultura/CulturaScreen").then(m => ({ default: m.CulturaScreen })));

export interface AppRoutesProps {
  onNavigate: (screen: string, destinationId?: string) => void;
  onChangeLanguage: (lang: 'pt' | 'en' | 'es' | 'sp') => void;
  currentScreen: string;
  language: 'pt' | 'en' | 'es' | 'sp';
}

export function AppRoutes({ onNavigate, onChangeLanguage, language }: AppRoutesProps) {
  const {
    userProfile,
    setUserProfile,
    roteiro,
    setRoteiro,
    addToRoteiro,
    removeFromRoteiro,
    reviews,
    addReview,
    gpsDestinationId,
    openGPS,
  } = useAppContext();

  const navigate = useNavigate();
  const { id: destinationId } = useParams<{ id: string }>();

  // Map Sergipanês (sp) to Portuguese (pt) for subcomponents that only accept pt | en | es
  const cleanLanguage = language === 'sp' ? 'pt' : language;

  // Wrapper components for routes that need params or complex props
  const DetalheWrapper = () => {
    const { id } = useParams<{ id: string }>();
    return (
      <DetalheScreen
        destinationId={id}
        onNavigate={onNavigate}
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

  // Simple loading state matching the app background
  const LoadingFallback = () => <div className="min-h-screen" style={{ backgroundColor: 'var(--branco)' }}></div>;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={
          <LoginScreen 
            onNavigate={onNavigate} 
            language={cleanLanguage} 
            onChangeLanguage={onChangeLanguage}
            onLogin={setUserProfile}
          />
        } />
        
        <Route path="/home" element={
          <HomeScreen
            onNavigate={onNavigate}
            language={cleanLanguage}
            onChangeLanguage={onChangeLanguage}
            userProfile={userProfile}
          />
        } />

        <Route path="/guia" element={
          <GuiaScreen onNavigate={onNavigate} onOpenGPS={openGPS} language={cleanLanguage} />
        } />

        <Route path="/detalhe/:id" element={<DetalheWrapper />} />

        <Route path="/roteiro" element={
          <RoteiroScreen
            onNavigate={onNavigate}
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
