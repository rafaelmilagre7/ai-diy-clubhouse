
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { verifyAdminStatus, clearPermissionCache, logSecurityEvent } from '@/contexts/auth/utils/securityUtils';

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
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isAdmin: false,
  signOut: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Função para buscar o perfil do usuário com timeout
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('Buscando perfil para usuário:', userId);
      
      // Timeout de 3 segundos para busca do perfil
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout na busca do perfil')), 3000)
      );
      
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data, error } = await Promise.race([profilePromise, timeoutPromise]);

      if (error) {
        console.warn('Erro ao buscar perfil:', error);
        // Criar perfil fallback se não encontrar
        if (error.code === 'PGRST116') {
          console.log('Perfil não encontrado, criando fallback...');
          return createFallbackProfile(userId);
        }
        return null;
      }

      console.log('Perfil encontrado:', data);
      return data as UserProfile;
    } catch (error) {
      console.error('Erro na busca do perfil:', error);
      // Retornar perfil fallback em caso de erro
      return createFallbackProfile(userId);
    }
  };

  // Criar perfil básico como fallback
  const createFallbackProfile = (userId: string): UserProfile => {
    console.log('Criando perfil fallback para:', userId);
    return {
      id: userId,
      email: user?.email || '',
      name: user?.user_metadata?.name || user?.user_metadata?.full_name || 'Usuário',
      role: 'membro_club',
      avatar_url: null,
      company_name: null,
      industry: null,
      created_at: new Date().toISOString(),
      onboarding_completed: false,
      onboarding_completed_at: null
    };
  };

  // Verificação de admin com timeout
  const checkIsAdmin = async (email?: string | null, userId?: string): Promise<boolean> => {
    if (!email || !userId) {
      return false;
    }

    try {
      console.log('Verificando status de admin para:', email);
      
      // Timeout de 2 segundos para verificação de admin
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout na verificação de admin')), 2000)
      );
      
      const adminPromise = verifyAdminStatus(userId, email);
      const adminStatus = await Promise.race([adminPromise, timeoutPromise]);
      
      console.log('Status de admin verificado:', adminStatus);
      return adminStatus;
    } catch (error) {
      console.warn('Erro ao verificar status de admin:', error);
      // Fallback: verificar se o email é admin baseado em domínio
      const adminEmails = ['rafael@viverdeia.ai', 'admin@viverdeia.ai'];
      return adminEmails.includes(email.toLowerCase());
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Inicializando autenticação...');
        
        // Timeout geral de 5 segundos para toda a inicialização
        const initTimeout = setTimeout(() => {
          if (isMounted) {
            console.warn('Timeout na inicialização, finalizando loading...');
            setIsLoading(false);
          }
        }, 5000);

        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user?.id) {
          console.log('Usuário encontrado, processando perfil...');
          
          // Buscar perfil com fallback
          const userProfile = await fetchUserProfile(currentSession.user.id);
          
          if (isMounted && userProfile) {
            setProfile(userProfile);
            
            // Verificar admin em paralelo (não bloquear o carregamento)
            checkIsAdmin(currentSession.user.email, currentSession.user.id)
              .then(adminStatus => {
                if (isMounted) {
                  setIsAdmin(adminStatus);
                }
              })
              .catch(error => {
                console.warn('Erro na verificação de admin:', error);
                setIsAdmin(false);
              });
          }
        } else {
          console.log('Nenhum usuário logado');
          setProfile(null);
          setIsAdmin(false);
        }
        
        clearTimeout(initTimeout);
        if (isMounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Erro na inicialização:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;
      
      console.log('Evento de autenticação:', event);
      
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      if (event === 'SIGNED_IN' && newSession?.user) {
        console.log('Usuário logado, processando perfil...');
        setIsLoading(true);
        
        try {
          const userProfile = await fetchUserProfile(newSession.user.id);
          
          if (isMounted && userProfile) {
            setProfile(userProfile);
            
            // Verificar admin sem bloquear
            const adminStatus = await checkIsAdmin(newSession.user.email, newSession.user.id);
            if (isMounted) {
              setIsAdmin(adminStatus);
            }
          }
        } catch (error) {
          console.error('Erro ao processar perfil no login:', error);
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('Usuário deslogado');
        setProfile(null);
        setIsAdmin(false);
        clearPermissionCache();
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      clearPermissionCache();
      localStorage.removeItem('permissionsCache');
      
      await supabase.auth.signOut();
      setProfile(null);
      setIsAdmin(false);
      toast.success('Você saiu com sucesso');
    } catch (error) {
      console.error('Erro ao sair:', error);
      toast.error('Ocorreu um erro ao tentar sair');
    }
  };

  // Mostrar loading apenas por no máximo 5 segundos
  if (isLoading) {
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

  return (
    <AuthContext.Provider value={{ user, session, profile, isLoading, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const useIsAdmin = () => {
  const { isAdmin } = useAuth();
  return isAdmin;
};
