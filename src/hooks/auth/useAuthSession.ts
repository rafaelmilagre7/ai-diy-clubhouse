
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { fetchUserProfile, createUserProfileIfNeeded } from "@/contexts/auth/utils/profileUtils";

export const useAuthSession = () => {
  const {
    setSession,
    setUser,
    setProfile,
    setIsLoading,
  } = useAuth();
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    if (retryCount > maxRetries) {
      console.error(`Atingido limite máximo de ${maxRetries} tentativas de autenticação`);
      setIsInitializing(false);
      return;
    }

    const setupSession = async () => {
      try {
        console.log("Inicializando sessão de autenticação...");
        
        // Verificar sessão atual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        setSession(session);
        
        if (session) {
          console.log("Sessão ativa encontrada:", session.user.id);
          setUser(session.user);
          
          try {
            // Tentar buscar o perfil do usuário
            let profile = await fetchUserProfile(session.user.id);
            
            // Se não existir perfil ou ocorrer erro de política, criar um novo
            if (!profile) {
              console.log("Criando novo perfil para usuário:", session.user.id);
              profile = await createUserProfileIfNeeded(
                session.user.id, 
                session.user.email || 'sem-email@viverdeia.ai',
                session.user.user_metadata?.name || 'Usuário'
              );
            }
            
            setProfile(profile);
          } catch (profileError) {
            // Apenas log, não falha completamente
            console.error("Erro ao buscar/criar perfil:", profileError);
            
            // Como fallback, crie um perfil temporário na memória
            const tempProfile = {
              id: session.user.id,
              email: session.user.email || 'sem-email@viverdeia.ai',
              name: session.user.user_metadata?.name || 'Usuário',
              role: session.user.email?.includes('admin') ? 'admin' : 'member',
              avatar_url: null,
              company_name: null,
              industry: null,
              created_at: new Date().toISOString()
            };
            
            setProfile(tempProfile);
          }
        } else {
          console.log("Nenhuma sessão ativa encontrada");
        }
        
        // Configurar listener para mudanças de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log("Evento de autenticação:", event);
            
            setSession(newSession);
            setUser(newSession?.user || null);
            
            if (newSession?.user) {
              try {
                // Tentar buscar ou criar perfil ao mudar de estado
                let profile = await fetchUserProfile(newSession.user.id);
                
                if (!profile) {
                  profile = await createUserProfileIfNeeded(
                    newSession.user.id,
                    newSession.user.email || 'sem-email@viverdeia.ai',
                    newSession.user.user_metadata?.name || 'Usuário'
                  );
                }
                
                setProfile(profile);
              } catch (profileError) {
                console.error("Erro ao buscar/criar perfil:", profileError);
                
                // Criar perfil temporário na memória
                const tempProfile = {
                  id: newSession.user.id,
                  email: newSession.user.email || 'sem-email@viverdeia.ai',
                  name: newSession.user.user_metadata?.name || 'Usuário',
                  role: newSession.user.email?.includes('admin') ? 'admin' : 'member',
                  avatar_url: null,
                  company_name: null,
                  industry: null,
                  created_at: new Date().toISOString()
                };
                
                setProfile(tempProfile);
              }
            } else {
              setProfile(null);
            }
          }
        );
        
        // Limpar estados de erro e carregamento
        setAuthError(null);
        setIsInitializing(false);
        setIsLoading(false);
        
        // Cleanup
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Erro durante inicialização da sessão:", error);
        setAuthError(error instanceof Error ? error : new Error('Erro desconhecido de autenticação'));
        setRetryCount(count => count + 1);
        setIsInitializing(false);
        setIsLoading(false);
      }
    };
    
    setupSession();
  }, [retryCount, setSession, setUser, setProfile, setIsLoading, maxRetries]);

  return {
    isInitializing,
    authError,
    retryCount,
    maxRetries,
    setRetryCount,
    setIsInitializing,
    setAuthError
  };
};
