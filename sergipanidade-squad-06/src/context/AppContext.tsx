import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserProfile, RoteiroItem, Review } from '../App';

interface AppContextType {
  language: 'pt' | 'en' | 'es';
  setLanguage: (lang: 'pt' | 'en' | 'es') => void;
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  roteiro: RoteiroItem[];
  setRoteiro: React.Dispatch<React.SetStateAction<RoteiroItem[]>>;
  addToRoteiro: (destinationId: string, note?: string) => void;
  removeFromRoteiro: (destinationId: string) => void;
  reviews: Review[];
  addReview: (destinationId: string, rating: number, comment: string, userName: string) => void;
  toastMessage: string;
  showToast: boolean;
  handleToast: (message: string) => void;
  hideToast: () => void;
  gpsDestinationId?: string;
  showGPSModal: boolean;
  openGPS: (destinationId?: string) => void;
  closeGPS: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<'pt' | 'en' | 'es'>('pt');
  const [roteiro, setRoteiro] = useState<RoteiroItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  
  const [showGPSModal, setShowGPSModal] = useState(false);
  const [gpsDestinationId, setGpsDestinationId] = useState<string | undefined>();

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Marina Andrade',
    email: 'marina.andrade@email.com',
    userType: 'turista',
    phone: '(79) 98765-4321',
    notifications: {
      nearby: true,
      promotions: true,
      reminders: false,
      events: false,
    },
  });

  const handleToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const hideToast = () => setShowToast(false);

  const openGPS = (destinationId?: string) => {
    setGpsDestinationId(destinationId);
    setShowGPSModal(true);
  };

  const closeGPS = () => setShowGPSModal(false);

  const addToRoteiro = (destinationId: string, note?: string) => {
    if (roteiro.find(item => item.destinationId === destinationId)) {
      handleToast("Já está no seu roteiro!"); // ideal use translations based on language
      return;
    }
    setRoteiro(prev => [...prev, { destinationId, note }]);
    handleToast("Adicionado ao roteiro!");
  };

  const removeFromRoteiro = (destinationId: string) => {
    setRoteiro(roteiro.filter(item => item.destinationId !== destinationId));
    handleToast("Removido do roteiro!");
  };

  const addReview = (destinationId: string, rating: number, comment: string, userName: string) => {
    const newReview: Review = {
      id: Date.now().toString(),
      destinationId,
      userName,
      rating,
      comment,
      date: new Date().toISOString(),
    };
    setReviews(prev => [...prev, newReview]);
  };

  return (
    <AppContext.Provider
      value={{
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
