
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';
import { AuthContextType } from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);

  // Função otimizada para buscar perfil usando a nova função do banco
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('🔍 [AUTH] Buscando perfil otimizado para:', userId);
      
      const { data, error } = await supabase.rpc('get_user_profile_optimized', {
        target_user_id: userId
      });

      if (error) {
        console.error('❌ [AUTH] Erro ao buscar perfil:', error);
        return null;
      }

      if (data) {
        console.log('✅ [AUTH] Perfil carregado:', data.name || data.email);
        return data as UserProfile;
      }

      return null;
    } catch (error) {
      console.error('💥 [AUTH] Erro crítico ao buscar perfil:', error);
      return null;
    }
  };

  // Função para verificar se é admin usando a nova função otimizada
  const checkIsAdmin = async (userId: string): Promise<boolean> => {
    try {
      const { data } = await supabase.rpc('is_user_admin_fast', {
        target_user_id: userId
      });
      return data || false;
    } catch (error) {
      console.error('❌ [AUTH] Erro ao verificar admin:', error);
      return false;
    }
  };

  // Derivar estados computados do perfil
  const isAdmin = profile?.role === 'admin' || profile?.user_roles?.name === 'admin' || 
                  (profile?.email && profile.email.includes('@viverdeia.ai')) || false;
  
  const isFormacao = profile?.role === 'formacao' || profile?.user_roles?.name === 'formacao' || false;

  // Funções de autenticação
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signInAsMember = async (email: string, password: string) => {
    return signIn(email, password);
  };

  const signInAsAdmin = async (email: string, password: string) => {
    return signIn(email, password);
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Limpar estado local primeiro
      setUser(null);
      setSession(null);
      setProfile(null);
      
      const { error } = await supabase.auth.signOut();
      return { success: !error, error };
    } catch (error) {
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Configurar listener de mudanças de autenticação
  useEffect(() => {
    console.log('🚀 [AUTH] Inicializando AuthProvider');

    // Listener para mudanças de estado de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 [AUTH] Evento de autenticação:', event);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Buscar perfil quando usuário faz login
        const userProfile = await fetchUserProfile(session.user.id);
        setProfile(userProfile);
      } else {
        // Limpar perfil quando usuário faz logout
        setProfile(null);
      }
      
      setIsLoading(false);
    });

    // Verificar sessão existente
    const checkExistingSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ [AUTH] Erro ao obter sessão:', error);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          console.log('✅ [AUTH] Sessão existente encontrada:', session.user.email);
          setSession(session);
          setUser(session.user);
          
          const userProfile = await fetchUserProfile(session.user.id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('💥 [AUTH] Erro crítico ao verificar sessão:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingSession();

    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextType = {
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
