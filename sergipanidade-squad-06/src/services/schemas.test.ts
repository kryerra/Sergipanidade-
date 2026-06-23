import { describe, it, expect } from 'vitest';
import { ParadaGeradaArraySchema } from './schemas';

describe('ParadaGeradaArraySchema', () => {
  it('validates an array of valid ParadaGerada items', () => {
    const data = [
      { destinationId: 'museu-gente', dia: 1, periodo: 'manhã', dica: 'Visite cedo para evitar filas.' },
      { destinationId: 'orla-atalaia', dia: 1, periodo: 'tarde', dica: 'Aproveite a orla ao entardecer.' },
    ];

    const result = ParadaGeradaArraySchema.safeParse(data);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(data);
  });

  it('rejects invalid array items', () => {
    const data = [
      { destinationId: 'museu-gente', dia: 1, periodo: 'manhã', dica: 'Visite cedo.' },
      { destinationId: 'orla-atalaia', dia: 'dois', periodo: 'tarde', dica: 'Aproveite a orla.' },
    ];

    const result = ParadaGeradaArraySchema.safeParse(data);

    expect(result.success).toBe(false);
    expect(result.error?.format()).toEqual([
      { index: 1, reason: 'invalid fields', item: data[1] },
    ]);
  });
});
