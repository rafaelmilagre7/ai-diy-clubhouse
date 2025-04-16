
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';
import { useAuthMethods } from './hooks/useAuthMethods';
import { AuthContextType } from './types';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use our extracted auth methods hook
  const { signIn, signOut, signInAsMember, signInAsAdmin } = useAuthMethods({ setIsLoading });

  // Set up initial auth state on mount and handle auth state changes
  useEffect(() => {
    console.log("AuthProvider initializing");
    
    // First set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event);
        setSession(newSession);
        setUser(newSession?.user || null);
        
        // Don't set isLoading to false here, let the AuthSession component handle that
        // after profile processing
      }
    );
    
    // Then get current session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user || null);
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        // Set loading to false only if we don't have a session
        // If we have a session, the AuthSession component will set it to false after fetching the profile
        if (!session) {
          setIsLoading(false);
        }
      }
    };
    
    initAuth();
    
    // Cleanup on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Calculate isAdmin based on profile role
  const isAdmin = profile?.role === 'admin';
  
  // Debug log for profile
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
