
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';
import { AuthContextType } from './types';
import { useAuthMethods } from './hooks/useAuthMethods';
import { fetchUserProfile } from './utils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cache simples para perfis
const profileCache = new Map<string, { profile: UserProfile; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);
  
  // Refs para controle de estado
  const initializationRef = useRef(false);
  const profileFetchRef = useRef<string>('');

  // Auth methods
  const authMethods = useAuthMethods({ setIsLoading });

  // Função para buscar perfil com cache
  const fetchProfileWithCache = async (userId: string) => {
    try {
      // Verificar cache primeiro
      const cached = profileCache.get(userId);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('[AUTH] Cache hit para perfil:', userId);
        setProfile(cached.profile);
        return cached.profile;
      }

      // Evitar múltiplas chamadas simultâneas
      if (profileFetchRef.current === userId) {
        return;
      }
      profileFetchRef.current = userId;

      console.log('[AUTH] Buscando perfil para:', userId);
      const userProfile = await fetchUserProfile(userId);
      
      if (userProfile) {
        // Atualizar cache
        profileCache.set(userId, {
          profile: userProfile,
          timestamp: Date.now()
        });
        setProfile(userProfile);
        console.log('[AUTH] Perfil carregado e cached:', userProfile.email);
      }
      
      return userProfile;
    } catch (error) {
      console.error('[AUTH] Erro ao buscar perfil:', error);
      setAuthError(error as Error);
    } finally {
      profileFetchRef.current = '';
    }
  };

  // Inicialização da autenticação
  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    const initializeAuth = async () => {
      try {
        console.log('[AUTH] Inicializando autenticação...');

        // Configurar listener primeiro
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            console.log('[AUTH] Estado mudou:', event);
            
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            
            if (event === 'SIGNED_IN' && currentSession?.user) {
              // Buscar perfil com delay mínimo para evitar race conditions
              setTimeout(() => {
                fetchProfileWithCache(currentSession.user.id);
              }, 100);
            } else if (event === 'SIGNED_OUT') {
              setProfile(null);
              setAuthError(null);
              // Limpar cache no logout
              profileCache.clear();
            }
          }
        );

        // Verificar sessão atual
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (currentSession?.user) {
          console.log('[AUTH] Sessão existente encontrada');
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Buscar perfil para sessão existente
          await fetchProfileWithCache(currentSession.user.id);
        }

        // Cleanup function
        return () => subscription.unsubscribe();
        
      } catch (error) {
        console.error('[AUTH] Erro na inicialização:', error);
        setAuthError(error as Error);
      } finally {
        // Timeout de segurança para loading
        setTimeout(() => {
          setIsLoading(false);
        }, 3000); // Reduzido de 15s para 3s
      }
    };

    const cleanup = initializeAuth();
    
    return () => {
      cleanup.then(fn => fn && fn());
    };
  }, []);

  // Timeout adicional de segurança
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn('[AUTH] Timeout de segurança - forçando fim do loading');
        setIsLoading(false);
      }
    }, 5000); // 5 segundos máximo

    return () => clearTimeout(safetyTimeout);
  }, [isLoading]);

  // Computar propriedades derivadas
  const isAdmin = profile?.user_roles?.name === 'admin';
  const isFormacao = profile?.user_roles?.name === 'formacao';

  const contextValue: AuthContextType = {
    session,
    user,
    profile,
    isAdmin,
    isFormacao,
    isLoading,
    authError,
    setSession,
    setUser,
    setProfile,
    setIsLoading,
    ...authMethods
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
