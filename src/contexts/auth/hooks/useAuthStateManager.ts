
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
    logger.info('[AUTH-STATE] 🔧 Setup de sessão iniciado');
    
    try {
      setIsLoading(true);
      setGlobalLoading('auth', true);

      // SIMPLIFICAÇÃO FASE 2: Verificar sessão atual sem complexidade desnecessária
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        logger.error('[AUTH-STATE] Erro ao obter sessão:', sessionError);
        throw sessionError;
      }

      if (!session?.user) {
        logger.info('[AUTH-STATE] 🔓 Nenhuma sessão válida encontrada');
        setSession(null);
        setUser(null);
        setProfile(null);
        clearProfileCache();
        navigationCache.clear();
        return;
      }

      const user = session.user;
      logger.info(`[AUTH-STATE] 👤 Sessão válida encontrada: ${user.email}`);

      // Configurar sessão e usuário imediatamente
      setSession(session);
      setUser(user);

      // CORREÇÃO FASE 2: Buscar perfil de forma mais robusta, sem timeout artificial
      try {
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
          logger.error('[AUTH-STATE] ❌ Erro ao buscar perfil:', profileError);
          
          // Se for erro de "not found", é um caso especial
          if (profileError.code === 'PGRST116') {
            logger.error('[AUTH-STATE] 🚨 PERFIL NÃO EXISTE - usuário órfão');
            throw new Error(`Usuário ${user.email} não possui perfil. Contate o administrador.`);
          }
          
          // Se for erro de permissão, tentar abordagem alternativa
          if (profileError.code === '42501') {
            logger.warn('[AUTH-STATE] ⚠️ Erro de permissão detectado - tentando busca simples');
            
            const { data: simpleProfile, error: simpleError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();
              
            if (simpleError || !simpleProfile) {
              throw new Error('Não foi possível acessar o perfil do usuário');
            }
            
            // Criar perfil básico sem user_roles
            const basicProfile = {
              ...simpleProfile,
              user_roles: { 
                id: '', 
                name: 'member', 
                description: 'Membro padrão', 
                permissions: {} 
              }
            } as UserProfile;
            
            logger.info('[AUTH-STATE] ✅ Perfil básico carregado sem user_roles');
            setProfile(basicProfile);
            
            const roleName = basicProfile.user_roles?.name || 'member';
            navigationCache.set(user.id, basicProfile, roleName as any);
            
            logger.info(`[AUTH-STATE] ✅ Setup completo (fallback) - Usuário: ${user.email} | Role: ${roleName}`);
            return;
          }
          
          throw profileError;
        }

        if (!profileData) {
          logger.error('[AUTH-STATE] 🚨 DADOS DE PERFIL VAZIOS');
          throw new Error(`Perfil vazio para usuário ${user.email}`);
        }

        const profile = profileData as UserProfile;
        
        // VALIDAÇÃO DE SEGURANÇA
        if (profile.id !== user.id) {
          logger.error('[AUTH-STATE] 🔒 VIOLAÇÃO DE SEGURANÇA');
          throw new Error('Violação de segurança: IDs não coincidem');
        }

        // Configurar perfil e finalizar
        setProfile(profile);
        
        const roleName = profile.user_roles?.name || 'member';
        navigationCache.set(user.id, profile, roleName as any);
        
        logger.info(`[AUTH-STATE] ✅ Setup completo - Usuário: ${user.email} | Role: ${roleName}`);

      } catch (profileFetchError) {
        logger.error('[AUTH-STATE] ❌ Erro no bloco de busca de perfil:', profileFetchError);
        throw profileFetchError;
      }

    } catch (mainError) {
      logger.error('[AUTH-STATE] 💥 ERRO CRÍTICO no setup:', mainError);
      
      // RESET COMPLETO em caso de erro
      setSession(null);
      setUser(null);
      setProfile(null);
      clearProfileCache();
      navigationCache.clear();
      
      // Propagar erro para tratamento superior
      throw mainError;
      
    } finally {
      // SEMPRE finalizar loading
      setIsLoading(false);
      setGlobalLoading('auth', false);
      logger.info('[AUTH-STATE] 🏁 Setup finalizado (loading = false)');
    }
  }, [setSession, setUser, setProfile, setIsLoading, setGlobalLoading]);

  return { setupAuthSession };
};
