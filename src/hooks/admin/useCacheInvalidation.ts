import { useQueryClient } from '@tanstack/react-query';
import { clearPermissionCache } from '@/contexts/auth/utils/securityUtils';
import { clearProfileCache } from '@/hooks/auth/utils/authSessionUtils';

/**
 * Hook para invalidar todos os caches relacionados a usuários
 * Usado após mudanças críticas como alteração de roles
 */
export const useCacheInvalidation = () => {
  const queryClient = useQueryClient();
  
  const invalidateAllUserCaches = async (userId: string) => {
    console.log('🗑️ [CACHE-INVALIDATION] Limpando TODOS os caches para:', userId.substring(0, 8) + '***');
    
    // 1. Limpar caches locais (Map refs)
    clearPermissionCache(userId);
    clearProfileCache(userId);
    
    // 2. Invalidar React Query cache - todas as queries relacionadas a usuários
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['profiles'] }),
      queryClient.invalidateQueries({ queryKey: ['profiles', userId] }),
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] }),
      queryClient.invalidateQueries({ queryKey: ['user-permissions', userId] }),
      queryClient.invalidateQueries({ queryKey: ['user-roles'] }),
      queryClient.invalidateQueries({ queryKey: ['feature-access'] }),
      queryClient.invalidateQueries({ queryKey: ['smart-feature-access'] }),
    ]);
    
    console.log('✅ [CACHE-INVALIDATION] Todos os caches invalidados');
  };
  
  return { invalidateAllUserCaches };
};
