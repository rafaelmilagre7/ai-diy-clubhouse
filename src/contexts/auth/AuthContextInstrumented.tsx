import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { fetchUserProfile } from './utils';
import { UserProfile } from '@/lib/supabase';
import { perfMonitor, measureAsync } from '@/utils/performanceMonitor';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      perfMonitor.startTimer('AuthContext', 'loadUserProfile', { userId });
      
      const profileData = await measureAsync(
        'AuthContext',
        'fetchUserProfile',
        () => fetchUserProfile(userId),
        { userId }
      );
      
      setProfile(profileData as UserProfile);
      perfMonitor.endTimer('AuthContext', 'loadUserProfile', { userId, success: true });
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      perfMonitor.endTimer('AuthContext', 'loadUserProfile', { userId, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await loadUserProfile(user.id);
    }
  }, [user?.id, loadUserProfile]);

  useEffect(() => {
    perfMonitor.startTimer('AuthContext', 'initialization');
    
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user?.id) {
        loadUserProfile(session.user.id);
      }
      
      setLoading(false);
      perfMonitor.endTimer('AuthContext', 'initialization', { hasSession: !!session });
    });

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        perfMonitor.logEvent('AuthContext', `auth_state_change_${event}`, { hasSession: !!session });
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user?.id) {
          await loadUserProfile(session.user.id);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [loadUserProfile]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await measureAsync(
      'AuthContext',
      'signIn',
      () => supabase.auth.signInWithPassword({ email, password })
    );
    
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await measureAsync(
      'AuthContext',
      'signUp',
      () => supabase.auth.signUp({ email, password })
    );
    
    if (error) throw error;
  };

  const signOut = async () => {
    await measureAsync(
      'AuthContext',
      'signOut',
      () => supabase.auth.signOut()
    );
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
