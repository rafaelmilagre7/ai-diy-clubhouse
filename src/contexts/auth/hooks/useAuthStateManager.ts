
import { useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { validateUserSession, fetchUserProfileSecurely, clearProfileCache } from '@/hooks/auth/utils/authSessionUtils';
import { UserProfile } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import { navigationCache } from '@/utils/navigationCache';

interface UseAuthStateManagerProps {
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useAuthStateManager = ({
  setSession,
  setUser,
  setProfile,
  setIsLoading,
}: UseAuthStateManagerProps) => {
  const { setLoading: setGlobalLoading, circuitBreakerActive } = useGlobalLoading();

  const setupAuthSession = useCallback(async () => {
    logger.info('[AUTH-STATE] Setup direto iniciado');
    
    try {
      setIsLoading(true);
      setGlobalLoading('auth', true);

      // Validação direta - sem timeouts ou circuit breakers
      const sessionResult = await validateUserSession();
      const { session, user } = sessionResult;
      
      if (!session || !user) {
        logger.info('[AUTH-STATE] Sem sessão válida');
        setSession(null);
        setUser(null);
        setProfile(null);
        clearProfileCache();
        navigationCache.clear();
        return;
      }

      // Definir sessão e usuário
      setSession(session);
      setUser(user);

      // Buscar perfil diretamente da tabela profiles
      const { data: profileData, error: profileError } = await supabase
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

      if (profileError) {
        logger.error('[AUTH-STATE] ERRO CRÍTICO ao buscar perfil:', profileError);
        throw new Error(`Perfil não encontrado para usuário ${user.id}: ${profileError.message}`);
      }

      if (!profileData) {
        logger.error('[AUTH-STATE] ERRO CRÍTICO: Perfil não existe');
        throw new Error(`Usuário ${user.id} não possui perfil. Estado de dados corrompido.`);
      }

      const profile = profileData as UserProfile;
      
      // Validação de segurança crítica
      if (profile.id !== user.id) {
        logger.error('[AUTH-STATE] VIOLAÇÃO DE SEGURANÇA CRÍTICA');
        throw new Error('Violação de segurança detectada: ID de perfil não corresponde ao usuário');
      }

      setProfile(profile);
      
      // Cache sem lógica complexa
      const roleName = profile.user_roles?.name;
      if (roleName) {
        navigationCache.set(user.id, profile, roleName as any);
        logger.info(`[AUTH-STATE] ✅ Perfil carregado: ${roleName}`);
      }

    } catch (error) {
      logger.error('[AUTH-STATE] ERRO CRÍTICO:', error);
      
      // Limpar tudo e deixar o erro subir
      setSession(null);
      setUser(null);
      setProfile(null);
      clearProfileCache();
      navigationCache.clear();
      
      // Re-throw para forçar tratamento no nível superior
      throw error;
      
    } finally {
      setIsLoading(false);
      setGlobalLoading('auth', false);
    }
  }, [setSession, setUser, setProfile, setIsLoading, setGlobalLoading]);

  return { setupAuthSession };
};
