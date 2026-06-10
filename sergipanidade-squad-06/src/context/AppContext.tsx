import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserProfile, RoteiroItem, Review } from '@/types'; // Fix 6: fonte única de tipos
import { translations } from '@/constants/translations';

interface AppContextType {
  language: 'pt' | 'en' | 'es' | 'sp';
  setLanguage: (lang: 'pt' | 'en' | 'es' | 'sp') => void;
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

const PROFILE_STORAGE_KEY = 'sergipanidade_currentProfile';

const getInitialUserProfile = (): UserProfile => {
  if (typeof window === 'undefined') {
    return {
      name: 'Marina Andrade',
      email: 'marina.andrade@email.com',
      userType: 'turista',
      photo: '',
      phone: '(79) 98765-4321',
      notifications: {
        nearby: true,
        promotions: true,
        reminders: false,
        events: false,
      },
    };
  }

  try {
    const stored = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as UserProfile;
    }
  } catch (error) {
    console.error('Failed to load user profile from localStorage:', error);
  }

  return {
    name: 'Marina Andrade',
    email: 'marina.andrade@email.com',
    userType: 'turista',
    photo: '',
    phone: '(79) 98765-4321',
    notifications: {
      nearby: true,
      promotions: true,
      reminders: false,
      events: false,
    },
  };
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<'pt' | 'en' | 'es' | 'sp'>('pt');
  const [roteiro, setRoteiro] = useState<RoteiroItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const [showGPSModal, setShowGPSModal] = useState(false);
  const [gpsDestinationId, setGpsDestinationId] = useState<string | undefined>();

  const [userProfile, setUserProfile] = useState<UserProfile>(getInitialUserProfile);

  const handleToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const hideToast = () => setShowToast(false);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(userProfile));
    } catch (error) {
      console.error('Failed to save user profile to localStorage:', error);
    }
  }, [userProfile]);

  const openGPS = (destinationId?: string) => {
    setGpsDestinationId(destinationId);
    setShowGPSModal(true);
  };

  const closeGPS = () => setShowGPSModal(false);

  const addToRoteiro = (destinationId: string, note?: string) => {
    // Fix 3: usa translations[language] — nunca mais hardcoded em PT
    const t = translations[language];

    if (roteiro.find(item => item.destinationId === destinationId)) {
      handleToast(t.alreadyInItineraryToast);
      return;
    }
    setRoteiro(prev => [...prev, { destinationId, note }]);
    handleToast(t.addedToItinerary);
  };

  const removeFromRoteiro = (destinationId: string) => {
    const t = translations[language];
    setRoteiro(roteiro.filter(item => item.destinationId !== destinationId));
    handleToast(t.removedFromItinerary);
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