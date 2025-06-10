
import { useCallback, useRef } from "react";
import { supabase } from '@/lib/supabase';
import { processUserProfile } from '@/hooks/auth/utils/authSessionUtils';

interface AuthStateManagerParams {
  setSession: (session: any) => void;
  setUser: (user: any) => void;
  setProfile: (profile: any) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useAuthStateManager = (params?: AuthStateManagerParams) => {
  const setupInProgress = useRef(false);
  const lastSetupTimestamp = useRef(0);
  const DEBOUNCE_TIME = 200; // Reduzido de 1000ms para 200ms
  const MAX_SETUP_TIME = 8000; // 8 segundos máximo
  
  // Se não temos parâmetros, retornar função mock
  if (!params) {
    return { 
      setupAuthSession: async () => ({ 
        success: false, 
        error: new Error("Authentication state manager not properly initialized") 
      }) 
    };
  }
  
  const { setSession, setUser, setProfile, setIsLoading } = params;
  
  const setupAuthSession = useCallback(async () => {
    const now = Date.now();
    
    // Implementar debounce com log
    if (now - lastSetupTimestamp.current < DEBOUNCE_TIME) {
      console.log(`🔄 [AUTH] Setup ignorado por debounce (${now - lastSetupTimestamp.current}ms < ${DEBOUNCE_TIME}ms)`);
      return { success: true, error: null };
    }
    
    // Verificar se já está em progresso
    if (setupInProgress.current) {
      console.log("🔄 [AUTH] Setup já em progresso, aguardando...");
      return { success: true, error: null };
    }
    
    // Timeout absoluto para evitar loading infinito
    const timeoutId = setTimeout(() => {
      console.warn("⚠️ [AUTH] Timeout absoluto atingido, forçando fim do loading");
      setupInProgress.current = false;
      setIsLoading(false);
    }, MAX_SETUP_TIME);
    
    try {
      setupInProgress.current = true;
      lastSetupTimestamp.current = now;
      
      console.log("🔄 [AUTH] Iniciando setup da sessão");
      
      // Tentar obter sessão com timeout
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Session fetch timeout")), 3000)
      );
      
      let sessionResult;
      try {
        sessionResult = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as { data: { session: any } };
      } catch (timeoutError) {
        console.warn("⚠️ [AUTH] Timeout na busca da sessão, tentando sem timeout...");
        sessionResult = await supabase.auth.getSession();
      }
      
      const { data: { session } } = sessionResult;
      
      // Validar integridade da sessão
      if (session && (!session.user || !session.access_token)) {
        console.warn("⚠️ [AUTH] Sessão inválida detectada, limpando...");
        setSession(null);
        setUser(null);
        setProfile(null);
        clearTimeout(timeoutId);
        return { success: true, error: null };
      }
      
      setSession(session);
      
      if (session?.user) {
        const userId = session.user.id;
        const userEmail = session.user.email;
        
        console.log(`✅ [AUTH] Sessão válida encontrada: ${userId.substring(0, 8)}***`);
        setUser(session.user);
        
        // Processar perfil com timeout próprio
        try {
          console.log(`🔍 [AUTH] Iniciando carregamento do perfil para: ${userId.substring(0, 8)}***`);
          
          const profilePromise = processUserProfile(
            userId,
            userEmail,
            session.user.user_metadata?.name
          );
          
          const profileTimeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Profile fetch timeout")), 4000)
          );
          
          const profile = await Promise.race([
            profilePromise,
            profileTimeoutPromise
          ]) as any;
          
          if (profile) {
            console.log(`📊 [AUTH] Perfil carregado com sucesso: role=${profile.role || 'undefined'}`);
            setProfile(profile);
            
            // Atualizar metadados em background (não crítico)
            supabase.auth.updateUser({
              data: { role: profile.role }
            }).catch(error => {
              console.warn("⚠️ [AUTH] Erro ao atualizar metadados:", error.message);
            });
          } else {
            console.warn("⚠️ [AUTH] Perfil não encontrado");
            setProfile(null);
          }
        } catch (profileError) {
          console.error("❌ [AUTH] Erro ao processar perfil:", profileError);
          setProfile(null);
        }
      } else {
        console.log("ℹ️ [AUTH] Nenhuma sessão ativa");
        setUser(null);
        setProfile(null);
      }
      
      clearTimeout(timeoutId);
      return { success: true, error: null };
      
    } catch (error) {
      console.error("❌ [AUTH] Erro crítico no setup:", error);
      
      // Em caso de erro, limpar estado
      setSession(null);
      setUser(null);
      setProfile(null);
      
      clearTimeout(timeoutId);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Erro desconhecido de autenticação')
      };
    } finally {
      setupInProgress.current = false;
      setIsLoading(false);
      console.log("✅ [AUTH] Setup finalizado, isLoading = false");
    }
  }, [setSession, setUser, setProfile, setIsLoading]);
  
  return { setupAuthSession };
};
