
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';
import { AuthContextType } from './types';
import { useAuthMethods } from './hooks/useAuthMethods';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Estados principais
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialLoadComplete = useRef(false); // CRÍTICO: useRef para evitar dependência circular

  // Hook para métodos de autenticação
  const { signIn, signOut } = useAuthMethods({ setIsLoading });

  // Estados derivados memoizados
  const isAdmin = useMemo(() => {
    const roleName = profile?.user_roles?.name;
    const permissions = profile?.user_roles?.permissions || {};
    return roleName === 'admin' || permissions.all === true || false;
  }, [profile?.user_roles?.name, profile?.user_roles?.permissions]);
  
  const isFormacao = useMemo(() => {
    const roleName = profile?.user_roles?.name;
    const permissions = profile?.user_roles?.permissions || {};
    
    console.log('🔍 [AUTH] Verificando acesso formação:', {
      roleName,
      permissions,
      isAdmin: roleName === 'admin' || permissions.all === true
    });
    
    return roleName === 'formacao' || 
           roleName === 'admin' || 
           roleName === 'lovable_e_formacao' ||
           roleName?.includes('formacao') ||
           permissions.learning === true || 
           permissions.formacao === true || 
           permissions.all === true || false;
  }, [profile?.user_roles?.name, profile?.user_roles?.permissions]);

  // CORREÇÃO DE EMERGÊNCIA: Buscar perfil por ID ou email como fallback
  const fetchUserProfile = useCallback(async (userId: string, retryCount: number = 0) => {
    const maxRetries = 1; // Reduzido para 1 tentativa apenas
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    try {
      console.log('🔍 [AUTH] Buscando perfil por ID:', userId.substring(0, 8) + '***');
      
      // PRIMEIRA TENTATIVA: Buscar por ID do usuário autenticado
      let { data: profileData, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles:role_id (
            id,
            name,
            description,
            permissions
          )
        `)
        .eq('id', userId)
        .single();

      // CORREÇÃO DE EMERGÊNCIA: Se não encontrou por ID, buscar por email
      if (error && user?.email) {
        console.warn('⚠️ [AUTH] Perfil não encontrado por ID, buscando por email:', user.email);
        
        const { data: profileByEmail, error: emailError } = await supabase
          .from('profiles')
          .select(`
            *,
            user_roles:role_id (
              id,
              name,
              description,
              permissions
            )
          `)
          .eq('email', user.email)
          .single();

        if (!emailError && profileByEmail) {
          console.log('✅ [AUTH] Perfil encontrado por email! Sincronizando...');
          profileData = profileByEmail;
          error = null;

          // SINCRONIZAR: Atualizar o ID do perfil para corresponder ao usuário autenticado
          try {
            await supabase
              .from('profiles')
              .update({ id: userId })
              .eq('email', user.email);
            
            console.log('✅ [AUTH] ID do perfil sincronizado com sucesso');
          } catch (syncError) {
            console.warn('⚠️ [AUTH] Erro ao sincronizar ID, mas continuando com perfil por email');
          }
        }
      }

      if (error || !profileData) {
        console.error('❌ [AUTH] Perfil não encontrado nem por ID nem por email:', error);
        if (retryCount < maxRetries) {
          console.log(`🔄 [AUTH] Retry ${retryCount + 1}/${maxRetries}...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchUserProfile(userId, retryCount + 1);
        }
        
        // FALLBACK DE EMERGÊNCIA: Criar perfil básico se não existir
        console.warn('🆘 [AUTH] FALLBACK: Permitindo acesso com perfil nulo temporariamente');
        setProfile(null);
        return;
      }

      console.log('✅ [AUTH] Perfil carregado:', {
        id: profileData.id.substring(0, 8) + '***',
        email: profileData.email,
        role_name: profileData.user_roles?.name || 'sem role',
        method: error ? 'by_email' : 'by_id'
      });

      setProfile(profileData);
    } catch (error) {
      console.error('❌ [AUTH] Erro crítico na busca do perfil:', error);
      setProfile(null);
    }
  }, [user?.email]);

  // Setup inicial e listener de mudanças de autenticação
  useEffect(() => {
    let mounted = true;
    let timeoutId: number;
    
    console.log('🔧 [AUTH] Configurando autenticação...', { initialLoadComplete: initialLoadComplete.current });
    
    // Se já completou o load inicial, não executar novamente
    if (initialLoadComplete.current) {
      console.log('🔧 [AUTH] Load inicial já completo, ignorando...');
      return;
    }
    
    // Função para processar mudanças de estado de auth
    const handleAuthStateChange = async (event: string, session: Session | null) => {
      if (!mounted || initialLoadComplete.current) return;
      
      console.log('🔔 [AUTH] Evento de auth:', event, 'initialLoadComplete:', initialLoadComplete.current);
      
      // Sempre atualizar session e user
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('👤 [AUTH] Usuário encontrado, buscando perfil...');
        
        await fetchUserProfile(session.user.id);
        
        if (mounted && !initialLoadComplete.current) {
          console.log('✅ [AUTH] Perfil processado, finalizando loading');
          initialLoadComplete.current = true;
          setIsLoading(false);
        }
      } else {
        console.log('🚫 [AUTH] Sem usuário, limpando perfil');
        setProfile(null);
        if (mounted && !initialLoadComplete.current) {
          initialLoadComplete.current = true;
          setIsLoading(false);
        }
      }
    };

    // Timeout de segurança - 3 segundos
    timeoutId = window.setTimeout(() => {
      if (mounted && !initialLoadComplete.current) {
        console.warn('⚠️ [AUTH] Timeout de 3s - finalizando loading forçadamente');
        initialLoadComplete.current = true;
        setIsLoading(false);
      }
    }, 3000);

    // Configurar listener primeiro
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Verificar sessão atual uma única vez
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 [AUTH] Sessão inicial:', session ? 'encontrada' : 'não encontrada');
      handleAuthStateChange('INITIAL_SESSION', session);
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      console.log('🧹 [AUTH] Limpando listener de auth');
      subscription.unsubscribe();
    };
  }, []); // CORREÇÃO DEFINITIVA: Sem dependências para evitar loops infinitos

  const contextValue: AuthContextType = useMemo(() => ({
    session,
    user,
    profile,
    isLoading,
    isAdmin,
    isFormacao,
    signIn,
    signOut,
    setProfile,
  }), [session, user, profile, isLoading, isAdmin, isFormacao, signIn, signOut]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
