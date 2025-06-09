
// Re-exportação centralizada para garantir compatibilidade com importações existentes
export * from './client';
export * from './types';
export * from './config';

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
} from './rpc';

// Exportação da interface UserProfile para compatibilidade
export interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  avatar_url?: string;
  company_name?: string;
  industry?: string;
  created_at?: string;
  onboarding_completed?: boolean;
  onboarding_completed_at?: string;
}
