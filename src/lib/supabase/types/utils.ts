
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

// Versão específica para arrays de objetos
export const ensureArrayOfObjects = <T extends Record<string, any>>(
  value: T[] | undefined | null
): T[] => {
  if (!Array.isArray(value)) return [];
  return value.filter(item => item && typeof item === 'object' && !Array.isArray(item));
};

// Helper para garantir que um valor é um objeto válido
export const ensureObject = <T extends Record<string, any>>(
  value: T | undefined | null,
  fallback: Partial<T> = {}
): T => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ...fallback } as T;
  }
  return value;
};

export const ensureNumber = (value: number | string | undefined | null, fallback = 0): number => {
  const num = typeof value === 'string' ? parseInt(value, 10) : value;
  return typeof num === 'number' && !isNaN(num) ? num : fallback;
};

export const ensureString = (value: string | undefined | null, fallback = ""): string => {
  return typeof value === 'string' ? value : fallback;
};

export const ensureBoolean = (value: boolean | undefined | null, fallback = false): boolean => {
  return typeof value === 'boolean' ? value : fallback;
};

// Helper para criar props defensivas - VERSÃO CORRIGIDA
export const createSafeProps = <T extends Record<string, any>>(
  props: T | undefined,
  defaults: Partial<T> = {}
): T => {
  if (!props) return { ...defaults } as T;
  
  // Criar um novo objeto com os defaults primeiro
  const safeProps: Record<string, any> = { ...defaults };
  
  // Iterar sobre as propriedades do objeto de entrada
  Object.keys(props).forEach(key => {
    const value = props[key];
    if (value !== undefined && value !== null) {
      safeProps[key] = value;
    }
  });
  
  return safeProps as T;
};

// Validator para objetos de curso
export const validateCourseData = (course: any) => {
  return {
    id: ensureString(course?.id),
    title: ensureString(course?.title, "Curso sem título"),
    description: ensureString(course?.description),
    cover_image_url: course?.cover_image_url || null,
    published: ensureBoolean(course?.published),
    slug: ensureString(course?.slug, course?.id || 'curso-sem-slug'),
    order_index: ensureNumber(course?.order_index, 0),
    created_by: course?.created_by || null,
    module_count: ensureNumber(course?.module_count),
    lesson_count: ensureNumber(course?.lesson_count),
    all_lessons: ensureArray(course?.all_lessons),
    created_at: ensureString(course?.created_at),
    updated_at: ensureString(course?.updated_at)
  };
};

// Validator para objetos de lesson
export const validateLessonData = (lesson: any) => {
  const validatedLesson = ensureObject(lesson, {
    id: '',
    title: 'Aula sem título',
    description: '',
    order_index: 0,
    estimated_time_minutes: 0,
    difficulty_level: 'beginner'
  });

  return {
    id: ensureString(validatedLesson.id),
    title: ensureString(validatedLesson.title, 'Aula sem título'),
    description: ensureString(validatedLesson.description),
    order_index: ensureNumber(validatedLesson.order_index, 0),
    cover_image_url: validatedLesson.cover_image_url || null,
    estimated_time_minutes: ensureNumber(validatedLesson.estimated_time_minutes, 0),
    difficulty_level: ensureString(validatedLesson.difficulty_level, 'beginner'),
    module_id: ensureString(validatedLesson.module_id),
    published: ensureBoolean(validatedLesson.published),
    created_at: ensureString(validatedLesson.created_at),
    updated_at: ensureString(validatedLesson.updated_at),
    content: validatedLesson.content || null,
    ai_assistant_enabled: ensureBoolean(validatedLesson.ai_assistant_enabled),
    ai_assistant_prompt: validatedLesson.ai_assistant_prompt || null,
    ai_assistant_id: validatedLesson.ai_assistant_id || null
  };
};

// Helper para validar progresso do usuário
export const validateUserProgress = (progress: any[]) => {
  return ensureArray(progress).map(p => ({
    id: ensureString(p?.id),
    user_id: ensureString(p?.user_id),
    lesson_id: ensureString(p?.lesson_id),
    progress_percentage: ensureNumber(p?.progress_percentage),
    completed_at: p?.completed_at || null,
    started_at: ensureString(p?.started_at),
    video_progress: p?.video_progress || {},
    notes: p?.notes || null
  }));
};
