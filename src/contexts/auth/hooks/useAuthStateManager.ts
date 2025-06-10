
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

      // CORREÇÃO 1: Timeout mais otimizado com Promise.race
      const sessionPromise = validateUserSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Auth timeout")), 5000) // Aumentado para 5s
      );

      let sessionResult;
      try {
        sessionResult = await Promise.race([sessionPromise, timeoutPromise]) as { session: Session | null; user: User | null };
      } catch (timeoutError) {
        logger.warn('[AUTH-STATE] Timeout na validação de sessão, tentando novamente...');
        // Segunda tentativa sem timeout
        sessionResult = await validateUserSession();
      }

      const { session, user } = sessionResult;
      
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

      // CORREÇÃO 2: Verificação imediata de admin por email (circuit breaker)
      const isAdminByEmail = user.email && [
        'rafael@viverdeia.ai',
        'admin@viverdeia.ai',
        'admin@teste.com'
      ].includes(user.email.toLowerCase());

      if (isAdminByEmail) {
        logger.info('[AUTH-STATE] Admin detectado por email - priorizando acesso');
        // Para admins por email, não bloquear por perfil
      }

      try {
        // CORREÇÃO 3: Buscar perfil com timeout próprio
        const profilePromise = fetchUserProfileSecurely(user.id);
        const profileTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Profile timeout")), 3000)
        );

        let profile;
        try {
          profile = await Promise.race([profilePromise, profileTimeoutPromise]) as UserProfile | null;
        } catch (profileTimeoutError) {
          logger.warn('[AUTH-STATE] Timeout no perfil, continuando sem perfil completo');
          profile = null;
        }
        
        if (profile) {
          // Validação adicional do perfil
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
          
          // Para admins por email, isso é aceitável
          if (!isAdminByEmail) {
            logger.warn('[AUTH-STATE] Usuário sem admin por email e sem perfil');
          }
        }
        
      } catch (profileError) {
        logger.error('[AUTH-STATE] Erro ao buscar perfil:', profileError);
        
        // Se for admin por email, permitir acesso mesmo sem perfil
        if (isAdminByEmail) {
          logger.info('[AUTH-STATE] Admin por email - permitindo acesso sem perfil');
          setProfile(null);
        } else {
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
      }

    } catch (error) {
      logger.error('[AUTH-STATE] Erro crítico no setup de autenticação:', error);
      
      // CORREÇÃO 4: Em caso de erro crítico, limpar tudo mas não bloquear completamente
      if (error instanceof Error && error.message.includes('timeout')) {
        logger.warn('[AUTH-STATE] Erro de timeout - mantendo sessão básica se possível');
        // Não limpar sessão em caso de timeout
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
        clearProfileCache();
      }
      
    } finally {
      setIsLoading(false);
      logger.info('[AUTH-STATE] Setup de autenticação finalizado');
    }
  }, [setSession, setUser, setProfile, setIsLoading]);

  return { setupAuthSession };
};
