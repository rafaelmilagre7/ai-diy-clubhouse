import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { clearProfileCache } from '@/contexts/auth/utils/profileUtils/userProfileFunctions';
import { logger } from '@/utils/logger';

/**
 * Hook temporário para forçar reload do perfil após correção do cache
 */
export const useForceProfileReload = () => {
  const { user, forceReloadProfile } = useAuth();

  useEffect(() => {
    const forceReload = async () => {
      if (user?.id) {
        try {
          logger.info('[FORCE_RELOAD] 🚀 Iniciando reload forçado do perfil', { userId: user.id });
          
          // Limpar cache completamente
          clearProfileCache();
          
          // Forçar reload
          await forceReloadProfile();
          
          logger.info('[FORCE_RELOAD] ✅ Reload do perfil concluído');
        } catch (error) {
          logger.error('[FORCE_RELOAD] ❌ Erro ao forçar reload:', error);
        }
      }
    };

    // Executar apenas uma vez quando o componente montar
    forceReload();
  }, []); // Array vazio para executar apenas uma vez

  return null;
};