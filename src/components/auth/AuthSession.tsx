
import { useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase, UserProfile } from "@/lib/supabase";
import { fetchUserProfile, createUserProfileIfNeeded } from "@/contexts/auth/utils/profileUtils";
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
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;

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
                
                // If the profile fetch fails with a specific database error, 
                // we'll treat it as a graceful failure - the user is authenticated but profile data is unavailable
                if (!profile) {
                  console.log('Perfil não encontrado, tentando criar...');
                  
                  // Try to create a profile based on session data
                  try {
                    // Create a minimal profile based on session data
                    const minimalProfile: UserProfile = {
                      id: session.user.id,
                      email: session.user.email || '',
                      name: session.user.user_metadata?.name || 'Usuário',
                      avatar_url: session.user.user_metadata?.avatar_url || null,
                      role: session.user.email?.endsWith('@viverdeia.ai') ? 'admin' : 'member',
                      company_name: null,
                      industry: null,
                      created_at: new Date().toISOString()
                    };
                    
                    setProfile(minimalProfile);
                    setIsLoading(false);
                    return minimalProfile;
                  } catch (error) {
                    console.error('Error creating minimal profile:', error);
                    setIsLoading(false);
                    return null;
                  }
                }
                
                setProfile(profile);
                setIsLoading(false);
                return profile;
              })
              .catch(error => {
                console.error('Error fetching/creating profile:', error);
                
                // Check if it's a database policy error
                if (error?.message?.includes('infinite recursion')) {
                  console.warn('Erro de política de banco de dados detectado, continuando com perfil mínimo');
                  
                  // Create a minimal profile based on session data
                  try {
                    const minimalProfile: UserProfile = {
                      id: session.user.id,
                      email: session.user.email || '',
                      name: session.user.user_metadata?.name || 'Usuário',
                      avatar_url: session.user.user_metadata?.avatar_url || null,
                      role: session.user.email?.endsWith('@viverdeia.ai') ? 'admin' : 'member',
                      company_name: null,
                      industry: null,
                      created_at: new Date().toISOString()
                    };
                    
                    setProfile(minimalProfile);
                    setIsLoading(false);
                  } catch (createError) {
                    console.error('Error creating minimal profile:', createError);
                  }
                } else {
                  setAuthError(`Erro ao carregar perfil: ${error.message || 'Erro desconhecido'}`);
                }
                
                // Still set isLoading to false to continue the app flow
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
            
            // Se o perfil não existe, tentamos criar um perfil mínimo baseado nos dados da sessão
            if (!profile) {
              // Create a minimal profile based on session data
              const minimalProfile: UserProfile = {
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.name || 'Usuário',
                avatar_url: session.user.user_metadata?.avatar_url || null,
                role: session.user.email?.endsWith('@viverdeia.ai') ? 'admin' : 'member',
                company_name: null,
                industry: null,
                created_at: new Date().toISOString()
              };
              
              setProfile(minimalProfile);
              setIsLoading(false);
              setIsInitializing(false);
              
              return minimalProfile;
            }
            
            setProfile(profile);
            setIsLoading(false);
            setIsInitializing(false);
            
            return profile;
          })
          .catch(error => {
            console.error('Erro ao carregar/criar perfil inicial:', error);
            
            // Check if it's a database policy error
            if (error?.message?.includes('infinite recursion')) {
              console.warn('Erro de política de banco de dados detectado, continuando com perfil mínimo');
              
              // Create a minimal profile based on session data
              try {
                const minimalProfile: UserProfile = {
                  id: session.user.id,
                  email: session.user.email || '',
                  name: session.user.user_metadata?.name || 'Usuário',
                  avatar_url: session.user.user_metadata?.avatar_url || null,
                  role: session.user.email?.endsWith('@viverdeia.ai') ? 'admin' : 'member',
                  company_name: null,
                  industry: null,
                  created_at: new Date().toISOString()
                };
                
                setProfile(minimalProfile);
              } catch (createError) {
                console.error('Error creating minimal profile:', createError);
              }
            } else {
              setAuthError(`Erro ao carregar perfil: ${error.message || 'Erro desconhecido'}`);
            }
            
            // Still continue the app flow
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

  // Add a logout button if there's an initialization error
  if (authError && !isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-destructive/10 border border-destructive p-6 rounded-lg max-w-md">
          <h2 className="text-xl font-bold text-destructive mb-2">Erro de Autenticação</h2>
          <p className="mb-4">{authError}</p>
          <p className="mb-4">Houve um problema ao carregar seu perfil. Por favor, tente fazer login novamente.</p>
          <Button 
            variant="default"
            onClick={() => {
              localStorage.removeItem('supabase.auth.token');
              window.location.href = '/login';
            }}
          >
            Voltar para login
          </Button>
          
          {retryCount < maxRetries && (
            <Button 
              variant="outline"
              className="ml-2"
              onClick={() => {
                setRetryCount(count => count + 1);
                setIsInitializing(true);
                setAuthError(null);
              }}
            >
              Tentar novamente ({maxRetries - retryCount} tentativas restantes)
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (isInitializing) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
};

export default AuthSession;
