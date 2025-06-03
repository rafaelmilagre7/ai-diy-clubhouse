
// Exportações simplificadas para evitar dependências circulares
export { supabase } from './client';
export type { Tables } from './client';

// Exportar apenas tipos essenciais
export type {
  Database,
  UserProfile,
  Solution,
  Progress,
  Analytics,
  ForumCategory,
  ForumTopic,
  ForumPost,
  Tool,
  Event,
  Course,
  Module,
  Lesson,
  Resource,
  ImplementationTrail,
  UserRole
} from './types/index';

// Exportar configurações básicas
export { ensureStorageBucketExists, createStoragePublicPolicy } from './client';
