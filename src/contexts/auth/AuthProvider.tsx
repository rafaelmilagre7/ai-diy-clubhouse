
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { useAuthMethods } from './hooks/useAuthMethods';
import { AuthStateManager, AuthState } from './managers/AuthStateManager';
import { AuthContextType } from './types';
import { processUserProfile } from '@/hooks/auth/utils/authSessionUtils';

// Criação do contexto com valor padrão undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Estado unificado de autenticação
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    isAdmin: false,
    isFormacao: false,
    isLoading: true,
    authError: null
  });
  
  // Extrair valores do estado para facilitar o acesso
  const { session, user, profile, isAdmin, isFormacao, isLoading, authError } = authState;
  
  // Métodos de atualização otimizados com useCallback
  const setSession = useCallback((value: React.SetStateAction<Session | null>) => {
    setAuthState(prev => ({
      ...prev,
      session: typeof value === 'function' ? value(prev.session) : value
    }));
  }, []);
  
  const setUser = useCallback((value: React.SetStateAction<User | null>) => {
    setAuthState(prev => ({
      ...prev,
      user: typeof value === 'function' ? value(prev.user) : value
    }));
  }, []);
  
  const setProfile = useCallback((value: React.SetStateAction<UserProfile | null>) => {
    setAuthState(prev => {
      const newProfile = typeof value === 'function' ? value(prev.profile) : value;
      return {
        ...prev,
        profile: newProfile,
        isAdmin: newProfile?.role === 'admin',
        isFormacao: newProfile?.role === 'formacao'
      };
    });
  }, []);
  
  const setIsLoading = useCallback((value: React.SetStateAction<boolean>) => {
    setAuthState(prev => ({
      ...prev,
      isLoading: typeof value === 'function' ? value(prev.isLoading) : value
    }));
  }, []);

  // Handler otimizado para atualização de estado do AuthStateManager
  const handleAuthStateChange = useCallback((newState: Partial<AuthState>) => {
    setAuthState(prev => ({
      ...prev,
      ...newState
    }));
  }, []);
  
  // Extrair métodos de autenticação
  const { signIn, signOut, signInAsMember, signInAsAdmin } = useAuthMethods({ setIsLoading });
  
  // CORREÇÃO CRÍTICA: Carregar perfil completo quando usuário for definido
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user || profile || isLoading) return;
      
      try {
        console.log("🔄 AuthProvider: Carregando perfil completo para usuário:", user.id);
        
        const userProfile = await processUserProfile(
          user.id,
          user.email,
          user.user_metadata?.name || user.user_metadata?.full_name
        );
        
        if (userProfile) {
          console.log("✅ AuthProvider: Perfil carregado:", userProfile);
          setProfile(userProfile);
        } else {
          console.warn("⚠️ AuthProvider: Falha ao carregar perfil");
        }
      } catch (error) {
        console.error("❌ AuthProvider: Erro ao carregar perfil:", error);
      }
    };
    
    if (user && !profile) {
      loadUserProfile();
    }
  }, [user, profile, isLoading, setProfile]);

  // Salvar a rota autenticada quando o usuário fizer login com sucesso
  useEffect(() => {
    if (user && profile && !isLoading) {
      localStorage.setItem('lastAuthRoute', window.location.pathname);
    }
  }, [user, profile, isLoading]);

  // Montar objeto de contexto memoizado
  const contextValue: AuthContextType = React.useMemo(() => ({
    session,
    user,
    profile,
    isAdmin,
    isFormacao,
    isLoading,
    authError,
    signIn,
    signOut,
    signInAsMember,
    signInAsAdmin,
    setSession,
    setUser,
    setProfile,
    setIsLoading,
  }), [
    session, user, profile, isAdmin, isFormacao, isLoading, authError,
    signIn, signOut, signInAsMember, signInAsAdmin,
    setSession, setUser, setProfile, setIsLoading
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      <AuthStateManager onStateChange={handleAuthStateChange} />
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};
