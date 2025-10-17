
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

  // Estados derivados memoizados com logs robustos
  const isAdmin = useMemo(() => {
    if (!profile) {
      console.log('⚠️ [AUTH] isAdmin: false (perfil não carregado ainda)');
      return false;
    }
    
    const roleName = profile?.user_roles?.name;
    const permissions = profile?.user_roles?.permissions || {};
    const result = roleName === 'admin' || permissions.all === true;
    
    console.log('🔐 [AUTH] Verificação isAdmin:', {
      userId: profile.id?.substring(0, 8) + '***',
      email: profile.email?.substring(0, 3) + '***',
      roleName,
      hasUserRoles: !!profile.user_roles,
      roleId: profile.role_id,
      permissionsAll: permissions.all,
      result,
      timestamp: new Date().toISOString()
    });
    
    return result;
  }, [profile?.id, profile?.email, profile?.role_id, profile?.user_roles?.name, profile?.user_roles?.permissions]);
  
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
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      console.log('🔍 [AUTH] Iniciando busca do perfil para:', userId.substring(0, 8) + '***');
      
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

      // Validação crítica do role_id
      if (!profileData.role_id) {
        console.error('❌ [AUTH] CRÍTICO: profile.role_id está NULL/undefined!', {
          profileId: profileData.id,
          email: profileData.email,
          role_id: profileData.role_id,
          legacy_role: profileData.role
        });
      } else {
        console.log('✅ [AUTH] profile.role_id carregado:', profileData.role_id);
      }

      console.log('✅ [AUTH] Perfil carregado:', {
        id: profileData.id.substring(0, 8) + '***',
        email: profileData.email?.substring(0, 3) + '***@***.' + profileData.email?.split('.').pop(),
        role_id: profileData.role_id,
        role_name: profileData.user_roles?.name || profileData.role,
        has_user_roles: !!profileData.user_roles
      });

      setProfile(profileData);
    } catch (error) {
      console.error('❌ [AUTH] Erro na busca do perfil:', error);
      setProfile(null);
    }
  }, []);

  // Setup inicial e listener de mudanças de autenticação
  useEffect(() => {
    console.log('🔧 [AUTH] Configurando autenticação...');
    
    // Função para processar mudanças de estado de auth
    const handleAuthStateChange = (event: string, session: Session | null) => {
      console.log('🔔 [AUTH] Evento de auth:', event);
      
      // Sempre atualizar session e user
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Buscar perfil apenas se temos um usuário
        fetchUserProfile(session.user.id);
      } else {
        // Limpar perfil se não há usuário
        setProfile(null);
      }
      
      // Terminar loading
      setIsLoading(false);
    };

    // Configurar listener primeiro
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Verificar sessão atual uma única vez
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 [AUTH] Sessão inicial:', session ? 'encontrada' : 'não encontrada');
      handleAuthStateChange('INITIAL_SESSION', session);
    });

    return () => {
      console.log('🧹 [AUTH] Limpando listener de auth');
      subscription.unsubscribe();
    };
  }, []); // Array vazio - executar apenas uma vez

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
