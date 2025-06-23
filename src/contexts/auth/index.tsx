
import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useAuthMethods } from './hooks/useAuthMethods';
import { toast } from 'sonner';

export interface Profile {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  onboarding_completed?: boolean;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, options?: { inviteToken?: string; userData?: { name?: string } }) => Promise<{ error: any }>;
  signOut: () => Promise<{ success: boolean; error: any }>;
  signInAsMember: (email: string, password: string) => Promise<{ error: any }>;
  signInAsAdmin: (email: string, password: string) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função para carregar perfil do usuário com tratamento robusto de erros
  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      console.log('[AUTH-CONTEXT] Carregando perfil do usuário:', userId);
      
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[AUTH-CONTEXT] Erro ao carregar perfil:', error);
        // Não retornar aqui - vamos criar um perfil básico
      }

      // Se não há perfil ou erro, criar perfil básico baseado no user
      if (!profileData) {
        console.log('[AUTH-CONTEXT] Criando perfil básico para usuário sem perfil');
        const basicProfile: Profile = {
          id: userId,
          email: user?.email || '',
          name: user?.user_metadata?.name || user?.user_metadata?.full_name || '',
          onboarding_completed: false,
          created_at: new Date().toISOString()
        };
        setProfile(basicProfile);
        return;
      }

      console.log('[AUTH-CONTEXT] Perfil carregado com sucesso:', profileData);
      setProfile(profileData);
    } catch (error) {
      console.error('[AUTH-CONTEXT] Erro inesperado ao carregar perfil:', error);
      // Fallback: criar perfil básico
      const fallbackProfile: Profile = {
        id: userId,
        email: user?.email || '',
        name: user?.user_metadata?.name || '',
        onboarding_completed: false
      };
      setProfile(fallbackProfile);
    }
  }, [user]);

  // Função para atualizar perfil
  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await loadUserProfile(user.id);
    }
  }, [user?.id, loadUserProfile]);

  // Hook para métodos de autenticação
  const authMethods = useAuthMethods({ setIsLoading });

  // Função signUp atualizada para processar convites
  const signUp = useCallback(async (
    email: string, 
    password: string, 
    options?: { inviteToken?: string; userData?: { name?: string } }
  ) => {
    try {
      console.log('[AUTH-CONTEXT] Iniciando signup com opções:', !!options?.inviteToken);
      
      // Usar o método atualizado que já processa convites
      const result = await authMethods.signUp(email, password, options);
      
      if (!result.error) {
        console.log('[AUTH-CONTEXT] Signup realizado com sucesso');
        // O perfil será carregado automaticamente pelo listener de auth
      }
      
      return result;
    } catch (error) {
      console.error('[AUTH-CONTEXT] Erro no signup:', error);
      return { error };
    }
  }, [authMethods]);

  // Listener de mudanças de autenticação
  useEffect(() => {
    console.log('[AUTH-CONTEXT] Configurando listener de autenticação');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AUTH-CONTEXT] Evento de auth:', event, !!session);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Carregar perfil após definir o usuário
          setTimeout(() => {
            loadUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AUTH-CONTEXT] Sessão inicial:', !!session);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      console.log('[AUTH-CONTEXT] Limpando listener de autenticação');
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  // Calcular se é admin baseado no perfil
  const isAdmin = profile?.role === 'admin' || false;

  const value: AuthContextType = {
    user,
    profile,
    session,
    isLoading,
    isAdmin,
    signIn: authMethods.signIn,
    signUp,
    signOut: authMethods.signOut,
    signInAsMember: authMethods.signInAsMember,
    signInAsAdmin: authMethods.signInAsAdmin,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
