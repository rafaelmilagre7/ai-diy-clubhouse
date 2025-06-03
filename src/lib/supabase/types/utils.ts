
// Tipos utilitários e helpers
export type OptionalProps<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredProps<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Helper para tornar propriedades opcionais com fallbacks
export type WithFallbacks<T> = {
  [K in keyof T]: T[K] extends undefined ? T[K] : T[K] | undefined;
};

// Tipo para componentes que podem não receber dados completos
export type SafeComponentProps<T> = {
  [K in keyof T]: T[K] extends object 
    ? WithFallbacks<T[K]> 
    : T[K] extends undefined 
      ? T[K] 
      : T[K] | undefined;
};

// Utilities para validação de dados
export const withDefaults = <T extends Record<string, any>>(
  data: Partial<T> | undefined,
  defaults: Partial<T>
): T => {
  return { ...defaults, ...data } as T;
};

export const safeAccess = <T, K extends keyof T>(
  obj: T | undefined | null,
  key: K,
  fallback?: T[K]
): T[K] | undefined => {
  return obj?.[key] ?? fallback;
};

export const ensureArray = <T>(value: T[] | undefined | null): T[] => {
  return Array.isArray(value) ? value : [];
};

export const ensureNumber = (value: number | string | undefined | null, fallback = 0): number => {
  const num = typeof value === 'string' ? parseInt(value, 10) : value;
  return typeof num === 'number' && !isNaN(num) ? num : fallback;
};
