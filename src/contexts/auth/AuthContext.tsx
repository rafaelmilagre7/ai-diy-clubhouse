
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, UserProfile } from '@/lib/supabase';
import { fetchUserProfile, createUserProfileIfNeeded } from './utils/profileUtils';
import { AuthContextType } from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthError(error);
        return { error };
      }
      setAuthError(null);
      return {};
    } catch (error) {
      const authError = error instanceof Error ? error : new Error('Erro ao fazer login');
      setAuthError(authError);
      return { error: authError };
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
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { success: false, error };
      }
      setUser(null);
      setSession(null);
      setProfile(null);
      setAuthError(null);
      return { success: true };
    } catch (error) {
      const authError = error instanceof Error ? error : new Error('Erro ao fazer logout');
      return { success: false, error: authError };
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      console.log(`[AUTH] Carregando perfil para usuário: ${userId}`);
      
      let userProfile = await fetchUserProfile(userId);
      
      // Se não encontrou perfil, tentar criar
      if (!userProfile) {
        console.log(`[AUTH] Perfil não encontrado, tentando criar para: ${userId}`);
        userProfile = await createUserProfileIfNeeded(userId);
      }

      if (userProfile) {
        console.log(`[AUTH] Perfil carregado com sucesso: ${userId}`);
        setProfile(userProfile);
      } else {
        console.warn(`[AUTH] Não foi possível carregar/criar perfil para: ${userId}`);
        setProfile(null);
      }
    } catch (error) {
      console.error(`[AUTH] Erro ao carregar perfil para ${userId}:`, error);
      setProfile(null);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`[AUTH] Auth state change: ${event}`);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetching to prevent deadlock
          setTimeout(() => {
            loadUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = profile?.user_roles?.name === 'admin' || profile?.role_id === 'admin';
  const isFormacao = profile?.user_roles?.name === 'formacao' || profile?.role_id === 'formacao';
  const hasCompletedOnboarding = profile?.onboarding_completed || false;

  const value: AuthContextType = {
    session,
    user,
    profile,
    isAdmin,
    isFormacao,
    isLoading,
    authError,
    hasCompletedOnboarding,
    signIn,
    signOut,
    signInAsMember,
    signInAsAdmin,
    setSession,
    setUser,
    setProfile,
    setIsLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
