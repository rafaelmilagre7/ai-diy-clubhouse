
import { useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase, UserProfile } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { fetchUserProfile } from "@/contexts/auth/utils/profileUtils";
import { toast } from "@/hooks/use-toast";

/**
 * Hook for handling authentication session management
 */
export const useAuthSession = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const { setSession, setUser, setProfile, setIsLoading } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;

  // Create a minimal profile based on session data
  const createMinimalProfile = (user: User): UserProfile => {
    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || 'Usuário',
      avatar_url: user.user_metadata?.avatar_url || null,
      role: user.email?.endsWith('@viverdeia.ai') ? 'admin' : 'member',
      company_name: null,
      industry: null,
      created_at: new Date().toISOString()
    };
  };

  // Handle profile loading and error handling
  const handleProfileLoading = (user: User) => {
    setTimeout(() => {
      fetchUserProfile(user.id)
        .then(profile => {
          console.log('Profile fetched:', profile);
          
          if (!profile) {
            console.log('Perfil não encontrado, usando perfil mínimo...');
            const minimalProfile = createMinimalProfile(user);
            setProfile(minimalProfile);
          } else {
            setProfile(profile);
          }
          
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error fetching/creating profile:', error);
          
          // Handle specific database policy errors
          if (error?.message?.includes('infinite recursion')) {
            console.warn('Erro de política de banco de dados detectado, continuando com perfil mínimo');
            try {
              const minimalProfile = createMinimalProfile(user);
              setProfile(minimalProfile);
            } catch (createError) {
              console.error('Error creating minimal profile:', createError);
            }
          } else {
            setAuthError(`Erro ao carregar perfil: ${error.message || 'Erro desconhecido'}`);
          }
          
          setIsLoading(false);
        });
    }, 0);
  };

  useEffect(() => {
    console.log('AuthSession: Iniciando setup de autenticação');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        
        // If there's a user, fetch profile
        if (session?.user) {
          handleProfileLoading(session.user);
        } else {
          setProfile(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Sessão existente:', session ? 'Sim' : 'Não');
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id)
          .then(profile => {
            console.log('Profile inicial carregado:', profile);
            
            if (!profile) {
              const minimalProfile = createMinimalProfile(session.user);
              setProfile(minimalProfile);
            } else {
              setProfile(profile);
            }
            
            setIsLoading(false);
            setIsInitializing(false);
          })
          .catch(error => {
            console.error('Erro ao carregar/criar perfil inicial:', error);
            
            if (error?.message?.includes('infinite recursion')) {
              console.warn('Erro de política de banco de dados detectado, continuando com perfil mínimo');
              
              try {
                const minimalProfile = createMinimalProfile(session.user);
                setProfile(minimalProfile);
              } catch (createError) {
                console.error('Error creating minimal profile:', createError);
              }
            } else {
              setAuthError(`Erro ao carregar perfil: ${error.message || 'Erro desconhecido'}`);
            }
            
            setIsLoading(false);
            setIsInitializing(false);
          });
      } else {
        setIsLoading(false);
        setIsInitializing(false);
      }
    });

    return () => {
      console.log('AuthSession: Limpando subscription');
      subscription.unsubscribe();
    };
  }, [setSession, setUser, setProfile, setIsLoading, retryCount]);

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
