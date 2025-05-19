
import React, { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '../AuthProvider';
import { toast } from 'sonner';

export interface AuthStateManagerProps {
  children: React.ReactNode;
}

export const AuthStateManager: React.FC<AuthStateManagerProps> = ({ children }) => {
  const { setUser, setSession, setProfile, setIsLoading, setIsAdmin } = useAuth();

  // Inicializar estado de autenticação ao montar o componente
  useEffect(() => {
    // Verificar sessão atual
    const initAuth = async () => {
      try {
        setIsLoading(true);
        
        // Buscar sessão atual
        const { data: { session } } = await supabase.auth.getSession();
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Se tiver um usuário, buscar o perfil
        if (session?.user) {
          console.log("Sessão encontrada, buscando perfil para:", session.user.id);

          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
            
          if (profileError) {
            console.error("Erro ao buscar perfil:", profileError.message);
            // Tentar buscar por user_id como alternativa (caso o ID não seja o mesmo que user_id)
            const { data: profileByUserIdData, error: profileByUserIdError } = await supabase
              .from("profiles")
              .select("*")
              .eq("user_id", session.user.id)
              .single();
              
            if (!profileByUserIdError && profileByUserIdData) {
              console.log("Perfil encontrado por user_id:", profileByUserIdData);
              setProfile(profileByUserIdData);
              
              // Verificar se é admin
              const isAdmin = 
                profileByUserIdData.role === 'admin' || 
                session.user.email?.includes('@viverdeia.ai') ||
                session.user.email === 'admin@teste.com';
                
              console.log("Status de admin:", isAdmin);
              setIsAdmin(isAdmin);
            } else {
              // Se não encontrou perfil, verificar diretamente pelo email
              console.warn("Nenhum perfil encontrado, verificando pelo email");
              const isAdmin = 
                session.user.email?.includes('@viverdeia.ai') ||
                session.user.email === 'admin@teste.com';
              
              setIsAdmin(isAdmin);
            }
          } else if (profileData) {
            console.log("Perfil encontrado:", profileData);
            setProfile(profileData);
            
            // Verificar se é admin
            const isAdmin = 
              profileData.role === 'admin' || 
              session.user.email?.includes('@viverdeia.ai') ||
              session.user.email === 'admin@teste.com';
              
            console.log("Status de admin:", isAdmin);
            setIsAdmin(isAdmin);
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        toast.error('Não foi possível verificar sua sessão. Tente recarregar a página.');
      } finally {
        setIsLoading(false);
      }
    };

    // Configurar monitoramento de mudanças de estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Evento de autenticação:', event);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // React a eventos específicos
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            // Usar setTimeout para evitar possíveis deadlocks
            setTimeout(async () => {
              try {
                const { data: profileData, error: profileError } = await supabase
                  .from("profiles")
                  .select("*")
                  .eq("id", session.user!.id)
                  .single();
                  
                if (profileError) {
                  console.error("Erro ao buscar perfil após login:", profileError.message);
                  // Tentar buscar por user_id como alternativa
                  const { data: profileByUserIdData, error: profileByUserIdError } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("user_id", session.user!.id)
                    .single();
                    
                  if (!profileByUserIdError && profileByUserIdData) {
                    setProfile(profileByUserIdData);
                    
                    // Verificar se é admin
                    const isAdmin = 
                      profileByUserIdData.role === 'admin' || 
                      session.user!.email?.includes('@viverdeia.ai') ||
                      session.user!.email === 'admin@teste.com';
                      
                    setIsAdmin(isAdmin);
                  } else {
                    // Se não encontrou perfil, verificar diretamente pelo email
                    const isAdmin = 
                      session.user!.email?.includes('@viverdeia.ai') ||
                      session.user!.email === 'admin@teste.com';
                    
                    setIsAdmin(isAdmin);
                  }
                } else if (profileData) {
                  setProfile(profileData);
                  
                  // Verificar se é admin
                  const isAdmin = 
                    profileData.role === 'admin' || 
                    session.user!.email?.includes('@viverdeia.ai') ||
                    session.user!.email === 'admin@teste.com';
                    
                  setIsAdmin(isAdmin);
                }
              } catch (error) {
                console.error("Erro ao processar perfil após evento de autenticação:", error);
              }
            }, 0);
          }
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setIsAdmin(false);
        }
      }
    );

    // Inicializar autenticação
    initAuth();

    // Limpar subscription ao desmontar
    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setSession, setProfile, setIsLoading, setIsAdmin]);

  return <>{children}</>;
};
