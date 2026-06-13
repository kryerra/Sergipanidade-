/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { gerarChaveCache, gerarRoteiroLocal, gerarRoteiroComIAComFallback } from './itinerary.service';
import { gerarRoteiroComIA } from './gemini/gemini.service';

vi.mock('./gemini/gemini.service', () => ({
  gerarRoteiroComIA: vi.fn(),
}));

describe('itinerary service', () => {
  const baseDados = {
    who: 'solo',
    days: 2,
    startDate: '2026-06-12',
    interests: ['natureza'] as string[],
    budget: 'economico',
    stopsPerDay: 3,
  };

  beforeEach(() => {
    sessionStorage.clear();
    vi.spyOn(Math, 'random').mockReturnValue(0.42);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('generates a stable cache key for the same inputs and changes by language', () => {
    const keyPt = gerarChaveCache(baseDados, 'pt');
    const keyEn = gerarChaveCache(baseDados, 'en');
    expect(keyPt).toBeTruthy();
    expect(keyEn).toBeTruthy();
    expect(keyPt).not.toBe(keyEn);
    expect(gerarChaveCache(baseDados, 'pt')).toBe(keyPt);
  });

  it('generates a local itinerary with the expected number of stops and no same-day duplicates', () => {
    const roteiro = gerarRoteiroLocal(baseDados, 'pt');
    expect(roteiro.length).toBe(6);

    const stopsByDay = roteiro.reduce<Record<number, string[]>>((acc, stop) => {
      acc[stop.dia] = acc[stop.dia] ?? [];
      acc[stop.dia].push(stop.destinationId);
      return acc;
    }, {});

    Object.values(stopsByDay).forEach((destinationIds) => {
      const unique = Array.from(new Set(destinationIds));
      expect(unique.length).toBe(destinationIds.length);
    });

    expect(new Set(roteiro.map((stop) => stop.periodo)).size).toBeGreaterThan(0);
    roteiro.forEach((stop) => {
      expect(stop.destinationId).toBeTruthy();
      expect(stop.dica).toBeTruthy();
      expect([1, 2]).toContain(stop.dia);
    });
  });

  it('uses cached AI itinerary when a valid cached entry exists', async () => {
    const cacheKey = gerarChaveCache(baseDados, 'pt');
    const cachedResult = {
      paradas: [
        { destinationId: 'museu-gente', dia: 1, periodo: 'manhã', dica: 'Visite cedo.' },
        { destinationId: 'orla-atalaia', dia: 1, periodo: 'tarde', dica: 'Aproveite a orla.' },
        { destinationId: 'centro-historico', dia: 1, periodo: 'noite', dica: 'Caminhe pelo centro cultural.' },
        { destinationId: 'canion-xingo', dia: 2, periodo: 'manhã', dica: 'Faça trilhas leves.' },
        { destinationId: 'parque-sementeira', dia: 2, periodo: 'tarde', dica: 'Explore a paisagem.' },
        { destinationId: 'mercado-thales', dia: 2, periodo: 'noite', dica: 'Deguste comidas típicas.' },
      ],
      isAI: true,
    };

    sessionStorage.setItem(cacheKey, JSON.stringify(cachedResult));

    const result = await gerarRoteiroComIAComFallback(baseDados, 'pt');

    expect(result.isAI).toBe(true);
    expect(result.paradas).toEqual(cachedResult.paradas);
  });

  it('falls back to local itinerary when AI generation throws an error', async () => {
    vi.mocked(gerarRoteiroComIA).mockRejectedValueOnce(new Error('IA indisponível'));

    const result = await gerarRoteiroComIAComFallback(baseDados, 'pt');

    expect(result.isAI).toBe(false);
    expect(result.paradas.length).toBe(6);
    expect(result.paradas.every((item) => typeof item.destinationId === 'string')).toBe(true);
  });

  it('ignores an invalid cache entry and generates a fresh itinerary', async () => {
    const cacheKey = gerarChaveCache(baseDados, 'pt');
    sessionStorage.setItem(cacheKey, 'not valid json');
    vi.mocked(gerarRoteiroComIA).mockRejectedValueOnce(new Error('IA indisponível'));

    const result = await gerarRoteiroComIAComFallback(baseDados, 'pt');

    expect(result.isAI).toBe(false);
    expect(result.paradas.length).toBe(6);
  });

  it('caches the AI-generated itinerary and returns isAI true for valid AI output', async () => {
    const cacheKey = gerarChaveCache(baseDados, 'pt');
    const aiResponse = JSON.stringify([
      { destinationId: 'museu-gente', dia: 1, periodo: 'manhã', dica: 'Visite o museu.' },
      { destinationId: 'orla-atalaia', dia: 1, periodo: 'tarde', dica: 'Aproveite a orla.' },
      { destinationId: 'centro-historico', dia: 1, periodo: 'noite', dica: 'Caminhe pelo centro cultural.' },
      { destinationId: 'canion-xingo', dia: 2, periodo: 'manhã', dica: 'Faça trilhas leves.' },
      { destinationId: 'parque-sementeira', dia: 2, periodo: 'tarde', dica: 'Explore a paisagem.' },
      { destinationId: 'mercado-thales', dia: 2, periodo: 'noite', dica: 'Deguste comidas típicas.' },
    ]);

    vi.mocked(gerarRoteiroComIA).mockResolvedValueOnce(aiResponse);

    const result = await gerarRoteiroComIAComFallback(baseDados, 'pt');

    expect(result.isAI).toBe(true);
    expect(result.paradas.length).toBe(6);
    expect(sessionStorage.getItem(cacheKey)).toContain('"isAI":true');
  });

  it('accepts old cache format arrays and migrates them to new cache structure', async () => {
    const cacheKey = gerarChaveCache(baseDados, 'pt');
    const legacyArray = [
      { destinationId: 'museu-gente', dia: 1, periodo: 'manhã', dica: 'Visite cedo.' },
      { destinationId: 'orla-atalaia', dia: 1, periodo: 'tarde', dica: 'Aproveite a orla.' },
      { destinationId: 'centro-historico', dia: 1, periodo: 'noite', dica: 'Caminhe pelo centro cultural.' },
      { destinationId: 'canion-xingo', dia: 2, periodo: 'manhã', dica: 'Faça trilhas leves.' },
      { destinationId: 'parque-sementeira', dia: 2, periodo: 'tarde', dica: 'Explore a paisagem.' },
      { destinationId: 'mercado-thales', dia: 2, periodo: 'noite', dica: 'Deguste comidas típicas.' },
    ];

    sessionStorage.setItem(cacheKey, JSON.stringify(legacyArray));

    const result = await gerarRoteiroComIAComFallback(baseDados, 'pt');

    expect(result.isAI).toBe(true);
    expect(result.paradas).toEqual(legacyArray);
    const stored = JSON.parse(sessionStorage.getItem(cacheKey) ?? 'null');
    expect(stored).toEqual({ paradas: legacyArray, isAI: true });
  });

  it('trims AI responses with extra stops down to the expected itinerary length', async () => {
    const extraStops = [
      { destinationId: 'museu-gente', dia: 1, periodo: 'manhã', dica: 'Visite o museu.' },
      { destinationId: 'orla-atalaia', dia: 1, periodo: 'tarde', dica: 'Aproveite a orla.' },
      { destinationId: 'centro-historico', dia: 1, periodo: 'noite', dica: 'Caminhe pelo centro cultural.' },
      { destinationId: 'canion-xingo', dia: 2, periodo: 'manhã', dica: 'Faça trilhas leves.' },
      { destinationId: 'parque-sementeira', dia: 2, periodo: 'tarde', dica: 'Explore a paisagem.' },
      { destinationId: 'mercado-thales', dia: 2, periodo: 'noite', dica: 'Deguste comidas típicas.' },
      { destinationId: 'memorial-sergipe', dia: 2, periodo: 'noite', dica: 'Veja a história local.' },
      { destinationId: 'miauteria', dia: 2, periodo: 'noite', dica: 'Experimente o café cultural.' },
    ];

    vi.mocked(gerarRoteiroComIA).mockResolvedValueOnce(JSON.stringify(extraStops));

    const result = await gerarRoteiroComIAComFallback(baseDados, 'pt');

    expect(result.isAI).toBe(true);
    expect(result.paradas.length).toBe(6);
  });

  it('fills missing AI stops when the response has one fewer than expected', async () => {
    const partialStops = [
      { destinationId: 'museu-gente', dia: 1, periodo: 'manhã', dica: 'Visite o museu.' },
      { destinationId: 'orla-atalaia', dia: 1, periodo: 'tarde', dica: 'Aproveite a orla.' },
      { destinationId: 'centro-historico', dia: 1, periodo: 'noite', dica: 'Caminhe pelo centro cultural.' },
      { destinationId: 'canion-xingo', dia: 2, periodo: 'manhã', dica: 'Faça trilhas leves.' },
      { destinationId: 'parque-sementeira', dia: 2, periodo: 'tarde', dica: 'Explore a paisagem.' },
    ];

    vi.mocked(gerarRoteiroComIA).mockResolvedValueOnce(JSON.stringify(partialStops));

    const result = await gerarRoteiroComIAComFallback(baseDados, 'pt');

    expect(result.isAI).toBe(true);
    expect(result.paradas.length).toBe(6);
  });

  it('replaces invalid destination IDs from AI output with valid alternatives', async () => {
    const invalidStops = [
      { destinationId: 'museu-gente-bad', dia: 1, periodo: 'manhã', dica: 'Visite o museu.' },
      { destinationId: 'orla-atalaia', dia: 1, periodo: 'tarde', dica: 'Aproveite a orla.' },
      { destinationId: 'centro-historico', dia: 1, periodo: 'noite', dica: 'Caminhe pelo centro cultural.' },
      { destinationId: 'canion-xingo', dia: 2, periodo: 'manhã', dica: 'Faça trilhas leves.' },
      { destinationId: 'parque-sementeira', dia: 2, periodo: 'tarde', dica: 'Explore a paisagem.' },
      { destinationId: 'mercado-thales', dia: 2, periodo: 'noite', dica: 'Deguste comidas típicas.' },
    ];

    vi.mocked(gerarRoteiroComIA).mockResolvedValueOnce(JSON.stringify(invalidStops));

    const result = await gerarRoteiroComIAComFallback(baseDados, 'pt');

    expect(result.isAI).toBe(true);
    expect(result.paradas).toHaveLength(6);
    expect(result.paradas.map((stop) => stop.destinationId)).not.toContain('museu-gente-bad');
  });

  it('removes duplicate same-day destinations from AI output and fills missing slots', async () => {
    const duplicateStops = [
      { destinationId: 'museu-gente', dia: 1, periodo: 'manhã', dica: 'Visite o museu.' },
      { destinationId: 'museu-gente', dia: 1, periodo: 'tarde', dica: 'Volte ao museu.' },
      { destinationId: 'orla-atalaia', dia: 1, periodo: 'noite', dica: 'Aproveite a orla.' },
      { destinationId: 'centro-historico', dia: 2, periodo: 'manhã', dica: 'Caminhe pelo centro cultural.' },
      { destinationId: 'canion-xingo', dia: 2, periodo: 'tarde', dica: 'Faça trilhas leves.' },
      { destinationId: 'parque-sementeira', dia: 2, periodo: 'noite', dica: 'Explore a paisagem.' },
    ];

    vi.mocked(gerarRoteiroComIA).mockResolvedValueOnce(JSON.stringify(duplicateStops));

    const result = await gerarRoteiroComIAComFallback(baseDados, 'pt');

    expect(result.isAI).toBe(true);
    expect(result.paradas).toHaveLength(6);
    const dayOneDestinations = result.paradas
      .filter((stop) => stop.dia === 1)
      .map((stop) => stop.destinationId);
    expect(new Set(dayOneDestinations).size).toBe(dayOneDestinations.length);
  });
});
