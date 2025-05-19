
// Re-exportação centralizada para garantir compatibilidade com importações existentes
export * from './client';
export * from './config';

// Exportamos seletivamente dos types para evitar conflitos com Solution
export type {
  LearningLesson,
  LearningLessonVideo,
  LearningModule,
  LearningCourse,
  LearningProgress,
  LearningResource,
  LearningComment,
  LearningLessonTool,
  UserProfile
} from './types';

// Exportação explícita das funções de storage
export { 
  getYoutubeVideoId, 
  getYoutubeThumbnailUrl, 
  formatVideoDuration,
  setupLearningStorageBuckets,
  ensureBucketExists,
  extractPandaVideoInfo,
  uploadFileWithFallback
} from './storage';

// Exportação explícita das funções de RPC
export {
  createStoragePublicPolicy,
  incrementTopicViews,
  incrementTopicReplies,
  deleteForumTopic,
  deleteForumPost
  // Adicionar outras funções RPC conforme necessário
} from './rpc';

// Exportar tipos específicos do Solution
import type { Solution as SupabaseSolution } from './types';
export type { SupabaseSolution };

// Exportamos a versão "unificada" do Solution para ser a padrão 
export { type Solution } from '@/types/solution';

// Exportar tipos do módulo Module para componentes que o usam
export type Module = {
  id: string;
  title: string;
  type: string;
  content: any;
  solution_id: string;
  module_order: number;
  created_at: string;
  updated_at: string;
  estimated_time_minutes?: number;
};
