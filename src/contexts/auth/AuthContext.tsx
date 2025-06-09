
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { auditLogger } from '@/utils/auditLogger';
import { environmentSecurity } from '@/utils/environmentSecurity';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signInAsMember: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Verificar se usuário é admin
  const checkAdminStatus = async (currentUser: User | null) => {
    if (!currentUser) {
      setIsAdmin(false);
      return;
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single();

      const adminStatus = profile?.role === 'admin';
      setIsAdmin(adminStatus);

      if (adminStatus) {
        logger.info("Usuário admin autenticado", {
          component: 'AUTH_CONTEXT',
          userId: currentUser.id.substring(0, 8) + '***'
        });
      }
    } catch (error) {
      logger.error("Erro ao verificar status de admin", {
        component: 'AUTH_CONTEXT',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      setIsAdmin(false);
    }
  };

  // Login
  const signIn = async (email: string, password: string) => {
    try {
      logger.info("Tentativa de login iniciada", {
        component: 'AUTH_CONTEXT',
        email: email.substring(0, 3) + '***'
      });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        await auditLogger.logAuthEvent('login_failure', {
          email: email.substring(0, 3) + '***',
          error: error.message,
          method: 'password'
        });

        logger.warn("Falha no login", {
          component: 'AUTH_CONTEXT',
          email: email.substring(0, 3) + '***',
          error: error.message
        });

        return { error };
      }

      await auditLogger.logAuthEvent('login_success', {
        email: email.substring(0, 3) + '***',
        method: 'password'
      }, data.user?.id);

      logger.info("Login realizado com sucesso", {
        component: 'AUTH_CONTEXT',
        email: email.substring(0, 3) + '***'
      });

      return { error: null };
    } catch (error) {
      logger.error("Erro no processo de login", {
        component: 'AUTH_CONTEXT',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      return { error };
    }
  };

  // Cadastro como membro
  const signInAsMember = async (email: string, password: string) => {
    try {
      logger.info("Tentativa de cadastro iniciada", {
        component: 'AUTH_CONTEXT',
        email: email.substring(0, 3) + '***'
      });

      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        await auditLogger.logAuthEvent('signup_failure', {
          email: email.substring(0, 3) + '***',
          error: error.message,
          method: 'password'
        });

        logger.warn("Falha no cadastro", {
          component: 'AUTH_CONTEXT',
          email: email.substring(0, 3) + '***',
          error: error.message
        });

        return { error };
      }

      await auditLogger.logAuthEvent('signup_success', {
        email: email.substring(0, 3) + '***',
        method: 'password'
      }, data.user?.id);

      logger.info("Cadastro realizado com sucesso", {
        component: 'AUTH_CONTEXT',
        email: email.substring(0, 3) + '***'
      });

      return { error: null };
    } catch (error) {
      logger.error("Erro no processo de cadastro", {
        component: 'AUTH_CONTEXT',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      return { error };
    }
  };

  // Logout
  const signOut = async () => {
    try {
      logger.info("Logout iniciado", {
        component: 'AUTH_CONTEXT',
        userId: user?.id?.substring(0, 8) + '***' || 'unknown'
      });

      if (user) {
        await auditLogger.logAuthEvent('logout', {
          userId: user.id.substring(0, 8) + '***',
          timestamp: new Date().toISOString()
        }, user.id);
      }

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logger.error("Erro no logout", {
          component: 'AUTH_CONTEXT',
          error: error.message
        });
        throw error;
      }

      // Limpeza completa do estado
      setUser(null);
      setSession(null);
      setIsAdmin(false);

      logger.info("Logout realizado com sucesso", {
        component: 'AUTH_CONTEXT'
      });

    } catch (error) {
      logger.error("Erro no processo de logout", {
        component: 'AUTH_CONTEXT',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      toast.error('Erro ao fazer logout');
    }
  };

  // Renovar sessão
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        logger.warn("Erro ao renovar sessão", {
          component: 'AUTH_CONTEXT',
          error: error.message
        });
        throw error;
      }

      logger.info("Sessão renovada com sucesso", {
        component: 'AUTH_CONTEXT'
      });

    } catch (error) {
      logger.error("Falha ao renovar sessão", {
        component: 'AUTH_CONTEXT',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      await signOut();
    }
  };

  // Inicialização e listener de estado
  useEffect(() => {
    // Verificar sessão inicial
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await checkAdminStatus(session.user);
        }
      } catch (error) {
        logger.error("Erro ao obter sessão inicial", {
          component: 'AUTH_CONTEXT',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listener para mudanças de estado
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.info("Mudança de estado de autenticação", {
          component: 'AUTH_CONTEXT',
          event
        });

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await checkAdminStatus(session.user);
        } else {
          setIsAdmin(false);
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Verificação de segurança do ambiente
  useEffect(() => {
    if (!isLoading) {
      environmentSecurity.validateEnvironment();
    }
  }, [isLoading]);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      isAdmin,
      signIn,
      signInAsMember,
      signOut,
      refreshSession
    }}>
      {children}
    </AuthContext.Provider>
  );
};
