
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { fetchUserProfile, createUserProfileIfNeeded } from "@/contexts/auth/utils/profileUtils";
import { UserRole } from "@/lib/supabase";

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
            console.log("Buscando perfil para usuário:", session.user.id);
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
            
            console.log("Perfil carregado com papel:", profile?.role);
            
            // Verificação adicional da role - se for admin@teste.com, garantir que a role seja admin
            if (profile && session.user.email) {
              const shouldBeAdmin = session.user.email === 'admin@teste.com' || 
                                   session.user.email === 'admin@viverdeia.ai' || 
                                   session.user.email?.endsWith('@viverdeia.ai');
                                   
              if (shouldBeAdmin && profile.role !== 'admin') {
                console.log("Corrigindo papel para admin, estava como:", profile.role);
                profile.role = 'admin';
              }
              
              const shouldBeMember = session.user.email === 'membro@teste.com' || 
                                   (!session.user.email.endsWith('@viverdeia.ai') &&
                                    session.user.email !== 'admin@teste.com' &&
                                    session.user.email !== 'admin@viverdeia.ai');
                                   
              if (shouldBeMember && profile.role !== 'member') {
                console.log("Corrigindo papel para member, estava como:", profile.role);
                profile.role = 'member';
              }
            }
            
            setProfile(profile);
            console.log("Perfil final carregado com papel:", profile?.role);
          } catch (profileError) {
            // Apenas log, não falha completamente
            console.error("Erro ao buscar/criar perfil:", profileError);
            
            // Como fallback, crie um perfil temporário na memória
            let userRole: UserRole = 'member';
            
            if (session.user.email) {
              const isAdminEmail = session.user.email === 'admin@teste.com' || 
                                  session.user.email === 'admin@viverdeia.ai' || 
                                  session.user.email?.endsWith('@viverdeia.ai');
                                  
              userRole = isAdminEmail ? 'admin' : 'member';
            }
            
            console.log("Criando perfil temporário com role:", userRole);
            
            const tempProfile = {
              id: session.user.id,
              email: session.user.email || 'sem-email@viverdeia.ai',
              name: session.user.user_metadata?.name || 'Usuário',
              role: userRole,
              avatar_url: null,
              company_name: null,
              industry: null,
              created_at: new Date().toISOString()
            };
            
            setProfile(tempProfile);
            console.log("Perfil temporário criado com papel:", tempProfile.role);
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
                console.log("Buscando perfil para usuário após evento auth:", newSession.user.id);
                let profile = await fetchUserProfile(newSession.user.id);
                
                if (!profile) {
                  profile = await createUserProfileIfNeeded(
                    newSession.user.id,
                    newSession.user.email || 'sem-email@viverdeia.ai',
                    newSession.user.user_metadata?.name || 'Usuário'
                  );
                }
                
                console.log("Perfil carregado após evento de auth com papel:", profile?.role);
                
                // Verificação adicional da role após evento de autenticação
                if (profile && newSession.user.email) {
                  const shouldBeAdmin = newSession.user.email === 'admin@teste.com' || 
                                       newSession.user.email === 'admin@viverdeia.ai' || 
                                       newSession.user.email?.endsWith('@viverdeia.ai');
                                       
                  if (shouldBeAdmin && profile.role !== 'admin') {
                    console.log("Corrigindo papel para admin após evento, estava como:", profile.role);
                    profile.role = 'admin';
                  }
                  
                  const shouldBeMember = newSession.user.email === 'membro@teste.com' || 
                                       (!newSession.user.email.endsWith('@viverdeia.ai') &&
                                        newSession.user.email !== 'admin@teste.com' &&
                                        newSession.user.email !== 'admin@viverdeia.ai');
                                       
                  if (shouldBeMember && profile.role !== 'member') {
                    console.log("Corrigindo papel para member após evento, estava como:", profile.role);
                    profile.role = 'member';
                  }
                }
                
                setProfile(profile);
                console.log("Perfil final após evento com papel:", profile?.role);
              } catch (profileError) {
                console.error("Erro ao buscar/criar perfil após evento:", profileError);
                
                let userRole: UserRole = 'member';
                
                if (newSession.user.email) {
                  const isAdminEmail = newSession.user.email === 'admin@teste.com' || 
                                      newSession.user.email === 'admin@viverdeia.ai' || 
                                      newSession.user.email?.endsWith('@viverdeia.ai');
                                      
                  userRole = isAdminEmail ? 'admin' : 'member';
                }
                
                console.log("Criando perfil temporário com role após evento:", userRole);
                
                // Criar perfil temporário na memória
                const tempProfile = {
                  id: newSession.user.id,
                  email: newSession.user.email || 'sem-email@viverdeia.ai',
                  name: newSession.user.user_metadata?.name || 'Usuário',
                  role: userRole,
                  avatar_url: null,
                  company_name: null,
                  industry: null,
                  created_at: new Date().toISOString()
                };
                
                setProfile(tempProfile);
                console.log("Perfil temporário após evento com papel:", tempProfile.role);
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
