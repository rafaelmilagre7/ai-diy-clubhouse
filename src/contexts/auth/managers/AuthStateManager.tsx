
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
        console.log("AuthStateManager: Inicializando estado de autenticação");
        
        // Buscar sessão atual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Erro ao buscar sessão:", sessionError.message);
          setIsLoading(false);
          return;
        }
        
        console.log("Sessão atual:", session ? "Disponível" : "Não disponível");
        setSession(session);
        setUser(session?.user ?? null);
        
        // Se tiver um usuário, buscar o perfil
        if (session?.user) {
          console.log("Sessão encontrada, buscando perfil para:", session.user.id);

          // Primeiro tenta buscar pelo id diretamente
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
            
          if (profileError && profileError.code !== 'PGRST116') {
            console.error("Erro ao buscar perfil pelo id:", profileError.message, profileError.code);
            
            // Tentar buscar por user_id como alternativa
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
              console.warn("Nenhum perfil encontrado, verificando pelo email:", session.user.email);
              const isAdmin = 
                session.user.email?.includes('@viverdeia.ai') ||
                session.user.email === 'admin@teste.com';
              
              setIsAdmin(isAdmin);
              
              // Tentar criar um perfil básico
              try {
                const { data: newProfile, error: createError } = await supabase
                  .from("profiles")
                  .insert({
                    id: session.user.id,
                    name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário',
                    email: session.user.email,
                    role: isAdmin ? 'admin' : 'member'
                  })
                  .select()
                  .single();
                  
                if (createError) {
                  console.error("Erro ao criar perfil:", createError);
                } else if (newProfile) {
                  console.log("Perfil criado automaticamente:", newProfile);
                  setProfile(newProfile);
                }
              } catch (createProfileError) {
                console.error("Erro ao criar perfil:", createProfileError);
              }
            }
          } else if (profileData) {
            console.log("Perfil encontrado pelo id:", profileData);
            setProfile(profileData);
            
            // Verificar se é admin
            const isAdmin = 
              profileData.role === 'admin' || 
              session.user.email?.includes('@viverdeia.ai') ||
              session.user.email === 'admin@teste.com';
              
            console.log("Status de admin:", isAdmin);
            setIsAdmin(isAdmin);
          }
        } else {
          console.log("Nenhuma sessão ativa encontrada");
          setProfile(null);
          setIsAdmin(false);
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
        
        if (event === 'SIGNED_OUT') {
          console.log("Usuário deslogou, limpando estado");
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
          
          // Limpar tokens locais para garantir logout completo
          localStorage.removeItem('sb-zotzvtepvpnkcoobdubt-auth-token');
          localStorage.removeItem('supabase.auth.token');
          
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // React a eventos específicos
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            console.log("Usuário autenticado:", session.user.email);
            
            // Usar setTimeout para evitar possíveis deadlocks
            setTimeout(async () => {
              try {
                // Primeiro tenta buscar pelo id
                const { data: profileData, error: profileError } = await supabase
                  .from("profiles")
                  .select("*")
                  .eq("id", session.user!.id)
                  .single();
                  
                if (profileError && profileError.code !== 'PGRST116') {
                  console.error("Erro ao buscar perfil após login:", profileError.message);
                  
                  // Tentar buscar por user_id como alternativa
                  const { data: profileByUserIdData, error: profileByUserIdError } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("user_id", session.user!.id)
                    .single();
                    
                  if (!profileByUserIdError && profileByUserIdData) {
                    console.log("Perfil encontrado por user_id após login:", profileByUserIdData);
                    setProfile(profileByUserIdData);
                    
                    // Verificar se é admin
                    const isAdmin = 
                      profileByUserIdData.role === 'admin' || 
                      session.user!.email?.includes('@viverdeia.ai') ||
                      session.user!.email === 'admin@teste.com';
                      
                    console.log("Status de admin:", isAdmin);
                    setIsAdmin(isAdmin);
                  } else {
                    // Se não encontrou perfil, verificar diretamente pelo email
                    console.warn("Nenhum perfil encontrado após login, verificando pelo email");
                    const isAdmin = 
                      session.user!.email?.includes('@viverdeia.ai') ||
                      session.user!.email === 'admin@teste.com';
                    
                    setIsAdmin(isAdmin);
                    
                    // Tentar criar um perfil básico
                    try {
                      const { data: newProfile, error: createError } = await supabase
                        .from("profiles")
                        .insert({
                          id: session.user!.id,
                          name: session.user!.user_metadata?.name || session.user!.email?.split('@')[0] || 'Usuário',
                          email: session.user!.email,
                          role: isAdmin ? 'admin' : 'member'
                        })
                        .select()
                        .single();
                        
                      if (!createError && newProfile) {
                        console.log("Perfil criado automaticamente após login:", newProfile);
                        setProfile(newProfile);
                      }
                    } catch (createProfileError) {
                      console.error("Erro ao criar perfil após login:", createProfileError);
                    }
                  }
                } else if (profileData) {
                  console.log("Perfil encontrado após login:", profileData);
                  setProfile(profileData);
                  
                  // Verificar se é admin
                  const isAdmin = 
                    profileData.role === 'admin' || 
                    session.user!.email?.includes('@viverdeia.ai') ||
                    session.user!.email === 'admin@teste.com';
                    
                  console.log("Status de admin:", isAdmin);
                  setIsAdmin(isAdmin);
                }
              } catch (error) {
                console.error("Erro ao processar perfil após evento de autenticação:", error);
              }
            }, 0);
          }
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
