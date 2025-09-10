// Re-exportação centralizada para garantir compatibilidade com importações existentes
export * from './client';
export * from './types';
export * from './config';

// Importar configuração de storage de certificados
import './setupCertificatesStorage';

// Importar utilitários admin (apenas em development)
if (import.meta.env.DEV) {
  import('../../utils/adminConsole');
}

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

// Exportação das funções de storage unificado
export {
  BUCKET_CONFIGS,
  validateFileForBucket,
  checkBucketExists,
  uploadFileUnified,
  removeFileUnified,
  listFilesUnified
} from './storage-unified';

// Exportação explícita das funções de RPC
export {
  createStoragePublicPolicy,
  incrementTopicViews,
  incrementTopicReplies,
  deleteCommunityTopic,
  deleteCommunityPost,
  toggleTopicSolved
} from './rpc';
