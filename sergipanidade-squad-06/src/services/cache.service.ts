// @ts-expect-error - lru-cache does not provide types in this project configuration
import { LRUCache } from 'lru-cache';

export const COOKIE_CONSENT_KEY = 'sergipanidade_cookie_consent';

export interface ICacheService {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T, ttl?: number): void;
  clear(): void;
  has(key: string): boolean;
}

export interface CookiePreferences {
  required: boolean;
  performance: boolean;
  analytics: boolean;
}

export class CacheService implements ICacheService {
  private static instance: CacheService;
  private memoryCache: LRUCache<string, any>;
  private storagePrefix = 'sergipanidade_cache:';

  private constructor() {
    // Cache de até 100 itens em memória, expiração padrão de 1 hora
    this.memoryCache = new LRUCache<string, any>({
      max: 100,
      ttl: 1000 * 60 * 60, // 1 hora
    });
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Verifica se o usuário permitiu cookies de desempenho
   */
  private isPerformanceAllowed(): boolean {
    try {
      const consentStr = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consentStr) return false;
      const consent = JSON.parse(consentStr) as CookiePreferences;
      return !!consent.performance;
    } catch {
      return false;
    }
  }

  public get<T>(key: string): T | null {
    // 1. Tenta recuperar do cache em memória
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key) as T;
    }

    // 2. Tenta recuperar do localStorage (se permitido)
    if (this.isPerformanceAllowed()) {
      try {
        const stored = localStorage.getItem(this.storagePrefix + key);
        if (stored) {
          const { value, expiry } = JSON.parse(stored);
          // Verifica expiração
          if (!expiry || expiry > Date.now()) {
            // Atualiza cache em memória
            this.memoryCache.set(key, value);
            return value as T;
          } else {
            // Remove expirado
            localStorage.removeItem(this.storagePrefix + key);
          }
        }
      } catch (e) {
        console.warn('Falha ao ler do localStorage cache:', e);
      }
    }

    return null;
  }

  public set<T>(key: string, value: T, ttl: number = 1000 * 60 * 60): void {
    // Salva em memória sempre (transiente)
    this.memoryCache.set(key, value, { ttl });

    // Salva no localStorage (se permitido)
    if (this.isPerformanceAllowed()) {
      try {
        const item = {
          value,
          expiry: Date.now() + ttl,
        };
        localStorage.setItem(this.storagePrefix + key, JSON.stringify(item));
      } catch (e) {
        console.warn('Falha ao salvar no localStorage cache:', e);
      }
    }
  }

  public has(key: string): boolean {
    if (this.memoryCache.has(key)) return true;
    if (this.isPerformanceAllowed()) {
      return localStorage.getItem(this.storagePrefix + key) !== null;
    }
    return false;
  }

  public clear(): void {
    this.memoryCache.clear();
    if (typeof window !== 'undefined') {
      try {
        Object.keys(localStorage)
          .filter(k => k.startsWith(this.storagePrefix))
          .forEach(k => localStorage.removeItem(k));
      } catch (e) {
        console.warn('Falha ao limpar cache do localStorage:', e);
      }
    }
  }
}

export function getCookiePreferences(): CookiePreferences | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    return stored ? (JSON.parse(stored) as CookiePreferences) : null;
  } catch (e) {
    console.warn('Falha ao ler preferências de cookies:', e);
    return null;
  }
}

export function saveCookiePreferences(preferences: CookiePreferences): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(preferences));
  } catch (e) {
    console.warn('Falha ao salvar preferências de cookies:', e);
  }
}

export const cacheService = CacheService.getInstance();
