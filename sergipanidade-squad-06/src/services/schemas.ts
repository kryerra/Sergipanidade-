export type ParadaGerada = { destinationId: string; dia: number; periodo: string; dica: string };

export const ParadaGeradaArraySchema = {
  safeParse: (data: unknown) => {
    if (!Array.isArray(data)) {
      return { success: false, error: { format: () => ({ message: 'Not an array' }) } } as const;
    }
    const errors: Array<{ index: number; reason: string; item?: unknown }> = [];
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (typeof item !== 'object' || item === null) {
        errors.push({ index: i, reason: 'not an object', item });
        continue;
      }
      const obj = item as Record<string, unknown>;
      if (
        typeof obj.destinationId !== 'string' ||
        typeof obj.dia !== 'number' ||
        typeof obj.periodo !== 'string' ||
        typeof obj.dica !== 'string'
      ) {
        errors.push({ index: i, reason: 'invalid fields', item });
      }
    }
    if (errors.length > 0) {
      return { success: false, error: { format: () => errors } } as const;
    }
    return { success: true, data: data as ParadaGerada[] } as const;
  }
};
