
// Re-exportação centralizada para garantir compatibilidade com importações existentes
export * from './supabase/client';
export * from './supabase/types';
export * from './supabase/config';

// Exportação explícita das funções de storage
export { 
  getYoutubeVideoId, 
  getYoutubeThumbnailUrl, 
  formatVideoDuration,
  setupLearningStorageBuckets,
  ensureBucketExists,
  extractPandaVideoInfo,
  uploadFileWithFallback
} from './supabase/storage';

// Exportação explícita das funções de RPC
export {
  createStoragePublicPolicy,
  incrementTopicViews,
  incrementTopicReplies,
  deleteForumTopic,
  deleteForumPost
} from './supabase/rpc';

// Exportação explícita do cliente Supabase
export { supabase } from './supabase/client';
