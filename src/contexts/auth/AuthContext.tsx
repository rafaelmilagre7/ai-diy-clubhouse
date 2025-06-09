
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
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

  // Função com timeout para operações de banco
  const withTimeout = async <T,>(
    promise: Promise<T>,
    timeoutMs: number = 3000,
    errorMessage: string = 'Operação excedeu tempo limite'
  ): Promise<T> => {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
    });
    
    return Promise.race([promise, timeoutPromise]);
  };

  // Função otimizada para carregar perfil com timeout
  const loadUserProfile = async (currentUser: User) => {
    try {
      console.log('[AUTH] Carregando perfil do usuário:', currentUser.id);
      
      // Buscar perfil com timeout de 2 segundos
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      const { data: profileData, error } = await withTimeout(
        profilePromise,
        2000,
        'Timeout ao buscar perfil'
      );

      if (error && error.code !== 'PGRST116') {
        console.warn('[AUTH] Erro ao buscar perfil, usando fallback:', error.message);
        const fallbackProfile = createFallbackProfile(currentUser);
        setProfile(fallbackProfile);
        setIsAdmin(fallbackProfile.role === 'admin');
        setIsFormacao(fallbackProfile.role === 'formacao');
        return;
      }

      // Se não encontrou perfil, criar um básico
      if (!profileData) {
        console.log('[AUTH] Perfil não encontrado, criando novo');
        try {
          const newProfilePromise = supabase
            .from('profiles')
            .insert({
              id: currentUser.id,
              email: currentUser.email,
              name: currentUser.user_metadata?.name || currentUser.user_metadata?.full_name || 'Usuário',
              role: 'member'
            })
            .select()
            .single();

          const { data: newProfile, error: insertError } = await withTimeout(
            newProfilePromise,
            2000,
            'Timeout ao criar perfil'
          );

          if (insertError || !newProfile) {
            console.warn('[AUTH] Erro ao criar perfil, usando fallback');
            const fallbackProfile = createFallbackProfile(currentUser);
            setProfile(fallbackProfile);
            setIsAdmin(false);
            setIsFormacao(false);
            return;
          }

          setProfile(newProfile);
          setIsAdmin(newProfile.role === 'admin');
          setIsFormacao(newProfile.role === 'formacao');
          return;
        } catch (createError) {
          console.warn('[AUTH] Falha ao criar perfil, usando fallback');
          const fallbackProfile = createFallbackProfile(currentUser);
          setProfile(fallbackProfile);
          setIsAdmin(false);
          setIsFormacao(false);
          return;
        }
      }

      // Verificar admin
      const trustedEmails = ['rafael@viverdeia.ai', 'admin@viverdeia.ai'];
      if (process.env.NODE_ENV === 'development') {
        trustedEmails.push('admin@teste.com');
      }

      const isAdminByEmail = trustedEmails.includes(currentUser.email?.toLowerCase() || '');
      const isAdminByRole = profileData.role === 'admin';
      const adminStatus = isAdminByEmail || isAdminByRole;

      // Atualizar role se necessário (sem bloquear a UI)
      if (isAdminByEmail && !isAdminByRole) {
        supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', currentUser.id)
          .then(() => {
            console.log('[AUTH] Role atualizado para admin');
            profileData.role = 'admin';
            setProfile({ ...profileData });
          })
          .catch(error => {
            console.warn('[AUTH] Erro ao atualizar role:', error);
          });
      }

      setProfile(profileData);
      setIsAdmin(adminStatus);
      setIsFormacao(profileData.role === 'formacao');

    } catch (error) {
      console.error('[AUTH] Erro crítico ao carregar perfil:', error);
      const fallbackProfile = createFallbackProfile(currentUser);
      setProfile(fallbackProfile);
      setIsAdmin(false);
      setIsFormacao(false);
    }
  };

  // Criar perfil fallback
  const createFallbackProfile = (user: User) => {
    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.user_metadata?.full_name || 'Usuário',
      role: 'member',
      avatar_url: null,
      company_name: null,
      industry: null,
      created_at: new Date().toISOString(),
      onboarding_completed: false,
      onboarding_completed_at: null
    };
  };

  // Login otimizado
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const signInPromise = supabase.auth.signInWithPassword({
        email,
        password
      });

      const { data, error } = await withTimeout(
        signInPromise,
        5000,
        'Timeout no login'
      );

      if (error) {
        console.error('[AUTH] Erro no login:', error.message);
        toast.error('Erro ao fazer login: ' + error.message);
        return { error };
      }

      console.log('[AUTH] Login realizado com sucesso');
      toast.success('Login realizado com sucesso!');
      return { error: null };
    } catch (error) {
      console.error('[AUTH] Erro crítico no login:', error);
      toast.error('Erro interno no login');
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  // Cadastro otimizado
  const signInAsMember = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const signUpPromise = supabase.auth.signUp({
        email,
        password
      });

      const { data, error } = await withTimeout(
        signUpPromise,
        5000,
        'Timeout no cadastro'
      );

      if (error) {
        console.error('[AUTH] Erro no cadastro:', error.message);
        toast.error('Erro ao cadastrar: ' + error.message);
        return { error };
      }

      console.log('[AUTH] Cadastro realizado com sucesso');
      toast.success('Cadastro realizado com sucesso!');
      return { error: null };
    } catch (error) {
      console.error('[AUTH] Erro crítico no cadastro:', error);
      toast.error('Erro interno no cadastro');
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout otimizado
  const signOut = async (): Promise<{ success: boolean; error?: any }> => {
    try {
      setIsLoading(true);
      
      const signOutPromise = supabase.auth.signOut();
      
      const { error } = await withTimeout(
        signOutPromise,
        3000,
        'Timeout no logout'
      );
      
      if (error) {
        console.error('[AUTH] Erro no logout:', error);
        toast.error('Erro ao fazer logout');
        return { success: false, error };
      }

      // Limpar estado imediatamente
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsAdmin(false);
      setIsFormacao(false);

      console.log('[AUTH] Logout realizado com sucesso');
      toast.success('Logout realizado com sucesso');
      return { success: true };

    } catch (error) {
      console.error('[AUTH] Erro crítico no logout:', error);
      
      // Força limpeza do estado mesmo com erro
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsAdmin(false);
      setIsFormacao(false);
      
      toast.error('Erro no logout, mas você foi desconectado');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Renovar sessão
  const refreshSession = async () => {
    try {
      const refreshPromise = supabase.auth.refreshSession();
      const { data, error } = await withTimeout(
        refreshPromise,
        3000,
        'Timeout ao renovar sessão'
      );
      
      if (error) throw error;
    } catch (error) {
      console.error('[AUTH] Erro ao renovar sessão:', error);
      await signOut();
    }
  };

  // Inicialização otimizada
  useEffect(() => {
    let mounted = true;
    
    const getInitialSession = async () => {
      try {
        console.log('[AUTH] Verificando sessão inicial');
        
        const sessionPromise = supabase.auth.getSession();
        const { data: { session }, error } = await withTimeout(
          sessionPromise,
          3000,
          'Timeout ao verificar sessão'
        );
        
        if (!mounted) return;
        
        if (error) {
          console.error('[AUTH] Erro ao verificar sessão:', error);
          setIsLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('[AUTH] Sessão ativa encontrada');
          
          // Carregar perfil sem bloquear a UI
          loadUserProfile(session.user).finally(() => {
            if (mounted) {
              setIsLoading(false);
            }
          });
        } else {
          console.log('[AUTH] Nenhuma sessão ativa');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('[AUTH] Erro crítico na verificação de sessão:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    getInitialSession();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('[AUTH] Evento de autenticação:', event);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('[AUTH] Usuário logado');
          
          // Carregar perfil sem bloquear
          loadUserProfile(session.user).finally(() => {
            if (mounted) {
              setIsLoading(false);
            }
          });
        } else if (event === 'SIGNED_OUT') {
          console.log('[AUTH] Usuário deslogado');
          setProfile(null);
          setIsAdmin(false);
          setIsFormacao(false);
          if (mounted) {
            setIsLoading(false);
          }
        } else if (event === 'USER_UPDATED') {
          console.log('[AUTH] Usuário atualizado');
          if (mounted) {
            setIsLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
