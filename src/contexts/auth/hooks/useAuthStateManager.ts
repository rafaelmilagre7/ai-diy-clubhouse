
import { useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { validateUserSession, fetchUserProfileSecurely, clearProfileCache } from '@/hooks/auth/utils/authSessionUtils';
import { UserProfile } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import { navigationCache } from '@/utils/navigationCache';
import { fetchUserProfile } from '@/contexts/auth/utils/profileUtils/userProfileFunctions';

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
  const { setLoading: setGlobalLoading } = useGlobalLoading();

  const setupAuthSession = useCallback(async () => {
    console.log('🚀 [AUTH-STATE] Iniciando setup robusto de autenticação');
    
    try {
      setIsLoading(true);
      setGlobalLoading('auth', true);

      // Validação de sessão
      const sessionResult = await validateUserSession();
      const { session, user } = sessionResult;
      
      if (!session || !user) {
        console.log('ℹ️ [AUTH-STATE] Sem sessão válida - limpando estado');
        setSession(null);
        setUser(null);
        setProfile(null);
        clearProfileCache();
        navigationCache.clear();
        return;
      }

      // Definir sessão e usuário imediatamente
      setSession(session);
      setUser(user);

      console.log(`👤 [AUTH-STATE] Usuário autenticado: ${user.email} (${user.id})`);

      // Buscar perfil usando a função robusta
      console.log('📊 [AUTH-STATE] Iniciando busca robusta do perfil...');
      
      try {
        const profile = await fetchUserProfile(user.id);
        
        if (profile) {
          console.log('✅ [AUTH-STATE] Perfil carregado com sucesso:', {
            nome: profile.name,
            email: profile.email,
            role: profile.user_roles?.name || 'sem role'
          });

          setProfile(profile);
          
          // Configurar cache de navegação
          const roleName = profile.user_roles?.name;
          if (roleName) {
            navigationCache.set(user.id, profile, roleName as any);
            console.log(`🗂️ [AUTH-STATE] Cache configurado para role: ${roleName}`);
          }

          // Verificação especial para admins por email
          const isAdminByEmail = user.email && [
            'rafael@viverdeia.ai',
            'admin@viverdeia.ai',
            'admin@teste.com'
          ].includes(user.email.toLowerCase());

          if (isAdminByEmail) {
            console.log('👑 [AUTH-STATE] Admin detectado por email:', user.email);
          }

        } else {
          console.warn('⚠️ [AUTH-STATE] Perfil não encontrado - tentando criar...');
          
          // Tentar criar perfil se não existir
          try {
            const { createUserProfileIfNeeded } = await import('@/contexts/auth/utils/profileUtils/userProfileFunctions');
            const newProfile = await createUserProfileIfNeeded(
              user.id, 
              user.email || '', 
              user.user_metadata?.name || user.user_metadata?.full_name || 'Usuário'
            );
            
            if (newProfile) {
              console.log('🆕 [AUTH-STATE] Novo perfil criado:', newProfile.name);
              setProfile(newProfile);
            } else {
              console.error('❌ [AUTH-STATE] Falha ao criar perfil');
              
              // FALLBACK: Permitir login mesmo sem perfil completo
              const fallbackProfile: UserProfile = {
                id: user.id,
                email: user.email || '',
                name: user.user_metadata?.name || user.user_metadata?.full_name || 'Usuário',
                role_id: null,
                user_roles: null,
                avatar_url: null,
                company_name: null,
                industry: null,
                created_at: new Date().toISOString(),
              };
              
              console.log('🆘 [AUTH-STATE] Usando perfil de fallback');
              setProfile(fallbackProfile);
            }
          } catch (createError) {
            console.error('💥 [AUTH-STATE] Erro ao criar perfil:', createError);
            
            // ÚLTIMO RECURSO: Login básico
            const basicProfile: UserProfile = {
              id: user.id,
              email: user.email || '',
              name: 'Usuário',
              role_id: null,
              user_roles: null,
              avatar_url: null,
              company_name: null,
              industry: null,
              created_at: new Date().toISOString(),
            };
            
            console.log('🆘 [AUTH-STATE] Login básico permitido');
            setProfile(basicProfile);
          }
        }

      } catch (profileError) {
        console.error('💥 [AUTH-STATE] Erro crítico na busca do perfil:', profileError);
        
        // ESTRATÉGIA DE RECUPERAÇÃO: Permitir login básico
        console.log('🔄 [AUTH-STATE] Aplicando estratégia de recuperação...');
        
        const recoveryProfile: UserProfile = {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.user_metadata?.full_name || 'Usuário',
          role_id: null,
          user_roles: null,
          avatar_url: null,
          company_name: null,
          industry: null,
          created_at: new Date().toISOString(),
        };
        
        setProfile(recoveryProfile);
        console.log('🆘 [AUTH-STATE] Usuário logado com perfil de recuperação');
      }

    } catch (error) {
      console.error('💥 [AUTH-STATE] ERRO CRÍTICO no setup de autenticação:', error);
      
      // Limpar estado em caso de erro crítico
      setSession(null);
      setUser(null);
      setProfile(null);
      clearProfileCache();
      navigationCache.clear();
      
      // Re-throw apenas se for um erro que impeça completamente o funcionamento
      if (error instanceof Error && error.message.includes('VIOLAÇÃO DE SEGURANÇA')) {
        throw error;
      }
      
      // Para outros erros, logar mas não impedir o funcionamento
      logger.error('[AUTH-STATE] Erro no setup, mas continuando...', error);
      
    } finally {
      setIsLoading(false);
      setGlobalLoading('auth', false);
      console.log('🏁 [AUTH-STATE] Setup de autenticação finalizado');
    }
  }, [setSession, setUser, setProfile, setIsLoading, setGlobalLoading]);

  return { setupAuthSession };
};
