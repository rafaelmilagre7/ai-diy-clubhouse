
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { fetchUserProfile, UserProfile } from './utils';
import { perfMonitor, measureAsync } from '@/utils/performanceMonitor';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isFormacao: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Métricas de diagnóstico
  const [initStartTime] = useState(() => performance.now());

  useEffect(() => {
    perfMonitor.startTimer('AuthContext', 'initialization');
    
    let mounted = true;

    const initializeAuth = async () => {
      try {
        perfMonitor.logEvent('AuthContext', 'getting_session');
        
        // 1. Verificar sessão existente
        const { data: { session: currentSession }, error } = await measureAsync(
          'AuthContext',
          'getSession',
          () => supabase.auth.getSession()
        );

        if (error) {
          perfMonitor.logEvent('AuthContext', 'session_error', { error: error.message });
          throw error;
        }

        if (!mounted) return;

        if (currentSession) {
          perfMonitor.logEvent('AuthContext', 'session_found', { userId: currentSession.user.id });
          
          setSession(currentSession);
          setUser(currentSession.user);
          
          // 2. Buscar perfil do usuário
          try {
            const userProfile = await measureAsync(
              'AuthContext',
              'fetchProfile',
              () => fetchUserProfile(currentSession.user.id),
              { userId: currentSession.user.id }
            );
            
            if (mounted && userProfile) {
              setProfile(userProfile);
              perfMonitor.logEvent('AuthContext', 'profile_loaded', { 
                role: userProfile.user_roles?.name,
                email: userProfile.email 
              });
            }
          } catch (profileError) {
            perfMonitor.logEvent('AuthContext', 'profile_error', { 
              error: profileError instanceof Error ? profileError.message : 'Unknown error'
            });
            console.error('Erro ao carregar perfil:', profileError);
          }
        } else {
          perfMonitor.logEvent('AuthContext', 'no_session');
        }

      } catch (error) {
        perfMonitor.logEvent('AuthContext', 'init_error', { 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        console.error('Erro na inicialização do auth:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
          perfMonitor.endTimer('AuthContext', 'initialization', {
            totalTime: performance.now() - initStartTime,
            hasUser: !!user,
            hasProfile: !!profile
          });
        }
      }
    };

    // 3. Configurar listener de mudanças de auth
    perfMonitor.logEvent('AuthContext', 'setting_auth_listener');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        perfMonitor.logEvent('AuthContext', 'auth_state_change', { 
          event,
          hasSession: !!session,
          userId: session?.user?.id 
        });

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user && event === 'SIGNED_IN') {
          // Defer profile loading para evitar deadlocks
          setTimeout(async () => {
            if (!mounted) return;
            
            try {
              const userProfile = await measureAsync(
                'AuthContext',
                'fetchProfile_onSignIn',
                () => fetchUserProfile(session.user.id),
                { userId: session.user.id, event }
              );
              
              if (mounted && userProfile) {
                setProfile(userProfile);
                perfMonitor.logEvent('AuthContext', 'profile_loaded_onSignIn', { 
                  role: userProfile.user_roles?.name 
                });
              }
            } catch (error) {
              perfMonitor.logEvent('AuthContext', 'profile_error_onSignIn', { 
                error: error instanceof Error ? error.message : 'Unknown error'
              });
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          perfMonitor.logEvent('AuthContext', 'signed_out');
        }
      }
    );

    // Inicializar
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
      perfMonitor.logEvent('AuthContext', 'cleanup');
    };
  }, []);

  const signOut = async () => {
    try {
      await measureAsync('AuthContext', 'signOut', () => supabase.auth.signOut());
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (error) {
      perfMonitor.logEvent('AuthContext', 'signOut_error', { 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  };

  const value = {
    user,
    profile,
    session,
    isLoading,
    isAdmin: profile?.user_roles?.name === 'admin',
    isFormacao: profile?.user_roles?.name === 'formacao',
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
