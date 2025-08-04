// Utilitário para debug de autenticação
import { supabase } from '@/lib/supabase';

export const debugAuthState = async () => {
  console.log('🔍 [DEBUG] Verificando estado de auth...');
  
  // 1. Verificar sessão atual
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  console.log('📋 [DEBUG] Sessão atual:', sessionData.session ? 'existe' : 'não existe', sessionError);
  
  if (sessionData.session?.user) {
    // 2. Verificar perfil no banco
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
      .eq('id', sessionData.session.user.id)
      .maybeSingle();
    
    console.log('👤 [DEBUG] Perfil do banco:', {
      existe: !!profileData,
      onboarding_completed: profileData?.onboarding_completed,
      email: profileData?.email,
      role: profileData?.user_roles?.name,
      error: profileError
    });
    
    return {
      session: sessionData.session,
      profile: profileData,
      sessionError,
      profileError
    };
  }
  
  return {
    session: null,
    profile: null,
    sessionError,
    profileError: null
  };
};

// Função para forçar refresh do perfil
export const forceProfileRefresh = async () => {
  const result = await debugAuthState();
  
  if (result.profile && result.session) {
    // Dispara evento customizado para forçar atualização do contexto
    window.dispatchEvent(new CustomEvent('forceProfileRefresh', {
      detail: result.profile
    }));
  }
  
  return result;
};