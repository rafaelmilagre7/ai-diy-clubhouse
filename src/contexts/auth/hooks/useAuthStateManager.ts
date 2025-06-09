
import { useCallback, useRef } from "react";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { processUserProfile } from '@/hooks/auth/utils/authSessionUtils';

export const useAuthStateManager = () => {
  const setupInProgress = useRef(false);
  const lastSetupTimestamp = useRef(0);
  const DEBOUNCE_TIME = 1000; // 1 segundo de debounce
  
  // Safe access to useAuth, use default implementation if not in context
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.error("useAuthStateManager error:", error);
    return { 
      setupAuthSession: async () => ({ success: false, error: new Error("Authentication provider not found") }) 
    };
  }
  
  const {
    setSession,
    setUser,
    setProfile,
    setIsLoading,
  } = authContext;
  
  // Setup auth session function with debounce and race condition protection
  const setupAuthSession = useCallback(async () => {
    const now = Date.now();
    
    // Implementar debounce para evitar múltiplas chamadas
    if (now - lastSetupTimestamp.current < DEBOUNCE_TIME) {
      console.log("🔄 [AUTH] Setup ignorado por debounce");
      return { success: true, error: null };
    }
    
    // Verificar se já está em progresso
    if (setupInProgress.current) {
      console.log("🔄 [AUTH] Setup já em progresso, aguardando...");
      return { success: true, error: null };
    }
    
    try {
      setupInProgress.current = true;
      lastSetupTimestamp.current = now;
      
      console.log("🔄 [AUTH] Iniciando setup da sessão");
      
      // Tentar obter sessão com timeout otimizado
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Session fetch timeout")), 3000) // 3 segundos
      );
      
      let sessionResult;
      try {
        sessionResult = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as { data: { session: any } };
      } catch (timeoutError) {
        console.warn("⚠️ [AUTH] Timeout na busca da sessão, tentando novamente...");
        sessionResult = await supabase.auth.getSession();
      }
      
      const { data: { session } } = sessionResult;
      
      // Validar integridade da sessão
      if (session && (!session.user || !session.access_token)) {
        console.warn("⚠️ [AUTH] Sessão inválida detectada, limpando...");
        setSession(null);
        setUser(null);
        setProfile(null);
        return { success: true, error: null };
      }
      
      setSession(session);
      
      if (session?.user) {
        const userId = session.user.id;
        const userEmail = session.user.email;
        
        console.log(`✅ [AUTH] Sessão válida encontrada: ${userId.substring(0, 8)}***`);
        setUser(session.user);
        
        // Processar perfil com cache melhorado
        try {
          const profile = await processUserProfile(
            userId,
            userEmail,
            session.user.user_metadata?.name
          );
          
          if (profile) {
            console.log(`📊 [AUTH] Perfil carregado: ${profile.role}`);
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
      
      return { success: true, error: null };
      
    } catch (error) {
      console.error("❌ [AUTH] Erro crítico no setup:", error);
      
      // Em caso de erro, limpar estado
      setSession(null);
      setUser(null);
      setProfile(null);
      
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Erro desconhecido de autenticação')
      };
    } finally {
      setupInProgress.current = false;
      setIsLoading(false);
    }
  }, [setSession, setUser, setProfile, setIsLoading]);
  
  return { setupAuthSession };
};
