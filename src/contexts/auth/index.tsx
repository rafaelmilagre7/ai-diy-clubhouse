
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

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

  // Função para buscar perfil do usuário
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    console.log(`🔍 [AUTH DEBUG] Iniciando busca de perfil para usuário: ${userId}`);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ [AUTH DEBUG] Erro ao buscar perfil:', error);
        return null;
      }

      console.log('✅ [AUTH DEBUG] Perfil encontrado:', data);
      return data as UserProfile;
    } catch (error) {
      console.error('💥 [AUTH DEBUG] Erro inesperado na busca do perfil:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log('🚀 [AUTH DEBUG] Iniciando configuração de autenticação');
    
    let isMounted = true;

    const initializeAuth = async () => {
      console.log('⏳ [AUTH DEBUG] Verificando sessão atual...');
      
      try {
        // Verificar sessão atual
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        console.log('📄 [AUTH DEBUG] Sessão obtida:', currentSession ? 'ENCONTRADA' : 'NÃO ENCONTRADA');
        
        if (!isMounted) {
          console.log('🛑 [AUTH DEBUG] Componente desmontado, abortando');
          return;
        }
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user?.id) {
          console.log(`👤 [AUTH DEBUG] Usuário encontrado: ${currentSession.user.email}`);
          
          // Buscar perfil do usuário
          const userProfile = await fetchUserProfile(currentSession.user.id);
          
          if (isMounted) {
            console.log('📊 [AUTH DEBUG] Definindo perfil:', userProfile);
            setProfile(userProfile);
            
            const adminStatus = userProfile?.role === 'admin';
            console.log(`🔐 [AUTH DEBUG] Status admin: ${adminStatus} (role: ${userProfile?.role})`);
            setIsAdmin(adminStatus);
          }
        } else {
          console.log('❌ [AUTH DEBUG] Nenhum usuário na sessão');
          setProfile(null);
          setIsAdmin(false);
        }
        
        if (isMounted) {
          console.log('✅ [AUTH DEBUG] Inicialização concluída, removendo loading');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('💥 [AUTH DEBUG] Erro na inicialização:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log(`🔄 [AUTH DEBUG] Evento de autenticação: ${event}`);
      console.log('📄 [AUTH DEBUG] Nova sessão:', newSession ? 'RECEBIDA' : 'NULA');
      
      if (!isMounted) {
        console.log('🛑 [AUTH DEBUG] Componente desmontado no listener, abortando');
        return;
      }
      
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      if (event === 'SIGNED_IN' && newSession?.user) {
        console.log(`🎉 [AUTH DEBUG] Login detectado para: ${newSession.user.email}`);
        setIsLoading(true);
        
        const userProfile = await fetchUserProfile(newSession.user.id);
        
        if (isMounted) {
          console.log('📊 [AUTH DEBUG] Definindo perfil no listener:', userProfile);
          setProfile(userProfile);
          
          const adminStatus = userProfile?.role === 'admin';
          console.log(`🔐 [AUTH DEBUG] Status admin no listener: ${adminStatus} (role: ${userProfile?.role})`);
          setIsAdmin(adminStatus);
          setIsLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 [AUTH DEBUG] Logout detectado');
        setProfile(null);
        setIsAdmin(false);
        setIsLoading(false);
      }
    });

    return () => {
      console.log('🧹 [AUTH DEBUG] Limpando AuthContext');
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log('🚪 [AUTH DEBUG] Iniciando logout');
    try {
      await supabase.auth.signOut();
      setProfile(null);
      setIsAdmin(false);
      console.log('✅ [AUTH DEBUG] Logout concluído');
      toast.success('Você saiu com sucesso');
    } catch (error) {
      console.error('❌ [AUTH DEBUG] Erro ao sair:', error);
      toast.error('Ocorreu um erro ao tentar sair');
    }
  };

  // Log do estado atual a cada mudança
  useEffect(() => {
    console.log('📊 [AUTH DEBUG] Estado atual:', {
      hasUser: !!user,
      userEmail: user?.email,
      hasProfile: !!profile,
      profileRole: profile?.role,
      isAdmin,
      isLoading
    });
  }, [user, profile, isAdmin, isLoading]);

  // Mostrar loading apenas enquanto carrega
  if (isLoading) {
    console.log('⏳ [AUTH DEBUG] Mostrando tela de loading');
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
