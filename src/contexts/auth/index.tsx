
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

  // CORREÇÃO: Verificar admin baseado na role_id do banco
  const isAdmin = React.useMemo(() => {
    if (!profile) return false;
    
    // Verificar se tem role de admin via user_roles
    if (profile.user_roles?.name === 'admin') {
      console.log(`[AUTH] Usuário ${profile.email} identificado como admin via role_id`);
      return true;
    }
    
    // Verificar se tem permissões de admin
    if (profile.user_roles?.permissions?.all === true) {
      console.log(`[AUTH] Usuário ${profile.email} identificado como admin via permissions`);
      return true;
    }
    
    console.log(`[AUTH] Usuário ${profile.email} não é admin`, {
      role_id: profile.role_id,
      user_roles: profile.user_roles
    });
    return false;
  }, [profile]);

  const isFormacao = profile?.user_roles?.name === 'formacao';

  // Função para carregar perfil de forma simplificada
  const loadUserProfile = async (userId: string) => {
    try {
      console.log(`[AUTH] Carregando perfil para usuário: ${userId}`);
      
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

      if (error) {
        console.error('[AUTH] Erro ao carregar perfil:', error);
        throw error;
      }

      if (data) {
        const profileData = {
          ...data as any,
          email: (data as any).email || user?.email || '',
        } as any;
        
        console.log(`[AUTH] Perfil carregado:`, {
          email: profileData.email,
          role_id: profileData.role_id,
          user_roles: profileData.user_roles
        });
        
        setProfile(profileData);
      }
    } catch (error) {
      console.error('[AUTH] Erro ao carregar perfil:', error);
      if (user?.email) {
        // Perfil mínimo para usuários sem dados completos
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
