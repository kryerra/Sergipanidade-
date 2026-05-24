/**
 * String Utilities
 * Common string processing functions used across the application
 */

/**
 * Normalize a string by removing accents, converting to lowercase, 
 * and removing trailing/leading spaces.
 * Used for case-insensitive comparison of strings with special characters.
 *
 * @example
 * normalizeString("São Paulo ") → "sao paulo"
 * normalizeString("Praia") === normalizeString(" praia ") → true
 */
export function normalizeString(str: string): string {
  // Garantia de runtime: se por acaso receber null/undefined (vindo de uma API, por ex), 
  // retorna string vazia em vez de quebrar a aplicação.
  if (!str) return "";

  return str
    .trim() // Remove espaços em branco do início e do fim
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}