
import React, { createContext, useContext, useState } from 'react';
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

  const value = {
    session,
    user,
    profile,
    isAdmin: profile?.role === 'admin',
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
