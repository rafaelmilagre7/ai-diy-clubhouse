import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';
import { useAuthMethods } from './hooks/useAuthMethods';

const AuthContext = createContext<{
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isFormacao: boolean;
  isLoading: boolean;
  authError: Error | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ success: boolean; error: any }>;
  signInAsMember: (email: string, password: string) => Promise<{ error: any }>;
  signInAsAdmin: (email: string, password: string) => Promise<{ error: any }>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setIsLoading: (loading: boolean) => void;
} | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);

  const { signIn, signOut, signInAsMember, signInAsAdmin } = useAuthMethods({
    setIsLoading,
  });

  // Verificação simplificada de admin apenas por email
  const adminEmails = [
    'rafael@viverdeia.ai',
    'admin@viverdeia.ai',
    'admin@teste.com'
  ];

  const isAdmin = user?.email ? adminEmails.includes(user.email.toLowerCase()) : false;
  const isFormacao = profile?.user_roles?.name === 'formacao';

  // Função para carregar perfil de forma simplificada
  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles:role_id (
            id,
            name,
            description,
            permissions,
            is_system
          )
        `)
        .eq('id', userId as any)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          ...data,
          email: (data as any).email || user?.email || '',
        } as any);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      if (user?.email) {
        setProfile({
          id: userId,
          email: user.email,
          name: null,
          avatar_url: null,
          company_name: null,
          industry: null,
          role_id: null,
          role: 'member' as any,
          created_at: new Date().toISOString(),
          onboarding_completed: false,
          onboarding_completed_at: null,
        } as any);
      }
    }
  };

  // Inicialização simplificada
  useEffect(() => {
    console.log('[AUTH] Inicializando autenticação');
    
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // 1. Buscar sessão atual
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AUTH] Erro ao buscar sessão:', error);
          setAuthError(error);
        }

        if (!mounted) return;

        // 2. Atualizar estados da sessão
        setSession(session);
        setUser(session?.user || null);

        // 3. Se há usuário, carregar perfil
        if (session?.user) {
          await loadUserProfile(session.user.id);
        }

        // 4. Marcar como carregado apenas no final
        if (mounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('[AUTH] Erro na inicialização:', error);
        if (mounted) {
          setAuthError(error as Error);
          setIsLoading(false);
        }
      }
    };

    // Configurar listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`[AUTH] Evento: ${event}`);
        
        if (!mounted) return;

        setSession(session);
        setUser(session?.user || null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Defer para evitar deadlocks
          setTimeout(() => {
            if (mounted) {
              loadUserProfile(session.user.id);
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setAuthError(null);
        }
      }
    );

    // Inicializar
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    session,
    profile,
    isAdmin,
    isFormacao,
    isLoading,
    authError,
    signIn,
    signOut,
    signInAsMember,
    signInAsAdmin,
    setUser,
    setSession,
    setProfile,
    setIsLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
