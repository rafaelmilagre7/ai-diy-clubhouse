
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';
import { useAuthMethods } from './hooks/useAuthMethods';
import { AuthContextType } from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use our extracted auth methods hook
  const { signIn, signOut, signInAsMember, signInAsAdmin } = useAuthMethods({ setIsLoading });

  // Calculate isAdmin based on profile role - usando string literal para comparação
  const isAdmin = profile?.role === 'admin';
  
  // Debug log de inicialização
  useEffect(() => {
    console.log("AuthProvider: Perfil de usuário carregado", { 
      profileId: profile?.id || 'não definido',
      email: profile?.email || 'não definido',
      role: profile?.role || 'não definido',
      isAdmin: profile?.role === 'admin'
    });
  }, [profile]);

  const value = {
    session,
    user,
    profile,
    isAdmin,
    isLoading,
    signIn,
    signOut,
    signInAsMember,
    signInAsAdmin,
    // Expose setState functions for the AuthSession component
    setSession,
    setUser,
    setProfile,
    setIsLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
