
import { useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase, UserProfile } from "@/lib/supabase";
import { fetchUserProfile } from "@/contexts/auth/utils/profileUtils";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { toast } from "@/hooks/use-toast";

/**
 * AuthSession component that handles authentication state changes
 * and provides a loading screen during authentication
 */
const AuthSession = ({ children }: { children: React.ReactNode }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const { setSession, setUser, setProfile, setIsLoading } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Configuração de log de debug
    console.log('AuthSession: Iniciando setup de autenticação');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        
        // If there's a user, fetch profile using setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id)
              .then(profile => {
                console.log('Profile fetched:', profile);
                setProfile(profile);
                setIsLoading(false);
                
                if (!profile) {
                  console.warn('Perfil não encontrado para usuário autenticado');
                  toast({
                    title: 'Aviso',
                    description: 'Perfil de usuário não encontrado. Algumas funcionalidades podem estar limitadas.',
                    variant: 'default',
                  });
                }
              })
              .catch(error => {
                console.error('Error fetching profile:', error);
                setAuthError(`Erro ao carregar perfil: ${error.message || 'Erro desconhecido'}`);
                // Ainda definimos isLoading como false mesmo com erro
                setIsLoading(false);
              });
          }, 0);
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
            setProfile(profile);
            setIsLoading(false);
            setIsInitializing(false);
            
            if (!profile) {
              console.warn('Perfil inicial não encontrado para usuário autenticado');
              toast({
                title: 'Aviso',
                description: 'Perfil de usuário não encontrado. Algumas funcionalidades podem estar limitadas.',
                variant: 'default',
              });
            }
          })
          .catch(error => {
            console.error('Erro ao carregar perfil inicial:', error);
            setAuthError(`Erro ao carregar perfil: ${error.message || 'Erro desconhecido'}`);
            // Continuamos mesmo com erro
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
  }, [setSession, setUser, setProfile, setIsLoading]);

  if (isInitializing) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
};

export default AuthSession;
