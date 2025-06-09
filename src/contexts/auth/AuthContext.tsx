
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
  profile: any | null;
  isLoading: boolean;
  isAdmin: boolean;
  isFormacao: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signInAsMember: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<{ success: boolean; error?: any }>;
  refreshSession: () => Promise<void>;
  setProfile: React.Dispatch<React.SetStateAction<any | null>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
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
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFormacao, setIsFormacao] = useState(false);

  // Função para carregar perfil do usuário
  const loadUserProfile = async (currentUser: User) => {
    try {
      logger.info("Carregando perfil do usuário", {
        component: 'AUTH_CONTEXT',
        userId: currentUser.id.substring(0, 8) + '***'
      });

      // Buscar perfil no banco de dados
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error("Erro ao buscar perfil", {
          component: 'AUTH_CONTEXT',
          error: error.message,
          userId: currentUser.id.substring(0, 8) + '***'
        });
        throw error;
      }

      // Se não encontrou perfil, criar um básico
      if (!profileData) {
        logger.info("Criando perfil básico para usuário", {
          component: 'AUTH_CONTEXT',
          userId: currentUser.id.substring(0, 8) + '***'
        });

        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.user_metadata?.name || currentUser.user_metadata?.full_name,
            role: 'member'
          })
          .select()
          .single();

        if (insertError) {
          logger.error("Erro ao criar perfil", {
            component: 'AUTH_CONTEXT',
            error: insertError.message
          });
          setProfile({ id: currentUser.id, email: currentUser.email, role: 'member' });
          setIsAdmin(false);
          setIsFormacao(false);
          return;
        }

        setProfile(newProfile);
        setIsAdmin(newProfile.role === 'admin');
        setIsFormacao(newProfile.role === 'formacao');
        return;
      }

      // Verificação de admin baseada em email confiável E role no banco
      const trustedEmails = [
        'rafael@viverdeia.ai',
        'admin@viverdeia.ai'
      ];
      
      // Em desenvolvimento, permitir admin@teste.com
      if (process.env.NODE_ENV === 'development') {
        trustedEmails.push('admin@teste.com');
      }

      const isAdminByEmail = trustedEmails.includes(currentUser.email?.toLowerCase() || '');
      const isAdminByRole = profileData.role === 'admin';
      const adminStatus = isAdminByEmail || isAdminByRole;

      // Se é admin por email mas não tem role admin, atualizar
      if (isAdminByEmail && !isAdminByRole) {
        logger.info("Atualizando role de admin por email confiável", {
          component: 'AUTH_CONTEXT',
          email: currentUser.email?.substring(0, 3) + '***'
        });

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', currentUser.id);

        if (!updateError) {
          profileData.role = 'admin';
        }
      }

      setProfile(profileData);
      setIsAdmin(adminStatus);
      setIsFormacao(profileData.role === 'formacao');

      if (adminStatus) {
        logger.info("Usuário admin autenticado", {
          component: 'AUTH_CONTEXT',
          userId: currentUser.id.substring(0, 8) + '***',
          email: currentUser.email?.substring(0, 3) + '***'
        });
      }

    } catch (error) {
      logger.error("Erro ao verificar status de admin", {
        component: 'AUTH_CONTEXT',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      // Em caso de erro, definir perfil básico para não quebrar a aplicação
      setProfile({ 
        id: currentUser.id, 
        email: currentUser.email, 
        role: 'member' 
      });
      setIsAdmin(false);
      setIsFormacao(false);
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
  const signOut = async (): Promise<{ success: boolean; error?: any }> => {
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
        return { success: false, error };
      }

      // Limpeza completa do estado
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsAdmin(false);
      setIsFormacao(false);

      logger.info("Logout realizado com sucesso", {
        component: 'AUTH_CONTEXT'
      });

      return { success: true };

    } catch (error) {
      logger.error("Erro no processo de logout", {
        component: 'AUTH_CONTEXT',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      return { success: false, error };
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
          await loadUserProfile(session.user);
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
          await loadUserProfile(session.user);
        } else {
          setProfile(null);
          setIsAdmin(false);
          setIsFormacao(false);
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
      profile,
      isLoading,
      isAdmin,
      isFormacao,
      signIn,
      signInAsMember,
      signOut,
      refreshSession,
      setProfile,
      setIsLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
