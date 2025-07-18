
import { useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { clearProfileCache } from '@/hooks/auth/utils/authSessionUtils';
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
    logger.info('[AUTH-STATE] 🔧 Setup de sessão iniciado');
    
    try {
      setIsLoading(true);

      // Verificar sessão atual de forma direta
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
        return;
      }

      const user = session.user;
      logger.info(`[AUTH-STATE] 👤 Sessão válida encontrada: ${user.email}`);

      // Configurar sessão e usuário imediatamente
      setSession(session);
      setUser(user);

      // Buscar perfil de forma simples e direta
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

      if (profileError || !profileData) {
        logger.error('[AUTH-STATE] ❌ Erro ao buscar perfil:', profileError);
        
        // Se for erro de "not found", é um caso especial
        if (profileError?.code === 'PGRST116') {
          throw new Error(`Usuário ${user.email} não possui perfil. Contate o administrador.`);
        }
        
        throw profileError || new Error('Perfil não encontrado');
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
      logger.info(`[AUTH-STATE] ✅ Setup completo - Usuário: ${user.email} | Role: ${roleName}`);

    } catch (mainError) {
      logger.error('[AUTH-STATE] 💥 ERRO CRÍTICO no setup:', mainError);
      
      // RESET COMPLETO em caso de erro
      setSession(null);
      setUser(null);
      setProfile(null);
      clearProfileCache();
      
      throw mainError;
      
    } finally {
      setIsLoading(false);
      logger.info('[AUTH-STATE] 🏁 Setup finalizado (loading = false)');
    }
  }, [setSession, setUser, setProfile, setIsLoading]);

  return { setupAuthSession };
};
