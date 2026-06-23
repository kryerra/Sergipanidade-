/**
 * Period Configuration
 * Time periods and durations for itinerary planning
 */

/**
 * Maps period names (morning, afternoon, evening) to start times
 * Used to display suggested visit times in the timeline
 */
export const PERIODO_TIME: Record<string, string> = {
  // Portuguese
  manhã: "09:00",
  tarde: "14:00", // Shared key: "tarde" is identical in both Portuguese and Spanish
  noite: "19:00",
  // English
  morning: "09:00",
  afternoon: "14:00",
  evening: "19:00",
  // Spanish
  mañana: "09:00",
  noche: "19:00",
};

/**
 * Estimated duration for each period at a destination
 * Used to calculate travel time and schedule gaps
 */
export const PERIODO_DUR: Record<string, string> = {
  // Portuguese
  manhã: "2h",
  tarde: "1h 30min", // Shared key: "tarde" is identical in both Portuguese and Spanish
  noite: "2h",
  // English
  morning: "2h",
  afternoon: "1h 30min",
  evening: "2h",
  // Spanish
  mañana: "2h",
  noche: "2h",
};

/**
 * Get period labels for a given language
 * Returns array of period names in the specified language
 */
import { Language } from '@/constants/translations';

export function getPeriodLabels(language: Language): string[] {
  const labels: Record<string, string[]> = {
    pt: ["manhã", "tarde", "noite"],
    en: ["morning", "afternoon", "evening"],
    es: ["mañana", "tarde", "noche"],
    sp: ["manhã", "tarde", "noite"],
  };
  return labels[language] || labels.pt;
}
