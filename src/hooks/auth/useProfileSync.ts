
import { useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { invalidateProfileCache } from '@/hooks/auth/utils/authSessionUtils';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';

/**
 * Hook para sincronização de dados do perfil com o banco
 * Mantém o cache atualizado quando dados são modificados
 */
export const useProfileSync = () => {
  const { user, profile, setProfile } = useAuth();
  const lastSyncRef = useRef<number>(0);

  // Sincronizar perfil após atualizações
  const syncProfile = useCallback(async (showToast: boolean = false) => {
    if (!user?.id) {
      logger.warn('[PROFILE-SYNC] Usuário não disponível para sync');
      return false;
    }

    // Debounce: evitar sync muito frequente
    const now = Date.now();
    if (now - lastSyncRef.current < 2000) { // 2 segundos
      logger.debug('[PROFILE-SYNC] Sync muito recente, ignorando');
      return false;
    }
    lastSyncRef.current = now;

    try {
      logger.info('[PROFILE-SYNC] Sincronizando perfil...');

      // Invalidar cache primeiro
      invalidateProfileCache(user.id);

      // Buscar dados atualizados
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (
            id,
            name,
            description,
            permissions
          )
        `)
        .eq('id', user.id)
        .single();

      if (error) {
        logger.error('[PROFILE-SYNC] Erro ao sincronizar:', error);
        if (showToast) {
          toast.error('Erro ao sincronizar dados do perfil');
        }
        return false;
      }

      // Atualizar contexto se dados mudaram
      if (JSON.stringify(updatedProfile) !== JSON.stringify(profile)) {
        setProfile(updatedProfile);
        logger.info('[PROFILE-SYNC] Perfil atualizado no contexto');
        
        if (showToast) {
          toast.success('Dados do perfil sincronizados');
        }
      }

      return true;

    } catch (error) {
      logger.error('[PROFILE-SYNC] Erro crítico no sync:', error);
      if (showToast) {
        toast.error('Erro ao sincronizar perfil');
      }
      return false;
    }
  }, [user?.id, profile, setProfile]);

  // Marcar perfil como desatualizado (força novo fetch)
  const markProfileStale = useCallback(() => {
    if (user?.id) {
      invalidateProfileCache(user.id);
      logger.info('[PROFILE-SYNC] Perfil marcado como desatualizado');
    }
  }, [user?.id]);

  // Função para debugar dados do onboarding
  const getOnboardingData = useCallback(async () => {
    if (!user?.id) return null;
    
    try {
      const { data, error } = await supabase
        .from('onboarding_final')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        logger.error('[ONBOARDING-DEBUG] Erro ao buscar dados:', error);
        return null;
      }
      
      logger.info('[ONBOARDING-DEBUG] Dados encontrados:', data);
      console.log('📊 Dados do seu Step 1:', data?.personal_info || 'Nenhum dado encontrado');
      
      return data;
    } catch (error) {
      logger.error('[ONBOARDING-DEBUG] Erro crítico:', error);
      return null;
    }
  }, [user?.id]);

  return {
    syncProfile,
    markProfileStale,
    canSync: !!user?.id,
    getOnboardingData
  };
};
