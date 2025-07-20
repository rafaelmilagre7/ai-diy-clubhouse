
import { useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';
import { fetchUserProfileSecurely, validateUserSession, processUserProfile } from '@/hooks/auth/utils/authSessionUtils';

interface UseAuthStateManagerParams {
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useAuthStateManager = ({
  setSession,
  setUser,
  setProfile,
  setIsLoading,
}: UseAuthStateManagerParams) => {

  const setupAuthSession = useCallback(async (): Promise<void> => {
    try {
      console.log('🔄 [AUTH-STATE] Iniciando setup da sessão');
      setIsLoading(true);

      // Validar sessão atual
      const { session, user } = await validateUserSession();
      
      if (!session || !user) {
        console.log('❌ [AUTH-STATE] Sessão inválida ou inexistente');
        setSession(null);
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }

      console.log(`✅ [AUTH-STATE] Sessão válida para: ${user.email}`);
      
      // Definir sessão e usuário imediatamente
      setSession(session);
      setUser(user);

      // Buscar perfil do usuário
      try {
        const profile = await fetchUserProfileSecurely(user.id);
        
        if (profile) {
          console.log(`👤 [AUTH-STATE] Perfil carregado: ${profile.name}`);
          setProfile(profile);
        } else {
          console.log('⚠️ [AUTH-STATE] Perfil não encontrado, tentando processar...');
          
          // Tentar processar/criar perfil
          const processedProfile = await processUserProfile(
            user.id,
            user.email,
            user.user_metadata?.name || null
          );
          
          if (processedProfile) {
            console.log(`✅ [AUTH-STATE] Perfil processado: ${processedProfile.name}`);
            setProfile(processedProfile);
          } else {
            console.warn('⚠️ [AUTH-STATE] Não foi possível obter perfil, mas mantendo login');
            // Manter sessão mesmo sem perfil completo
            setProfile(null);
          }
        }
      } catch (profileError) {
        console.error('❌ [AUTH-STATE] Erro ao buscar perfil:', profileError);
        // Não bloquear login por erro de perfil
        setProfile(null);
      }

    } catch (error) {
      console.error('💥 [AUTH-STATE] Erro crítico no setup:', error);
      
      // Em caso de erro crítico, limpar estado
      setSession(null);
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
      console.log('🏁 [AUTH-STATE] Setup concluído');
    }
  }, [setSession, setUser, setProfile, setIsLoading]);

  return {
    setupAuthSession,
  };
};
