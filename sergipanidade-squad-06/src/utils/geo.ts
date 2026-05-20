/**
 * Geolocation Utilities
 * Functions for geographical calculations and distance display
 */

import type { Destination } from "@/constants/destinations";

// --- Constantes ---
const EARTH_RADIUS_KM = 6371;
const DEFAULT_SPEED_KMH = 35;

/**
 * Converte graus para radianos
 */
const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

/**
 * Haversine formula to calculate the great-circle distance between two points
 * on Earth given their longitude and latitudes
 *
 * @param lat1 - Latitude of first point (degrees)
 * @param lon1 - Longitude of first point (degrees)
 * @param lat2 - Latitude of second point (degrees)
 * @param lon2 - Longitude of second point (degrees)
 * @returns Distance in kilometers
 */
export function haversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Helper para formatar o tempo de viagem
 */
function formatTravelTime(minutes: number): string {
  if (minutes < 1) return "< 1 min";
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;

  return remainingMins > 0 ? `${hours}h ${remainingMins}min` : `${hours}h`;
}

/**
 * Helper para formatar a distância
 */
function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)} km`;
}

/**
 * Generate a human-readable travel label between two destinations
 * Shows estimated travel time and distance
 *
 * @param d1 - Origin destination
 * @param d2 - Target destination
 * @param speedKmh - Optional average speed in km/h (defaults to 35)
 * @example
 * travelLabel(destination1, destination2) → "25 min · 15.3 km"
 */
export function travelLabel(
  d1: Destination, 
  d2: Destination, 
  speedKmh: number = DEFAULT_SPEED_KMH
): string {
  const km = haversine(d1.lat, d1.lon, d2.lat, d2.lon);
  const mins = Math.round((km / speedKmh) * 60);

  const timeStr = formatTravelTime(mins);
  const distanceStr = formatDistance(km);

  return `${timeStr} · ${distanceStr}`;
}