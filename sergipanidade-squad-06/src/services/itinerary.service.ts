/**
 * Itinerary Service
 * Core business logic for generating itineraries based on user preferences
 */
 
import { destinations } from "@/constants/destinations";
import { getMatchedCategories } from "@/constants/interests";
import { getPeriodLabels } from "@/constants/periods";
import { ParadaGerada } from "@/types";
 
/**
 * Local itinerary generator (no API/AI calls)
 * Creates a basic itinerary based on user preferences and interests
 *
 * Algorithm:
 * 1. Determine number of stops based on trip duration
 * 2. Match user interests to destination categories (via getMatchedCategories)
 * 3. Score destinations (higher score if matches interests)
 * 4. Sort by score and select top candidates
 * 5. Distribute across days and periods
 * 6. Extract tips as travel suggestions
 */
export function gerarRoteiroLocal(
  data: {
    who: string;
    days: number;
    startDate: string;
    interests: string[];
    budget: string;
  },
  language: "pt" | "en" | "es",
): ParadaGerada[] {
  const numParadas = Math.min(data.days * 3, destinations.length);
 
  // Single source of truth: getMatchedCategories handles normalization
  // and keyword matching.
  const matchedCategories = getMatchedCategories(data.interests);
 
  // Score destinations: 2 points if matches interests, 1 otherwise
  const scored = destinations.map((d) => ({
    destination: d,
    score:
      matchedCategories.size > 0 &&
      [...matchedCategories].some((cat) =>
        d.category.toUpperCase().includes(cat),
      )
        ? 2
        : 1,
  }));
 
  // Sort by score descending, keeping original order for ties
  scored.sort((a, b) => b.score - a.score);
 
  const selected = scored.slice(0, numParadas).map((s) => s.destination);
 
  const periodos = getPeriodLabels(language);
 
  return selected.map((d, i) => {
    const dia = Math.floor(i / 3) + 1;
    const periodo = periodos[i % 3];
 
    const rawTip =
      language === "en"
        ? d.tip_en || d.tip
        : language === "es"
          ? d.tip_es || d.tip
          : d.tip;
 
    const dica = (rawTip.split(/(?<=[.!?])\s/)[0] || rawTip).trim();
 
    return { destinationId: d.id, dia, periodo, dica };
  });
}