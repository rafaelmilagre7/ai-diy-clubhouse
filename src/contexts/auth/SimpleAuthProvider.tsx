
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { fetchUserProfile } from './utils/profileUtils/userProfileFunctions';
import { UserProfile } from '@/types/userProfile';

export interface SimpleAuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  isAdmin: boolean;
  isFormacao: boolean;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<{ success: boolean; error?: Error }>;
  setSession: (session: Session | null) => void;
  isSigningIn: boolean;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

interface SimpleAuthProviderProps {
  children: ReactNode;
}

export const SimpleAuthProvider: React.FC<SimpleAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSessionState] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const setSession = (newSession: Session | null) => {
    setSessionState(newSession);
    setUser(newSession?.user || null);
  };

  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      const userProfile = await fetchUserProfile(user.id);
      setProfile(userProfile);
    } catch (error) {
      console.error('Error refreshing profile:', error);
      setError(error as Error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsSigningIn(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user && data.session) {
        setUser(data.user);
        setSessionState(data.session);
        
        // Fetch user profile
        const userProfile = await fetchUserProfile(data.user.id);
        setProfile(userProfile);
        
        toast.success('Login realizado com sucesso!');
      }
    } catch (error) {
      console.error('Error signing in:', error);
      setError(error as Error);
      toast.error('Erro ao fazer login');
      throw error;
    } finally {
      setIsSigningIn(false);
    }
  };

  const signOut = async (): Promise<{ success: boolean; error?: Error }> => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { success: false, error };
      }

      setUser(null);
      setSessionState(null);
      setProfile(null);
      setError(null);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  };

  // Check user role
  const isAdmin = profile?.role === 'admin';
  const isFormacao = profile?.role === 'formacao' || isAdmin;

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setError(error);
        } else if (session) {
          setUser(session.user);
          setSessionState(session);
          
          // Fetch user profile
          try {
            const userProfile = await fetchUserProfile(session.user.id);
            setProfile(userProfile);
          } catch (profileError) {
            console.error('Error fetching profile:', profileError);
            setError(profileError as Error);
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setError(error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (session) {
          setUser(session.user);
          setSessionState(session);
          
          if (event === 'SIGNED_IN') {
            try {
              const userProfile = await fetchUserProfile(session.user.id);
              setProfile(userProfile);
            } catch (profileError) {
              console.error('Error fetching profile on sign in:', profileError);
              setError(profileError as Error);
            }
          }
        } else {
          setUser(null);
          setSessionState(null);
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value: SimpleAuthContextType = {
    user,
    session,
    profile,
    isLoading,
    error,
    isAdmin,
    isFormacao,
    refreshProfile,
    signIn,
    signOut,
    setSession,
    isSigningIn
  };

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  );
};

export const useSimpleAuth = (): SimpleAuthContextType => {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
};
