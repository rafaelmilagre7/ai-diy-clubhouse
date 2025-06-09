
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { processUserProfile } from '@/hooks/auth/utils/authSessionUtils';
import { logger } from '@/utils/logger';
import { auditLogger } from '@/utils/auditLogger';
import { redirectToDomain } from '@/utils/authUtils';
import { sanitizeForLogging } from '@/utils/securityUtils';
import { loginRateLimiter, getClientIdentifier } from '@/utils/rateLimiting';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar_url?: string;
  company_name?: string;
  industry?: string;
  created_at: string;
  onboarding_completed: boolean;
  onboarding_completed_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isFormacao: boolean;
  authError: Error | null;
  signIn: (email: string, password: string) => Promise<{ error?: Error }>;
  signOut: () => Promise<{ success: boolean; error?: Error | null }>;
  signInAsMember: (email: string, password: string) => Promise<{ error?: Error }>;
  signInAsAdmin: (email: string, password: string) => Promise<{ error?: Error }>;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cache melhorado para perfis
const profileCache = new Map<string, { 
  profile: UserProfile | null; 
  timestamp: number;
  isLoading: boolean;
}>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFormacao, setIsFormacao] = useState(false);
  const [authError, setAuthError] = useState<Error | null>(null);

  // Função otimizada para buscar perfil com cache
  const getCachedProfile = async (userId: string, email?: string | null, name?: string): Promise<UserProfile | null> => {
    const cached = profileCache.get(userId);
    const now = Date.now();
    
    // Retornar cache se válido e não está carregando
    if (cached && !cached.isLoading && (now - cached.timestamp) < CACHE_DURATION) {
      console.log('✅ [AUTH DEBUG] Usando perfil do cache para:', userId.substring(0, 8) + '***');
      return cached.profile;
    }
    
    // Marcar como carregando
    profileCache.set(userId, { 
      profile: cached?.profile || null, 
      timestamp: now, 
      isLoading: true 
    });

    try {
      console.log('🔍 [AUTH DEBUG] Buscando perfil para usuário:', userId.substring(0, 8) + '***');
      
      // Buscar perfil com timeout
      const profilePromise = processUserProfile(userId, email, name);
      const timeoutPromise = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 4000)
      );
      
      const profile = await Promise.race([profilePromise, timeoutPromise]) as UserProfile | null;
      
      // Cachear resultado
      profileCache.set(userId, { 
        profile, 
        timestamp: now, 
        isLoading: false 
      });
      
      console.log('✅ [AUTH DEBUG] Perfil carregado:', profile ? `role: ${profile.role}` : 'null');
      return profile;
    } catch (error) {
      console.warn('⚠️ [AUTH DEBUG] Erro ao buscar perfil, usando fallback:', error);
      
      // Fallback: criar perfil mínimo
      const fallbackProfile: UserProfile = {
        id: userId,
        email: email || '',
        name: name || 'Usuário',
        role: 'membro_club',
        avatar_url: null,
        company_name: null,
        industry: null,
        created_at: new Date().toISOString(),
        onboarding_completed: false,
        onboarding_completed_at: null
      };
      
      profileCache.set(userId, { 
        profile: fallbackProfile, 
        timestamp: now, 
        isLoading: false 
      });
      
      return fallbackProfile;
    }
  };

  // Função segura de limpeza de estado de autenticação
  const cleanupAuthState = () => {
    try {
      const keysToRemove = Object.keys(localStorage).filter(
        key => key.startsWith('supabase.auth.') || key.includes('sb-')
      );
      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log('🧹 [AUTH DEBUG] Estado de autenticação limpo');
    } catch (error) {
      console.warn('⚠️ [AUTH DEBUG] Erro ao limpar estado:', error);
    }
  };

  // Método de login
  const signIn = async (email: string, password: string) => {
    if (!email || !password) {
      const error = new Error('Email e senha são obrigatórios');
      toast.error(error.message);
      return { error };
    }

    // Verificar rate limiting
    const clientId = getClientIdentifier();
    const emailId = email.toLowerCase().trim();
    const rateLimitCheck = loginRateLimiter.canAttempt(`${clientId}_${emailId}`);
    
    if (!rateLimitCheck.allowed) {
      const error = new Error(rateLimitCheck.reason || 'Muitas tentativas de login');
      toast.error(error.message);
      return { error };
    }

    setIsLoading(true);
    
    try {
      console.log('🚪 [AUTH DEBUG] Iniciando login para:', emailId.substring(0, 3) + '***');
      
      // Limpar estado anterior
      cleanupAuthState();
      
      // Tentar logout global primeiro
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch {
        // Ignorar erro de logout se não houver sessão
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailId,
        password
      });

      if (error) {
        console.error('❌ [AUTH DEBUG] Erro no login:', error.message);
        
        let friendlyMessage = 'Erro ao fazer login. Verifique suas credenciais.';
        
        if (error.message.includes('Invalid login credentials')) {
          friendlyMessage = 'Email ou senha incorretos';
        } else if (error.message.includes('Email not confirmed')) {
          friendlyMessage = 'Por favor, confirme seu email antes de fazer login';
        } else if (error.message.includes('Too many requests')) {
          friendlyMessage = 'Muitas tentativas. Tente novamente em alguns minutos';
        }
        
        toast.error(friendlyMessage);
        return { error };
      }

      if (data.user) {
        // Reset rate limiting após sucesso
        loginRateLimiter.reset(`${clientId}_${emailId}`);
        
        console.log('✅ [AUTH DEBUG] Login realizado com sucesso para:', data.user.id.substring(0, 8) + '***');
        toast.success('Login realizado com sucesso!');
        
        // Forçar recarregamento da página para estado limpo
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
      }

      return { error: undefined };
    } catch (error) {
      const authError = error instanceof Error ? error : new Error('Erro desconhecido no login');
      console.error('💥 [AUTH DEBUG] Erro crítico no login:', authError.message);
      toast.error('Erro interno. Tente novamente mais tarde.');
      return { error: authError };
    } finally {
      setIsLoading(false);
    }
  };

  // Método de logout
  const signOut = async () => {
    setIsLoading(true);
    
    try {
      console.log('🚪 [AUTH DEBUG] Iniciando logout');
      
      // Limpar estado e cache
      cleanupAuthState();
      profileCache.clear();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (error) {
        console.warn('⚠️ [AUTH DEBUG] Erro no logout global:', error);
      }
      
      toast.success('Logout realizado com sucesso');
      
      // Forçar redirecionamento
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
      
      return { success: true, error: null };
      
    } catch (error) {
      console.error('💥 [AUTH DEBUG] Erro crítico no logout:', error);
      toast.error('Erro ao fazer logout. Limpando sessão...');
      
      // Mesmo com erro, redirecionar
      setTimeout(() => {
        window.location.href = '/login';
      }, 500);
      
      return { success: false, error: error instanceof Error ? error : new Error('Erro desconhecido') };
    } finally {
      setIsLoading(false);
    }
  };

  // Métodos específicos
  const signInAsMember = async (email: string, password: string) => {
    return signIn(email, password);
  };

  const signInAsAdmin = async (email: string, password: string) => {
    const result = await signIn(email, password);
    if (!result.error) {
      console.log('🔐 [AUTH DEBUG] Tentativa de login como admin');
    }
    return result;
  };

  // Configurar listener de autenticação
  useEffect(() => {
    console.log('🚀 [AUTH DEBUG] Iniciando configuração de autenticação unificada');
    
    let isMounted = true;

    const setupAuth = async () => {
      // Configurar listener para mudanças de autenticação
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          console.log(`🔄 [AUTH DEBUG] Evento de autenticação: ${event}`);
          
          if (!isMounted) return;

          if (event === 'SIGNED_IN' && newSession?.user) {
            console.log(`🎉 [AUTH DEBUG] Login detectado para: ${newSession.user.email}`);
            
            setSession(newSession);
            setUser(newSession.user);
            setIsLoading(true);

            // Verificar redirecionamento de domínio (apenas se necessário)
            const currentOrigin = window.location.origin;
            const targetDomain = 'https://app.viverdeia.ai';
            const isInitialLogin = !localStorage.getItem('lastAuthRoute');

            if (isInitialLogin && !currentOrigin.includes('localhost') && currentOrigin !== targetDomain) {
              toast.info("Redirecionando para o domínio principal...");
              const currentPath = window.location.pathname;
              redirectToDomain(currentPath);
              return;
            }

            // Buscar perfil
            try {
              const userProfile = await getCachedProfile(
                newSession.user.id,
                newSession.user.email,
                newSession.user.user_metadata?.name
              );

              if (isMounted && userProfile) {
                console.log('📊 [AUTH DEBUG] Definindo perfil no listener:', {
                  role: userProfile.role,
                  isAdmin: userProfile.role === 'admin',
                  isFormacao: userProfile.role === 'formacao'
                });
                
                setProfile(userProfile);
                setIsAdmin(userProfile.role === 'admin');
                setIsFormacao(userProfile.role === 'formacao');
                setIsLoading(false);
              }
            } catch (error) {
              console.error('💥 [AUTH DEBUG] Erro ao processar perfil:', error);
              if (isMounted) {
                setIsLoading(false);
              }
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('👋 [AUTH DEBUG] Logout detectado');
            profileCache.clear();
            
            setSession(null);
            setUser(null);
            setProfile(null);
            setIsAdmin(false);
            setIsFormacao(false);
            setIsLoading(false);
          } else if (event === 'USER_UPDATED') {
            setSession(newSession);
            setUser(newSession?.user || null);
          }
        }
      );

      // Verificar sessão atual
      try {
        console.log('⏳ [AUTH DEBUG] Verificando sessão atual...');
        
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 2000)
        );
        
        const { data: { session: currentSession }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as { data: { session: Session | null }, error: any };
        
        if (error) {
          console.error('❌ [AUTH DEBUG] Erro ao verificar sessão:', error.message);
          setAuthError(error);
          setIsLoading(false);
          return;
        }

        console.log('📄 [AUTH DEBUG] Sessão obtida:', currentSession ? 'ENCONTRADA' : 'NÃO ENCONTRADA');
        
        if (!isMounted) return;
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Processar perfil se houver sessão ativa
        if (currentSession?.user) {
          console.log(`👤 [AUTH DEBUG] Usuário encontrado: ${currentSession.user.email}`);
          
          try {
            const userProfile = await getCachedProfile(
              currentSession.user.id,
              currentSession.user.email,
              currentSession.user.user_metadata?.name
            );

            if (isMounted && userProfile) {
              console.log('📊 [AUTH DEBUG] Definindo perfil inicial:', {
                role: userProfile.role,
                isAdmin: userProfile.role === 'admin',
                isFormacao: userProfile.role === 'formacao'
              });
              
              setProfile(userProfile);
              setIsAdmin(userProfile.role === 'admin');
              setIsFormacao(userProfile.role === 'formacao');
            }
          } catch (error) {
            console.error('💥 [AUTH DEBUG] Erro ao processar perfil na inicialização:', error);
          }
        } else {
          console.log('❌ [AUTH DEBUG] Nenhum usuário na sessão');
        }
        
        if (isMounted) {
          console.log('✅ [AUTH DEBUG] Inicialização concluída, removendo loading');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('💥 [AUTH DEBUG] Erro crítico ao verificar sessão:', error);
        if (isMounted) {
          setIsLoading(false);
          setAuthError(error instanceof Error ? error : new Error('Erro desconhecido'));
        }
      }

      return () => {
        subscription.unsubscribe();
      };
    };

    const cleanup = setupAuth();
    
    return () => {
      isMounted = false;
      cleanup.then(cleanupFn => {
        if (cleanupFn) cleanupFn();
      });
    };
  }, []);

  // Log do estado atual
  useEffect(() => {
    console.log('📊 [AUTH DEBUG] Estado atual unificado:', {
      hasUser: !!user,
      userEmail: user?.email,
      hasProfile: !!profile,
      profileRole: profile?.role,
      isAdmin,
      isFormacao,
      isLoading
    });
  }, [user, profile, isAdmin, isFormacao, isLoading]);

  // Log de eventos de autenticação para auditoria
  useEffect(() => {
    const logAuthEvents = async () => {
      if (user && profile && !isLoading) {
        try {
          await auditLogger.logAuthEvent('session_active', {
            userRole: profile.role,
            timestamp: new Date().toISOString()
          }, user.id);
          
          logger.info("Sessão de usuário ativa", {
            component: 'AUTH_PROVIDER_UNIFIED',
            userId: user.id.substring(0, 8) + '***',
            role: profile.role
          });
        } catch (error) {
          logger.debug("Erro no log de autenticação", {
            component: 'AUTH_PROVIDER_UNIFIED',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }
      }
    };
    
    const timeoutId = setTimeout(logAuthEvents, 1000);
    return () => clearTimeout(timeoutId);
  }, [user, profile, isLoading]);

  // Mostrar loading
  if (isLoading) {
    console.log('⏳ [AUTH DEBUG] Mostrando tela de loading unificada');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-80">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
        </div>
      </div>
    );
  }

  const contextValue: AuthContextType = {
    user,
    session,
    profile,
    isLoading,
    isAdmin,
    isFormacao,
    authError,
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
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};

export const useIsAdmin = () => {
  const { isAdmin } = useAuth();
  return isAdmin;
};
