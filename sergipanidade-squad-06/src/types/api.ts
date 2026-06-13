export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}

export type Result<T> = { ok: true; data: T } | { ok: false; error: AppError };
