
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';
import { useAuthMethods } from './hooks/useAuthMethods';
import { useAuthStateManager } from './hooks/useAuthStateManager';
import { clearProfileCache } from '@/hooks/auth/utils/authSessionUtils';
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
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const authListenerRef = useRef<any>(null);
  const isInitialized = useRef(false);
  const lastUserId = useRef<string | null>(null);

  const { setupAuthSession } = useAuthStateManager();
  const { signIn, signOut, signInAsMember, signInAsAdmin } = useAuthMethods({
    setIsLoading,
  });

  // Função para debug do estado atual
  const logCurrentState = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 [AUTH DEBUG] Estado atual unificado:', {
        hasUser: !!user,
        userEmail: user?.email || 'N/A',
        hasProfile: !!profile,
        profileRole: profile?.role || 'N/A',
        isAdmin: profile?.role === 'admin',
        isFormacao: profile?.role === 'formacao',
        isLoading
      });
    }
  }, [user, profile, isLoading]);

  // Computar isAdmin com cache
  const isAdmin = React.useMemo(() => {
    const adminStatus = profile?.role === 'admin';
    return adminStatus;
  }, [profile?.role]);

  // Computar isFormacao
  const isFormacao = React.useMemo(() => {
    return profile?.role === 'formacao';
  }, [profile?.role]);

  // Inicialização única
  useEffect(() => {
    if (isInitialized.current) return;
    
    const initializeAuth = async () => {
      console.log('🚀 [AUTH DEBUG] Inicializando sistema de autenticação');
      
      try {
        // Setup inicial da sessão
        await setupAuthSession();
        
        // Setup do listener de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log(`🔄 [AUTH DEBUG] Evento de autenticação: ${event}`);
            
            // Detectar mudanças de usuário
            const currentUserId = session?.user?.id;
            if (lastUserId.current && lastUserId.current !== currentUserId) {
              console.log('👤 [AUTH DEBUG] Mudança de usuário detectada, limpando cache');
              clearProfileCache();
            }
            lastUserId.current = currentUserId;
            
            if (event === 'SIGNED_IN' && session?.user) {
              console.log(`🎉 [AUTH DEBUG] Login detectado para: ${session.user.email}`);
              
              // Usar setTimeout para evitar race conditions
              setTimeout(async () => {
                try {
                  await setupAuthSession();
                } catch (error) {
                  console.error('❌ [AUTH DEBUG] Erro no setup pós-login:', error);
                }
              }, 100);
            } else if (event === 'SIGNED_OUT') {
              console.log('👋 [AUTH DEBUG] Logout detectado');
              clearProfileCache();
              setUser(null);
              setProfile(null);
              setSession(null);
              setIsLoading(false);
            }
          }
        );
        
        authListenerRef.current = subscription;
        isInitialized.current = true;
        
      } catch (error) {
        console.error('❌ [AUTH DEBUG] Erro na inicialização:', error);
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      if (authListenerRef.current) {
        authListenerRef.current.unsubscribe();
      }
    };
  }, [setupAuthSession]);

  // Log do estado para debug
  useEffect(() => {
    if (!isLoading && user && profile) {
      logCurrentState();
    }
  }, [user, profile, isLoading, logCurrentState]);

  const value: AuthContextType = {
    user,
    session,
    profile,
    isAdmin,
    isFormacao,
    isLoading,
    signIn,
    signOut,
    signInAsMember,
    signInAsAdmin,
    setUser,
    setSession,
    setProfile,
    setIsLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
