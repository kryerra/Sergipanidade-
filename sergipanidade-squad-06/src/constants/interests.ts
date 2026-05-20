/**
 * Interest Category Mapping
 * Maps user interest keywords to destination categories
 * SINGLE SOURCE OF TRUTH for interest matching
 */

export interface InterestMapping {
  keywords: string[];
  category: string;
}

/**
 * Central mapping of interest keywords to destination categories
 * Used by both AI-assisted and manual itinerary generation
 *
 * IMPORTANT: This is the single source of truth for interest mapping.
 * Any changes here will affect itinerary generation across the app.
 */
export const INTEREST_CATEGORY_MAP: InterestMapping[] = [
  {
    keywords: ["praia", "beach", "playa", "praias", "beaches", "playas"],
    category: "PRAIA",
  },
  {
    keywords: [
      "gastronom",
      "food",
      "comida",
      "culinaria",
      "culinária",
      "restaurant",
    ],
    category: "GASTRONOMIA",
  },
  {
    keywords: ["cultur", "arte", "art", "musica", "music", "música", "show"],
    category: "CULTURA",
  },
  {
    keywords: ["histor", "history", "historia", "patrimoni", "heritage"],
    category: "HISTÓRIA",
  },
  {
    keywords: [
      "nature",
      "naturez",
      "natural",
      "eco",
      "foto",
      "photo",
      "parque",
    ],
    category: "NATUREZA",
  },
  {
    keywords: ["pet", "animal", "bicho", "dog", "cat"],
    category: "PET FRIENDLY",
  },
];

/**
 * Match user interests against the category map
 * Returns a set of matched categories
 */
export function getMatchedCategories(interests: string[]): Set<string> {
  const matched = new Set<string>();

  interests.forEach((interest) => {
    const normalized = interest
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    INTEREST_CATEGORY_MAP.forEach(({ keywords, category }) => {
      if (keywords.some((kw) => normalized.includes(kw))) {
        matched.add(category);
      }
    });
  });

  return matched;
}
