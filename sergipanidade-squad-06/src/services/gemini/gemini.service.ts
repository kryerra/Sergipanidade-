/**
 * Gemini AI Service — Sergipanidade
 * Handles all interactions with Google's Generative AI API
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = "AIzaSyDnk8hppYIUf-REqRfHATFDf2c9wLkKP2o";

/**
 * Extracts the suggested retry delay (in milliseconds) from a 429 error
 * Returns null if no retry delay is found
 */
export function parseRetryDelayMs(error: any): number | null {
  try {
    const message: string = error?.message ?? '';
    const match = message.match(/retry in ([\d.]+)s/i);
    if (match) {
      return Math.ceil(parseFloat(match[1])) * 1000;
    }
  } catch {}
  return null;
}

/**
 * Checks if error indicates daily/total quota exhausted (no useful retry)
 */
export function isDailyQuotaExhausted(error: any): boolean {
  const message: string = error?.message ?? '';
  return (
    message.includes('generate_content_free_tier_requests') &&
    message.includes('PerDayPerProjectPerModel')
  );
}

/**
 * Makes a call to Gemini API with the provided prompt
 * Throws error if API call fails
 */
async function chamarGemini(prompt: string): Promise<string> {
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
 * Public interface for generating itinerary with AI
 * Handles retries for rate limiting (429 errors)
 * Falls back gracefully if daily quota exceeded
 * 
 * @param prompt The full prompt to send to Gemini
 * @returns Promise<string> The AI response text
 * @throws Error if API call fails
 */
export async function gerarRoteiroComIA(prompt: string): Promise<string> {
  try {
    // Try the API call
    return await chamarGemini(prompt);
  } catch (apiError: any) {
    const is429 = String(apiError?.message ?? '').includes('429');

    if (is429 && !isDailyQuotaExhausted(apiError)) {
      // Rate limit per minute: wait suggested delay and retry once
      const delayMs = parseRetryDelayMs(apiError) ?? 15000;
      
      if (delayMs <= 30000) {
        console.info(`Gemini rate-limit 429 — retrying in ${delayMs / 1000}s…`);
        await new Promise(r => setTimeout(r, delayMs));
        
        try {
          return await chamarGemini(prompt);
        } catch (retryError: any) {
          console.warn('Retry failed:', retryError?.message ?? retryError);
          throw retryError;
        }
      } else {
        console.warn('Gemini rate-limit with long delay, failing.');
        throw apiError;
      }
    } else {
      // Daily quota exhausted or other error
      console.warn('Gemini API unavailable:', apiError?.message ?? apiError);
      throw apiError;
    }
  }
}