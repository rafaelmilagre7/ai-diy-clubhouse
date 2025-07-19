
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { signOutUser } from './utils/sessionUtils';
import type { AuthContextType } from './types';
import { UserProfile } from '@/lib/supabase';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);
  // Autenticação otimizada - removidas complexidades desnecessárias

  // Função otimizada para buscar perfil usando nova função do banco
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log(`[AUTH-OPT] Buscando perfil otimizado para: ${userId}`);
      
      const { data, error } = await supabase.rpc('get_user_profile_optimized', {
        target_user_id: userId
      });

      if (error) {
        console.error('[AUTH-OPT] Erro na função RPC:', error);
        return null;
      }

      if (!data) {
        console.warn('[AUTH-OPT] Nenhum dado retornado');
        return null;
      }

      console.log('[AUTH-OPT] Perfil carregado com sucesso:', data.name || data.email);
      return data as UserProfile;
    } catch (error) {
      console.error('[AUTH-OPT] Erro crítico ao buscar perfil:', error);
      return null;
    }
  };

  // Função otimizada para processar mudanças de autenticação
  const processAuthChange = async (session: Session | null) => {
    console.log('[AUTH-OPT] Processando mudança de autenticação:', {
      hasSession: !!session,
      userId: session?.user?.id
    });

    setSession(session);
    setUser(session?.user ?? null);

    if (session?.user) {
      try {
        // Usar função otimizada do banco que cria perfil automaticamente se necessário
        const userProfile = await fetchUserProfile(session.user.id);
        setProfile(userProfile);
        
        console.log('[AUTH-OPT] Perfil processado:', {
          hasProfile: !!userProfile,
          userName: userProfile?.name,
          userRole: userProfile?.user_roles?.name
        });
      } catch (error) {
        console.error('[AUTH-OPT] Erro ao processar perfil:', error);
        setProfile(null);
      }
    } else {
      setProfile(null);
    }
  };

  // Inicialização simplificada e otimizada da autenticação
  useEffect(() => {
    let mounted = true;
    let authSubscription: any = null;
    
    const initializeAuth = async () => {
      try {
        console.log('[AUTH-OPT] Inicializando autenticação otimizada...');
        
        // Configurar listener PRIMEIRO (evita perder eventos)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;
            
            console.log('[AUTH-OPT] Evento de auth:', event);
            
            // Usar setTimeout para evitar deadlocks
            setTimeout(async () => {
              if (mounted) {
                await processAuthChange(session);
              }
            }, 0);
          }
        );
        
        authSubscription = subscription;

        // DEPOIS verificar sessão existente
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AUTH-OPT] Erro ao obter sessão:', error);
          setAuthError(error);
        } else {
          console.log('[AUTH-OPT] Sessão obtida:', !!session);
          await processAuthChange(session);
          setAuthError(null);
        }

        setIsLoading(false);
        console.log('[AUTH-OPT] Inicialização completa');

      } catch (error: any) {
        console.error('[AUTH-OPT] Erro crítico na inicialização:', error);
        setAuthError(error);
        setIsLoading(false);
        
        toast({
          title: 'Erro de autenticação',
          description: 'Falha na inicialização. Tente recarregar a página.',
          variant: 'destructive',
        });
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  // Função de login
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[AUTH] Erro no login:', error);
        return { error };
      }

      console.log('[AUTH] Login realizado com sucesso');
      return { error: null };
    } catch (error: any) {
      console.error('[AUTH] Erro crítico no login:', error);
      return { error };
    }
  };

  // Função de logout com tratamento robusto
  const signOut = async () => {
    try {
      console.log('[AUTH] Iniciando logout...');
      await signOutUser();
      return { success: true, error: null };
    } catch (error: any) {
      console.error('[AUTH] Erro no logout:', error);
      return { success: false, error };
    }
  };

  // Funções específicas (mantidas para compatibilidade)
  const signInAsMember = signIn;
  const signInAsAdmin = signIn;

  // Derivar propriedades baseadas no profile
  const isAdmin = profile?.user_roles?.name === 'admin' || false;
  const isFormacao = profile?.user_roles?.name === 'formacao' || false;

  const contextValue: AuthContextType = {
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
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
