
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, UserProfile, UserRole } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  signInAsMember: () => Promise<void>;
  signInAsAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuários de teste pré-configurados
const TEST_MEMBER = {
  email: "membro@viverdeia.ai",
  password: "membro-teste-2024"
};

const TEST_ADMIN = {
  email: "admin@viverdeia.ai",
  password: "admin-teste-2024"
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Configurar listener de autenticação PRIMEIRO
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Se tiver um usuário, buscar o perfil usando setTimeout para evitar deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setIsLoading(false);
        }
      }
    );

    // DEPOIS verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        setProfile(null);
      } else {
        setProfile(data as UserProfile);
      }
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async () => {
    try {
      // Use a URL atual do navegador como base para o redirecionamento
      const redirectUrl = `${window.location.origin}`;
      console.log('Redirecionando para:', redirectUrl);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error signing in:', error);
      toast({
        title: 'Erro ao fazer login',
        description: 'Ocorreu um erro ao tentar fazer login. Por favor, tente novamente.',
        variant: 'destructive',
      });
    }
  };

  // Função para login como membro de teste
  const signInAsMember = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: TEST_MEMBER.email,
        password: TEST_MEMBER.password
      });
      
      if (error) {
        // Se o usuário não existir, criar uma conta
        if (error.message.includes('Invalid login credentials')) {
          await createTestUser(TEST_MEMBER.email, TEST_MEMBER.password, 'member');
        } else {
          throw error;
        }
      } else {
        toast({
          title: 'Login como Membro',
          description: 'Você está logado como usuário membro de teste.',
        });
      }
    } catch (error: any) {
      console.error('Erro ao fazer login como membro:', error);
      toast({
        title: 'Erro no login',
        description: error?.message || 'Erro ao fazer login como membro de teste.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para login como admin de teste
  const signInAsAdmin = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: TEST_ADMIN.email,
        password: TEST_ADMIN.password
      });
      
      if (error) {
        // Se o usuário não existir, criar uma conta
        if (error.message.includes('Invalid login credentials')) {
          await createTestUser(TEST_ADMIN.email, TEST_ADMIN.password, 'admin');
        } else {
          throw error;
        }
      } else {
        toast({
          title: 'Login como Admin',
          description: 'Você está logado como usuário administrador de teste.',
        });
      }
    } catch (error: any) {
      console.error('Erro ao fazer login como admin:', error);
      toast({
        title: 'Erro no login',
        description: error?.message || 'Erro ao fazer login como administrador de teste.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função auxiliar para criar usuários de teste
  const createTestUser = async (email: string, password: string, role: UserRole) => {
    try {
      // Criar o usuário
      const { data: userData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: role === 'admin' ? 'Administrador Teste' : 'Membro Teste',
            role: role
          }
        }
      });

      if (signUpError) throw signUpError;

      // Login imediato após a criação
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) throw signInError;

      // Verificar se o perfil foi criado automaticamente (via trigger)
      // Se não, vamos criar manualmente
      if (userData.user) {
        setTimeout(async () => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userData.user!.id)
            .single();

          if (!profileData) {
            // Criar perfil manualmente se necessário
            await supabase.from('profiles').insert({
              id: userData.user!.id,
              email: email,
              name: role === 'admin' ? 'Administrador Teste' : 'Membro Teste',
              role: role
            });
          }
        }, 1000);
      }

      toast({
        title: `Usuário ${role} criado`,
        description: `Usuário de teste ${role} criado e logado com sucesso.`,
      });

    } catch (error: any) {
      console.error(`Erro ao criar usuário ${role}:`, error);
      toast({
        title: 'Erro ao criar usuário',
        description: error?.message || `Não foi possível criar o usuário de teste ${role}.`,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Logout realizado',
        description: 'Você foi desconectado com sucesso.',
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Erro ao fazer logout',
        description: 'Ocorreu um erro ao tentar fazer logout. Por favor, tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const value = {
    session,
    user,
    profile,
    isAdmin: profile?.role === 'admin',
    isLoading,
    signIn,
    signOut,
    signInAsMember,
    signInAsAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
