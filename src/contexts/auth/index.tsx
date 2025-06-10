
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile, getUserRoleName, isAdminRole, isFormacaoRole } from '@/lib/supabase';
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
  const [authError, setAuthError] = useState<Error | null>(null);
  
  const authListenerRef = useRef<any>(null);
  const isInitialized = useRef(false);
  const lastUserId = useRef<string | null>(null);
  const initTimeoutRef = useRef<number | null>(null);
  const circuitBreakerRef = useRef(false);

  // Inicializar useAuthStateManager com os setters
  const { setupAuthSession } = useAuthStateManager({
    setSession,
    setUser,
    setProfile,
    setIsLoading,
  });

  const { signIn, signOut, signInAsMember, signInAsAdmin } = useAuthMethods({
    setIsLoading,
  });

  // CORREÇÃO 1: Circuit breaker - timeout absoluto reduzido para 6 segundos
  useEffect(() => {
    initTimeoutRef.current = window.setTimeout(() => {
      if (isLoading && !circuitBreakerRef.current) {
        console.warn("⚠️ [AUTH-INIT] Circuit breaker ativado (6s) - forçando fim do loading");
        circuitBreakerRef.current = true;
        setIsLoading(false);
      }
    }, 6000);

    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, [isLoading]);

  // Função para debug do estado atual com mais detalhes
  const logCurrentState = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 [AUTH DEBUG] Estado atual unificado:', {
        hasUser: !!user,
        userEmail: user?.email || 'N/A',
        userId: user?.id?.substring(0, 8) + '***' || 'N/A',
        hasProfile: !!profile,
        profileId: profile?.id?.substring(0, 8) + '***' || 'N/A',
        roleName: getUserRoleName(profile),
        isAdmin: isAdminRole(profile),
        isFormacao: isFormacaoRole(profile),
        isLoading,
        hasAuthError: !!authError,
        circuitBreakerActive: circuitBreakerRef.current
      });
    }
  }, [user, profile, isLoading, authError]);

  // CORREÇÃO 2: Verificação imediata de admin baseada em email
  const isAdminByEmail = user?.email && [
    'rafael@viverdeia.ai',
    'admin@viverdeia.ai',
    'admin@teste.com'
  ].includes(user.email.toLowerCase());

  // Computar isAdmin com cache - agora usa role_id E email
  const isAdmin = React.useMemo(() => {
    return isAdminRole(profile) || isAdminByEmail;
  }, [profile, isAdminByEmail]);

  // Computar isFormacao - agora usa role_id
  const isFormacao = React.useMemo(() => {
    return isFormacaoRole(profile);
  }, [profile]);

  // Inicialização única com garantia de finalização do loading
  useEffect(() => {
    if (isInitialized.current) return;
    
    const initializeAuth = async () => {
      console.log('🚀 [AUTH-INIT] Inicializando sistema de autenticação');
      
      try {
        // Setup inicial da sessão
        await setupAuthSession();
        
        // Setup do listener de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log(`🔄 [AUTH-INIT] Evento de autenticação: ${event}`, {
              hasSession: !!session,
              userEmail: session?.user?.email || 'N/A'
            });
            
            // Detectar mudanças de usuário
            const currentUserId = session?.user?.id;
            if (lastUserId.current && lastUserId.current !== currentUserId) {
              console.log('👤 [AUTH-INIT] Mudança de usuário detectada, limpando cache');
              clearProfileCache();
            }
            lastUserId.current = currentUserId;
            
            if (event === 'SIGNED_IN' && session?.user) {
              console.log(`🎉 [AUTH-INIT] Login detectado para: ${session.user.email}`);
              
              // CORREÇÃO 3: Executar setup com circuit breaker
              try {
                console.log('🚀 [AUTH-INIT] Executando setup pós-login');
                
                // Verificar se circuit breaker já foi ativado
                if (circuitBreakerRef.current) {
                  console.warn('[AUTH-INIT] Circuit breaker ativo - setup simplificado');
                  setUser(session.user);
                  setSession(session);
                  setIsLoading(false);
                  return;
                }
                
                await setupAuthSession();
                console.log('✅ [AUTH-INIT] Setup pós-login concluído com sucesso');
              } catch (error) {
                console.error('❌ [AUTH-INIT] Erro no setup pós-login:', error);
                setAuthError(error instanceof Error ? error : new Error('Erro no setup pós-login'));
                
                // CORREÇÃO 4: Fallback - definir dados básicos mesmo com erro
                setUser(session.user);
                setSession(session);
                setIsLoading(false);
              }
            } else if (event === 'SIGNED_OUT') {
              console.log('👋 [AUTH-INIT] Logout detectado');
              clearProfileCache();
              setUser(null);
              setProfile(null);
              setSession(null);
              setAuthError(null);
              setIsLoading(false);
              circuitBreakerRef.current = false; // Reset circuit breaker
            }
          }
        );
        
        authListenerRef.current = subscription;
        isInitialized.current = true;
        console.log('✅ [AUTH-INIT] Inicialização concluída com sucesso');
        
      } catch (error) {
        console.error('❌ [AUTH-INIT] Erro na inicialização:', error);
        setAuthError(error instanceof Error ? error : new Error('Erro na inicialização'));
      } finally {
        // CORREÇÃO 5: Garantir SEMPRE que loading seja finalizado
        console.log('✅ [AUTH-INIT] Finalizando loading no finally');
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

  // Log do estado para debug com mais frequência
  useEffect(() => {
    logCurrentState();
  }, [user, profile, isLoading, authError, logCurrentState]);

  const value: AuthContextType = {
    user,
    session,
    profile,
    isAdmin,
    isFormacao,
    isLoading,
    authError,
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
