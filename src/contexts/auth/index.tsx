
// MIGRAÇÃO TEMPORÁRIA: Redirecionando useAuth para useSimpleAuth
// Este arquivo será usado durante a transição para evitar quebras

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, UserProfile } from '@/lib/supabase';
import { useAuthMethods } from './hooks/useAuthMethods';
import { AuthContextType } from './types';
import { logger } from '@/utils/logger';

// IMPORTAR O NOVO CONTEXTO
import { useSimpleAuth } from './SimpleAuthProvider';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// PROVIDER LEGACY - mantido para compatibilidade temporária
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Mudança: iniciar como false
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Usar métodos de auth robustos
  const authMethods = useAuthMethods({ setIsLoading });

  const contextValue: AuthContextType = {
    user,
    session,
    profile,
    isLoading: isLoading || profileLoading,
    error,
    refreshProfile: async () => {}, // Método vazio
    isAdmin: profile?.user_roles?.name === 'admin',
    isFormacao: profile?.user_roles?.name === 'formacao',
    setSession: () => {},
    setUser: () => {},
    setProfile: () => {},
    setIsLoading: () => {},
    ...authMethods
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// HOOK PRINCIPAL - MIGRAÇÃO PARA useSimpleAuth
export const useAuth = (): AuthContextType => {
  // Usar o novo contexto
  const simpleAuth = useSimpleAuth();
  
  // Adaptar para interface legacy
  return {
    user: simpleAuth.user,
    session: simpleAuth.session,
    profile: simpleAuth.profile,
    isLoading: simpleAuth.isLoading,
    error: simpleAuth.error,
    isAdmin: simpleAuth.isAdmin,
    isFormacao: simpleAuth.isFormacao,
    refreshProfile: async () => {}, // Método vazio para compatibilidade
    setSession: () => {},
    setUser: () => {},
    setProfile: () => {},
    setIsLoading: () => {},
    signIn: simpleAuth.signIn,
    signUp: async () => ({ error: null }),
    signOut: simpleAuth.signOut,
    signInAsMember: async () => ({ error: null }),
    signInAsAdmin: async () => ({ error: null }),
    isSigningIn: false
  } as AuthContextType;
};

// Exportar também o novo hook para migração gradual
export { useSimpleAuth } from './SimpleAuthProvider';
