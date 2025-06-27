
// Re-exporta as funções do módulo auth session utils localizado nos hooks
export { 
  processUserProfile,
  fetchUserProfileSecurely,
  validateUserSession,
  clearProfileCache
} from '@/hooks/auth/utils/authSessionUtils';
