
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
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

  // Função para buscar perfil do usuário
  const fetchUserProfile = useCallback(async (userId: string, retryCount: number = 0) => {
    const maxRetries = 3;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    try {
      console.log('🔍 [AUTH] Iniciando busca do perfil para:', userId.substring(0, 8) + '***', `(tentativa ${retryCount + 1})`);
      
      const { data: profileData, error } = await supabase
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

      if (error) {
        console.error('❌ [AUTH] Erro ao buscar perfil:', error);
        setProfile(null);
        return;
      }

      // VALIDAÇÃO CRÍTICA e RETRY para role_id
      if (!profileData.role_id || !uuidRegex.test(profileData.role_id)) {
        console.error('🚨 [AUTH] CRÍTICO: profile.role_id inválido!', {
          profileId: profileData.id,
          email: profileData.email,
          role_id: profileData.role_id,
          is_valid_uuid: profileData.role_id ? uuidRegex.test(profileData.role_id) : false,
          legacy_role: profileData.role,
          retry_count: retryCount
        });

        // RETRY se role_id for null/inválido e ainda temos tentativas
        if (retryCount < maxRetries) {
          console.log(`🔄 [AUTH] Retry ${retryCount + 1}/${maxRetries} para buscar role_id válido...`);
          await new Promise(resolve => setTimeout(resolve, 1500 * (retryCount + 1))); // Backoff exponencial
          return fetchUserProfile(userId, retryCount + 1);
        } else {
          console.error('❌ [AUTH] Máximo de retries atingido - profile sem role_id válido');
          setProfile(profileData); // Setar mesmo assim para não bloquear completamente
          return;
        }
      }

      console.log('✅ [AUTH] profile.role_id válido carregado:', profileData.role_id);

      console.log('✅ [AUTH] Perfil completo carregado:', {
        id: profileData.id.substring(0, 8) + '***',
        email: profileData.email?.substring(0, 3) + '***@***.' + profileData.email?.split('.').pop(),
        role_id: profileData.role_id,
        role_name: profileData.user_roles?.name || profileData.role,
        has_user_roles: !!profileData.user_roles,
        retry_count: retryCount
      });

      setProfile(profileData);
    } catch (error) {
      console.error('❌ [AUTH] Erro na busca do perfil:', error);
      
      // Retry em caso de erro de rede se ainda temos tentativas
      if (retryCount < maxRetries) {
        console.log(`🔄 [AUTH] Retry ${retryCount + 1}/${maxRetries} após erro...`);
        await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
        return fetchUserProfile(userId, retryCount + 1);
      }
      
      setProfile(null);
    }
  }, []);

  // Setup inicial e listener de mudanças de autenticação
  useEffect(() => {
    let mounted = true;
    let timeoutId: number;
    
    console.log('🔧 [AUTH] Configurando autenticação...');
    
    // Função para processar mudanças de estado de auth
    const handleAuthStateChange = async (event: string, session: Session | null) => {
      if (!mounted) return;
      
      console.log('🔔 [AUTH] Evento de auth:', event);
      
      // Sempre atualizar session e user
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('👤 [AUTH] Usuário encontrado, buscando perfil...');
        setIsLoading(true);
        
        await fetchUserProfile(session.user.id);
        
        if (mounted) {
          console.log('✅ [AUTH] Perfil processado, terminando loading');
          setIsLoading(false);
        }
      } else {
        console.log('🚫 [AUTH] Sem usuário, limpando perfil');
        setProfile(null);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Timeout de segurança mais agressivo
    timeoutId = window.setTimeout(() => {
      if (mounted) {
        console.warn('⚠️ [AUTH] Timeout de 3s - finalizando loading');
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
  }, [fetchUserProfile]);

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
