
import React, { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '../AuthProvider';
import { toast } from 'sonner';
import { processUserProfile } from '@/hooks/auth/utils/authSessionUtils';
import { isUserAdmin } from '@/utils/auth/adminUtils';

export interface AuthStateManagerProps {
  children: React.ReactNode;
}

export const AuthStateManager: React.FC<AuthStateManagerProps> = ({ children }) => {
  const {
    setSession,
    setUser,
    setProfile,
    setIsLoading,
    setIsAdmin
  } = useAuth();

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
        
        if (session?.user) {
          console.log("Sessão encontrada, informações do usuário:", {
            id: session.user.id,
            email: session.user.email,
            metadata: session.user.user_metadata
          });
          
          setUser(session.user);
          
          // Verificação rápida de admin baseada apenas no email
          const quickAdminCheck = isUserAdmin(session.user, null);
          console.log("Verificação rápida de admin:", quickAdminCheck);
          setIsAdmin(quickAdminCheck);
          
          // Process user profile 
          try {
            console.log("Buscando perfil do usuário:", session.user.id);
            const userProfile = await processUserProfile(session.user);
            
            if (userProfile) {
              console.log("Perfil encontrado:", userProfile);
              setProfile(userProfile);
              
              // Verificação final de admin com perfil completo
              const finalAdminCheck = isUserAdmin(session.user, userProfile);
              console.log("Verificação final de admin com perfil:", finalAdminCheck);
              setIsAdmin(finalAdminCheck);
            } else {
              console.warn("Não foi possível obter perfil para usuário autenticado");
              // Manter verificação baseada apenas no email
            }
          } catch (profileError) {
            console.error("Erro ao processar perfil:", profileError);
            // Falha silenciosa, manter verificação baseada apenas no email
          }
        } else {
          console.log("Nenhuma sessão ativa encontrada");
          setUser(null);
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
          return;
        }
        
        setSession(session);
        
        if (session?.user) {
          console.log("Usuário autenticado:", {
            id: session.user.id,
            email: session.user.email,
            event: event
          });
          
          setUser(session.user);
          
          // Verificação rápida de admin baseada apenas no email
          const quickAdminCheck = isUserAdmin(session.user, null);
          console.log("Verificação rápida de admin:", quickAdminCheck);
          setIsAdmin(quickAdminCheck);
          
          // React a eventos específicos
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            // Usar setTimeout para evitar possíveis deadlocks
            setTimeout(async () => {
              try {
                console.log("Buscando perfil após evento de autenticação:", session.user!.id);
                const userProfile = await processUserProfile(session.user!);
                
                if (userProfile) {
                  console.log("Perfil encontrado após evento:", userProfile);
                  setProfile(userProfile);
                  
                  // Verificação final de admin com perfil completo
                  const finalAdminCheck = isUserAdmin(session.user!, userProfile);
                  console.log("Verificação final de admin com perfil:", finalAdminCheck);
                  setIsAdmin(finalAdminCheck);
                } else {
                  console.warn("Não foi possível obter perfil após evento de autenticação");
                  // Manter verificação baseada apenas no email
                }
              } catch (error) {
                console.error("Erro ao processar perfil após evento de autenticação:", error);
              }
            }, 0);
          }
        } else {
          setUser(null);
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
