
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';
import { AuthContextType } from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log('🔍 [AUTH-SIMPLE] Estado atual:', {
    hasUser: !!user,
    hasProfile: !!profile,
    isLoading,
    userEmail: user?.email
  });

  // Buscar perfil do usuário
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      console.log('🔄 [AUTH-SIMPLE] Buscando perfil para:', userId);
      
      const { data, error } = await supabase
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
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ [AUTH-SIMPLE] Erro ao buscar perfil:', error);
        return null;
      }

      console.log('✅ [AUTH-SIMPLE] Perfil carregado:', {
        name: data?.name,
        email: data?.email,
        role: data?.user_roles?.name
      });

      return data;
    } catch (error) {
      console.error('❌ [AUTH-SIMPLE] Erro crítico ao buscar perfil:', error);
      return null;
    }
  }, []);

  // Inicialização simplificada
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initAuth = async () => {
      try {
        console.log('🚀 [AUTH-SIMPLE] Inicializando autenticação...');
        
        // Timeout de segurança de 2 segundos
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn('⏰ [AUTH-SIMPLE] Timeout de 2s atingido - finalizando loading');
            setIsLoading(false);
          }
        }, 2000);

        // Verificar sessão atual
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ [AUTH-SIMPLE] Erro ao obter sessão:', error);
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }

        if (currentSession && mounted) {
          console.log('✅ [AUTH-SIMPLE] Sessão encontrada');
          setSession(currentSession);
          setUser(currentSession.user);

          // Buscar perfil
          const userProfile = await fetchUserProfile(currentSession.user.id);
          if (mounted && userProfile) {
            setProfile(userProfile);
          }
        }

        // Limpar timeout se chegou até aqui
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        if (mounted) {
          setIsLoading(false);
        }

      } catch (error) {
        console.error('❌ [AUTH-SIMPLE] Erro na inicialização:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('🔄 [AUTH-SIMPLE] Evento:', event, { hasSession: !!newSession });

      if (mounted) {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          const userProfile = await fetchUserProfile(newSession.user.id);
          if (mounted) {
            setProfile(userProfile);
            setIsLoading(false);
          }
        } else {
          setProfile(null);
          setIsLoading(false);
        }
      }
    });

    initAuth();

    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  // Sign out simplificado
  const signOut = useCallback(async () => {
    try {
      console.log('🚪 [AUTH-SIMPLE] Fazendo logout...');
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('❌ [AUTH-SIMPLE] Erro no logout:', error);
      throw error;
    }
  }, []);

  // Sign in simplificado
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      return { error };
    }
  }, []);

  // Refetch profile
  const refetchProfile = useCallback(async () => {
    if (user?.id) {
      const userProfile = await fetchUserProfile(user.id);
      setProfile(userProfile);
    }
  }, [user?.id, fetchUserProfile]);

  // Estados derivados
  const isAdmin = profile?.user_roles?.name === 'admin';
  const isFormacao = profile?.user_roles?.name === 'formacao';

  const value: AuthContextType = {
    session,
    user,
    profile,
    isLoading,
    isAdmin,
    isFormacao,
    refetchProfile,
    signOut,
    signIn,
    setProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
