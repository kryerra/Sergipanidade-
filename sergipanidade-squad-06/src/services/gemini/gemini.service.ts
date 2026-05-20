/**
 * Gemini AI Service — Sergipanidade
 * Handles all interactions with Google's Generative AI API
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

/**
 * Extracts the suggested retry delay (in milliseconds) from a 429 error.
 * Returns null if no retry delay is found.
 */
export function parseRetryDelayMs(error: unknown): number | null {
  try {
    const message = (error as { message?: string })?.message ?? '';
    const match = message.match(/retry in ([\d.]+)s/i);
    if (match) {
      return Math.ceil(parseFloat(match[1])) * 1000;
    }
  } catch {}
  return null;
}

/**
 * Checks if error indicates daily/total quota exhausted (no useful retry).
 */
export function isDailyQuotaExhausted(error: unknown): boolean {
  const message = (error as { message?: string })?.message ?? '';
  return (
    message.includes('generate_content_free_tier_requests') &&
    message.includes('PerDayPerProjectPerModel')
  );
}

/**
 * Internal: makes a single call to the Gemini API.
 * Throws if the API key is missing or the call fails.
 */
async function chamarGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error(
      'VITE_GEMINI_API_KEY não definida. Crie um arquivo .env com a chave do Gemini.'
    );
  }
 
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
 
  const result = await model.generateContent(prompt);
  const response = result.response;
 
  if (!response) {
    throw new Error('Empty response from Gemini API');
  }
 
  return response.text();
}
 

/**
 * Public interface for generating content with Gemini AI.
 * Handles retries for rate limiting (429 errors).
 * Falls back gracefully if daily quota is exceeded.
 *
 * @param prompt The full prompt to send to Gemini
 * @returns Promise<string> The AI response text
 * @throws Error if API call fails after retry
 */
export async function gerarRoteiroComIA(prompt: string): Promise<string> {
  try {
    return await chamarGemini(prompt);
  } catch (apiError: unknown) {
    const message = (apiError as { message?: string })?.message ?? '';
    const is429 = message.includes('429');
 
    if (is429 && !isDailyQuotaExhausted(apiError)) {
      const delayMs = parseRetryDelayMs(apiError) ?? 15000;
 
      if (delayMs <= 30000) {
        console.info(`Gemini rate-limit 429 — retrying in ${delayMs / 1000}s…`);
        await new Promise(r => setTimeout(r, delayMs));
 
        try {
          return await chamarGemini(prompt);
        } catch (retryError: unknown) {
          console.warn('Retry failed:', (retryError as { message?: string })?.message ?? retryError);
          throw retryError;
        }
      } else {
        console.warn('Gemini rate-limit with long delay, failing.');
        throw apiError;
      }
    } else {
      console.warn('Gemini API unavailable:', message);
      throw apiError;
    }
  }
}