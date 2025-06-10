
import { useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { validateUserSession, fetchUserProfileSecurely, clearProfileCache } from '@/hooks/auth/utils/authSessionUtils';
import { UserProfile } from '@/lib/supabase';
import { logger } from '@/utils/logger';

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

  const setupAuthSession = useCallback(async () => {
    logger.info('[AUTH-STATE] Iniciando setup da sessão de autenticação');
    
    try {
      setIsLoading(true);

      // CORREÇÃO CRÍTICA: Validar sessão com verificações de segurança
      const { session, user } = await validateUserSession();
      
      if (!session || !user) {
        logger.info('[AUTH-STATE] Nenhuma sessão válida - limpando estado');
        setSession(null);
        setUser(null);
        setProfile(null);
        clearProfileCache();
        return;
      }

      // Definir sessão e usuário primeiro
      setSession(session);
      setUser(user);

      try {
        // CORREÇÃO CRÍTICA: Buscar perfil com validação de segurança
        const profile = await fetchUserProfileSecurely(user.id);
        
        if (profile) {
          // CORREÇÃO CRÍTICA: Validação adicional do perfil
          if (profile.id !== user.id) {
            logger.error('[AUTH-STATE] VIOLAÇÃO DE SEGURANÇA: ID do perfil não confere', {
              userId: user.id,
              profileId: profile.id
            });
            throw new Error('Violação de segurança detectada no perfil');
          }

          setProfile(profile);
          
          logger.info('[AUTH-STATE] Setup de autenticação concluído com sucesso', {
            userId: user.id.substring(0, 8) + '***',
            email: user.email?.substring(0, 3) + '***',
            hasProfile: true,
            roleName: profile.user_roles?.name || 'sem role'
          });
        } else {
          logger.warn('[AUTH-STATE] Usuário autenticado mas sem perfil');
          setProfile(null);
        }
        
      } catch (profileError) {
        logger.error('[AUTH-STATE] Erro ao buscar perfil:', profileError);
        
        // CORREÇÃO CRÍTICA: Se erro de perfil, manter usuário mas limpar perfil
        setProfile(null);
        
        // Se for erro de segurança, fazer logout completo
        if (profileError instanceof Error && 
            (profileError.message.includes('segurança') || 
             profileError.message.includes('Acesso negado'))) {
          logger.warn('[AUTH-STATE] Fazendo logout por violação de segurança');
          setSession(null);
          setUser(null);
          clearProfileCache();
        }
      }

    } catch (error) {
      logger.error('[AUTH-STATE] Erro crítico no setup de autenticação:', error);
      
      // CORREÇÃO CRÍTICA: Em caso de erro crítico, limpar tudo por segurança
      setSession(null);
      setUser(null);
      setProfile(null);
      clearProfileCache();
      
    } finally {
      setIsLoading(false);
      logger.info('[AUTH-STATE] Setup de autenticação finalizado');
    }
  }, [setSession, setUser, setProfile, setIsLoading]);

  return { setupAuthSession };
};
