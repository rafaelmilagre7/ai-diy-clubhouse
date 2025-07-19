
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';
import { AuthContextType } from './types';
import { getUserRoleName } from '@/lib/supabase/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isFormacao, setIsFormacao] = useState<boolean>(false);

  // Função robusta para buscar perfil com timeout e retry
  const fetchUserProfile = async (userId: string, retries = 2): Promise<UserProfile | null> => {
    console.log(`[AUTH] 🔍 Buscando perfil para usuário: ${userId} (tentativas restantes: ${retries})`);
    
    try {
      // Timeout de 5 segundos
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout ao buscar perfil')), 5000)
      );

      const profilePromise = supabase.rpc('get_user_profile_optimized', {
        target_user_id: userId
      });

      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

      if (error) {
        console.error('[AUTH] ❌ Erro ao buscar perfil:', error);
        throw error;
      }

      if (!data) {
        console.warn('[AUTH] ⚠️ Perfil não encontrado para usuário:', userId);
        return null;
      }

      console.log('[AUTH] ✅ Perfil carregado com sucesso:', {
        email: data.email,
        name: data.name,
        role: data.user_roles?.name
      });

      return data;
    } catch (error: any) {
      console.error(`[AUTH] ❌ Erro na busca do perfil (tentativa ${3 - retries}):`, error);
      
      if (retries > 0 && !error.message.includes('Timeout')) {
        console.log(`[AUTH] 🔄 Tentando novamente... (${retries} tentativas restantes)`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Aguardar 1s
        return fetchUserProfile(userId, retries - 1);
      }
      
      return null;
    }
  };

  // Função para verificar se é admin com timeout
  const checkIsAdmin = async (userId: string): Promise<boolean> => {
    try {
      console.log('[AUTH] 🔐 Verificando permissões de admin para:', userId);
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout na verificação de admin')), 3000)
      );

      const adminPromise = supabase.rpc('is_user_admin_fast', {
        target_user_id: userId
      });

      const { data, error } = await Promise.race([adminPromise, timeoutPromise]) as any;

      if (error) {
        console.error('[AUTH] ❌ Erro ao verificar admin:', error);
        return false;
      }

      const isAdminResult = data || false;
      console.log('[AUTH] 🔐 Status admin:', isAdminResult);
      return isAdminResult;
    } catch (error) {
      console.error('[AUTH] ❌ Erro na verificação de admin:', error);
      return false;
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('[AUTH] 🚀 Iniciando login para:', email);
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      console.log('[AUTH] ✅ Login realizado com sucesso');
      return { data, error: null };
    } catch (error: any) {
      console.error('[AUTH] ❌ Erro no login:', error);
      setAuthError(error.message);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  const signInAsMember = async (email: string, password: string) => {
    return signIn(email, password);
  };

  const signInAsAdmin = async (email: string, password: string) => {
    return signIn(email, password);
  };

  const signOut = async () => {
    console.log('[AUTH] 🚪 Fazendo logout...');
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Limpar estados
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsAdmin(false);
      setIsFormacao(false);
      console.log('[AUTH] ✅ Logout realizado com sucesso');
    } catch (error: any) {
      console.error('[AUTH] ❌ Erro ao fazer logout:', error);
      setAuthError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('[AUTH] 🔧 Configurando listener de autenticação...');
    
    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`[AUTH] 📡 Estado mudou: ${event}`, session ? `usuário ${session.user.email}` : 'sem sessão');
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          console.log('[AUTH] 👤 Usuário autenticado, carregando dados...');
          setIsLoading(true);
          
          try {
            // Buscar dados em paralelo com timeout total
            const loadUserDataPromise = Promise.all([
              fetchUserProfile(session.user.id),
              checkIsAdmin(session.user.id)
            ]);

            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout geral no carregamento')), 10000)
            );

            const [profileData, adminStatus] = await Promise.race([
              loadUserDataPromise,
              timeoutPromise
            ]) as [UserProfile | null, boolean];

            console.log('[AUTH] 📊 Dados carregados:', {
              profile: !!profileData,
              admin: adminStatus,
              email: profileData?.email
            });

            setProfile(profileData);
            setIsAdmin(adminStatus);
            
            // Verificar se é formação
            if (profileData?.user_roles?.name) {
              const roleName = getUserRoleName(profileData);
              setIsFormacao(roleName === 'formacao');
              console.log('[AUTH] 🎓 Role detectado:', roleName);
            }

            console.log('[AUTH] ✅ Carregamento de dados concluído com sucesso');
          } catch (error) {
            console.error('[AUTH] ❌ Erro ao carregar dados do usuário:', error);
            setAuthError('Erro ao carregar dados do usuário');
            
            // Em caso de erro, definir valores padrão para não bloquear
            setProfile(null);
            setIsAdmin(false);
            setIsFormacao(false);
          }
        } else {
          console.log('[AUTH] 🚫 Sem usuário, limpando estados...');
          // Limpar estados quando não há usuário
          setProfile(null);
          setIsAdmin(false);
          setIsFormacao(false);
        }

        setIsLoading(false);
        console.log('[AUTH] 🏁 Processamento do evento de auth concluído');
      }
    );

    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AUTH] 🔍 Verificando sessão inicial:', session ? `encontrada para ${session.user.email}` : 'não encontrada');
    });

    return () => {
      console.log('[AUTH] 🧹 Limpando listener de autenticação');
      subscription.unsubscribe();
    };
  }, []);

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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
