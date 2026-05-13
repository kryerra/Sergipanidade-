/**
 * Global Types — Sergipanidade
 * Centralized type definitions used across the application
 */

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
  userType: "turista" | "morador" | "estabelecimento";
  phone?: string;
  notifications?: {
    nearby: boolean;
    promotions: boolean;
    reminders: boolean;
    events: boolean;
  };
}

export interface ParadaGerada {
  destinationId: string;
  dia: number;
  periodo: string;
  dica: string;
}

export interface WizardData {
  who: string;
  days: number;
  startDate: string;
  interests: string[];
  budget: string;
}
