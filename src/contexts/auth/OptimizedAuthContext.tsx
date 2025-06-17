
import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { toast } from "sonner";

interface OptimizedAuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isFormacao: boolean;
  isLoading: boolean;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  setProfile: (profile: UserProfile | null) => void;
  setIsLoading: (loading: boolean) => void;
}

const OptimizedAuthContext = createContext<OptimizedAuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(OptimizedAuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um OptimizedAuthProvider');
  }
  return context;
};

interface OptimizedAuthProviderProps {
  children: ReactNode;
}

export const OptimizedAuthProvider = ({ children }: OptimizedAuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // OTIMIZAÇÃO: Verificação rápida de admin
  const isAdmin = Boolean(profile?.user_roles?.name === 'admin');
  const isFormacao = Boolean(profile?.user_roles?.name === 'formacao');

  // OTIMIZAÇÃO: Setup ultra-rápido para usuários anônimos
  const quickAuthSetup = useCallback(async () => {
    if (initRef.current) return;
    initRef.current = true;

    try {
      // OTIMIZAÇÃO: Timeout reduzido para 500ms em usuários anônimos
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Quick timeout")), 500)
      );

      const sessionPromise = supabase.auth.getSession();

      let sessionResult;
      try {
        sessionResult = await Promise.race([sessionPromise, timeoutPromise]);
      } catch (timeoutError) {
        // OTIMIZAÇÃO: Se timeout, assumir usuário anônimo
        logger.info('[OPTIMIZED-AUTH] Timeout rápido - assumindo usuário anônimo');
        setSession(null);
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }

      const { data: { session: currentSession }, error } = sessionResult as any;
      
      if (error || !currentSession) {
        // OTIMIZAÇÃO: Usuário anônimo detectado - carregamento instantâneo
        logger.info('[OPTIMIZED-AUTH] Usuário anônimo detectado - carregamento rápido');
        setSession(null);
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }

      // OTIMIZAÇÃO: Só buscar perfil se há usuário
      setSession(currentSession);
      setUser(currentSession.user);

      // OTIMIZAÇÃO: Busca de perfil em background, não bloqueia UI
      setTimeout(async () => {
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select(`
              *,
              user_roles (
                id,
                name,
                description,
                permissions
              )
            `)
            .eq('id', currentSession.user.id)
            .maybeSingle();

          if (profileData) {
            setProfile(profileData as UserProfile);
          }
        } catch (error) {
          logger.warn('[OPTIMIZED-AUTH] Erro ao buscar perfil (não crítico):', error);
        }
      }, 0);

      setIsLoading(false);

    } catch (error) {
      logger.error('[OPTIMIZED-AUTH] Erro no setup rápido:', error);
      setIsLoading(false);
    }
  }, []);

  // OTIMIZAÇÃO: Circuit breaker - máximo 1 segundo de loading
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      if (isLoading) {
        logger.warn('[OPTIMIZED-AUTH] Circuit breaker - forçando fim do loading');
        setIsLoading(false);
      }
    }, 1000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading]);

  // OTIMIZAÇÃO: Setup inicial otimizado
  useEffect(() => {
    quickAuthSetup();
  }, [quickAuthSetup]);

  // OTIMIZAÇÃO: Listener de auth otimizado
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.info(`[OPTIMIZED-AUTH] ${event}`);
        
        if (event === 'SIGNED_OUT' || !session) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsLoading(false);
        } else if (session?.user) {
          setSession(session);
          setUser(session.user);
          setIsLoading(false);
          
          // OTIMIZAÇÃO: Buscar perfil em background
          if (event === 'SIGNED_IN') {
            setTimeout(async () => {
              try {
                const { data: profileData } = await supabase
                  .from('profiles')
                  .select(`
                    *,
                    user_roles (
                      id,
                      name,
                      description,
                      permissions
                    )
                  `)
                  .eq('id', session.user.id)
                  .maybeSingle();

                if (profileData) {
                  setProfile(profileData as UserProfile);
                }
              } catch (error) {
                logger.warn('[OPTIMIZED-AUTH] Erro ao buscar perfil pós-login:', error);
              }
            }, 0);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // OTIMIZAÇÃO: Logout rápido
  const signOut = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
      
      setSession(null);
      setUser(null);
      setProfile(null);
      setIsLoading(false);

      toast.success('Logout realizado com sucesso.');
      window.location.href = '/login';
      return { success: true };

    } catch (error) {
      logger.error('[OPTIMIZED-AUTH] Erro no logout:', error);
      
      // OTIMIZAÇÃO: Forçar limpeza mesmo com erro
      setSession(null);
      setUser(null);
      setProfile(null);
      setIsLoading(false);
      
      window.location.href = '/login';
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }, []);

  const contextValue: OptimizedAuthContextType = {
    user,
    session,
    profile,
    isAdmin,
    isFormacao,
    isLoading,
    signOut,
    setProfile,
    setIsLoading,
  };

  return (
    <OptimizedAuthContext.Provider value={contextValue}>
      {children}
    </OptimizedAuthContext.Provider>
  );
};

export default OptimizedAuthProvider;
