
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
      return false;
    }
    
    const roleName = profile?.user_roles?.name;
    const permissions = profile?.user_roles?.permissions || {};
    const result = roleName === 'admin' || permissions.all === true;
    
    return result;
  }, [profile?.id, profile?.email, profile?.role_id, profile?.user_roles?.name, profile?.user_roles?.permissions]);
  
  const isFormacao = useMemo(() => {
    const roleName = profile?.user_roles?.name;
    const permissions = profile?.user_roles?.permissions || {};
    
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
        .maybeSingle();

      if (error) {
        console.error('❌ [AUTH] Erro ao buscar perfil:', error);
        setProfile(null);
        return;
      }

      // FRENTE 3: Se não encontrou profile, criar automaticamente COM ALERTAS
      if (!profileData) {
        console.warn('⚠️ [AUTH-CONTEXT-FALLBACK] Profile não existe - criando automaticamente');
        
        // 🚨 ALERTA: Isso NÃO deveria acontecer - trigger deveria ter criado
        const { toast } = await import('sonner');
        toast.warning('Seu perfil está sendo configurado...', {
          description: 'Aguarde enquanto completamos seu cadastro.',
        });
        
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;
        
        // Buscar role padrão
        const { data: defaultRole } = await supabase
          .from('user_roles')
          .select('id')
          .eq('name', 'membro_club')
          .single();
        
        // Criar profile COM LOG
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: user.user.email,
            name: user.user.user_metadata?.name || 
                  user.user.user_metadata?.full_name || 
                  'Usuário',
            role_id: defaultRole?.id,
            onboarding_completed: false,
            is_master_user: true
          })
          .select(`
            *,
            user_roles:role_id (
              id,
              name,
              description,
              permissions
            )
          `)
          .single();
        
        if (!createError && newProfile) {
          console.log('✅ [AUTH-CONTEXT-FALLBACK] Profile criado com sucesso');
          
          // 📊 REGISTRAR EVENTO DE CORREÇÃO MANUAL
          try {
            await supabase.rpc('log_orphan_profile_creation', {
              p_user_id: userId,
              p_created_by: 'AuthContext_fallback',
              p_metadata: {
                email: user.user.email,
                timestamp: new Date().toISOString()
              }
            });
          } catch (err) {
            console.warn('Erro ao logar criação manual:', err);
          }
          
          // CORREÇÃO 2: Criar onboarding_final automaticamente
          try {
            console.log('🎯 [AUTH-CONTEXT-FALLBACK] Criando onboarding_final...');
            const { error: onboardingError } = await supabase
              .from('onboarding_final')
              .insert({
                user_id: userId,
                current_step: 1,
                is_completed: false,
                personal_info: {},
                business_info: {}
              });
            
            if (onboardingError && onboardingError.code !== '23505') { // Ignora duplicatas
              console.error('❌ [AUTH-CONTEXT-FALLBACK] Erro ao criar onboarding_final:', onboardingError);
            } else {
              console.log('✅ [AUTH-CONTEXT-FALLBACK] onboarding_final criado com sucesso');
            }
          } catch (onbError) {
            console.warn('⚠️ [AUTH-CONTEXT-FALLBACK] Erro ao criar onboarding:', onbError);
          }
          
          setProfile(newProfile);
          
          toast.success('Perfil configurado!', {
            description: 'Bem-vindo à plataforma.'
          });
          
          return;
        } else {
          console.error('❌ [AUTH-CONTEXT-FALLBACK] ERRO CRÍTICO ao criar profile:', createError);
          toast.error('Erro ao configurar perfil. Entre em contato com suporte.');
        }
      }

      // Validação crítica do role_id
      if (profileData && !profileData.role_id) {
        console.error('❌ [AUTH] CRÍTICO: profile.role_id está NULL/undefined!', {
          profileId: profileData.id,
          email: profileData.email,
          role_id: profileData.role_id
        });
      }

      setProfile(profileData);
    } catch (error) {
      console.error('❌ [AUTH] Erro na busca do perfil:', error);
      setProfile(null);
    }
  }, []);

  // Setup inicial e listener de mudanças de autenticação
  useEffect(() => {
    // Função para processar mudanças de estado de auth
    const handleAuthStateChange = (event: string, session: Session | null) => {
      
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
      handleAuthStateChange('INITIAL_SESSION', session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Array vazio - executar apenas uma vez

  // ✅ NOVO: Método para forçar re-fetch do profile
  const refetchProfile = useCallback(async () => {
    if (user?.id) {
      console.log('🔄 [AUTH] Re-fetch manual do profile solicitado');
      await fetchUserProfile(user.id);
    }
  }, [user?.id, fetchUserProfile]);

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
    refetchProfile,
  }), [session, user, profile, isLoading, isAdmin, isFormacao, signIn, signOut, refetchProfile]);

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
