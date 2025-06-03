
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useRetryWithBackoff } from './useRetryWithBackoff';
import { logger } from '@/utils/logger';

interface DataIntegrityResult {
  user_id: string;
  profile_exists: boolean;
  quick_onboarding_exists: boolean;
  onboarding_progress_exists: boolean;
  profile_created: boolean;
  user_email: string;
  user_name: string;
}

export const useAuthDataIntegrity = () => {
  const { user, profile, setProfile } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<DataIntegrityResult | null>(null);
  
  const { executeWithRetry } = useRetryWithBackoff({
    maxAttempts: 2,
    initialDelay: 500
  });

  const checkAndFixData = useCallback(async () => {
    if (!user?.id) {
      logger.warn('Tentativa de verificação sem usuário autenticado', undefined, 'useAuthDataIntegrity');
      return null;
    }

    try {
      setIsChecking(true);
      
      logger.info('Iniciando verificação de integridade', {
        userId: user.id
      }, 'useAuthDataIntegrity');

      const result = await executeWithRetry(async () => {
        const { data, error } = await supabase.rpc('check_and_fix_onboarding_data', {
          user_id_param: user.id
        });

        if (error) {
          logger.error('Erro ao verificar integridade', {
            error: error.message,
            userId: user.id
          }, 'useAuthDataIntegrity');
          throw error;
        }

        return data;
      }, 'verificação de integridade dos dados');

      logger.info('Verificação concluída com sucesso', {
        result,
        userId: user.id
      }, 'useAuthDataIntegrity');

      setLastCheck(result);

      // Se o perfil foi criado, atualizar o contexto de auth
      if (result.profile_created && !profile) {
        logger.info('Perfil criado automaticamente, atualizando contexto', undefined, 'useAuthDataIntegrity');
        
        try {
          const { data: newProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (!profileError && newProfile) {
            setProfile(newProfile);
            toast.success('Perfil configurado automaticamente');
            
            logger.info('Contexto de perfil atualizado', {
              profileId: newProfile.id
            }, 'useAuthDataIntegrity');
          }
        } catch (profileErr: any) {
          logger.error('Erro ao buscar perfil recém-criado', {
            error: profileErr.message,
            userId: user.id
          }, 'useAuthDataIntegrity');
        }
      }

      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao verificar dados do usuário';
      
      logger.error('Falha na verificação de integridade', {
        error: errorMessage,
        userId: user.id
      }, 'useAuthDataIntegrity');
      
      toast.error('Erro ao verificar dados do usuário');
      return null;
    } finally {
      setIsChecking(false);
    }
  }, [user?.id, profile, setProfile, executeWithRetry]);

  return {
    checkAndFixData,
    isChecking,
    lastCheck,
    hasIntegrityIssues: lastCheck && (!lastCheck.profile_exists || (!lastCheck.quick_onboarding_exists && !lastCheck.onboarding_progress_exists))
  };
};
