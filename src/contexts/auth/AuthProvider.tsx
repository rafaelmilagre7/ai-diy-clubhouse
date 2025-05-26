
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isFormacao: boolean;
  signOut: () => Promise<void>;
  setProfile: (profile: Profile | null) => void;
  setIsLoading: (loading: boolean) => void;
  signIn: (email: string, password: string) => Promise<any>;
  signInAsMember: () => Promise<any>;
  signInAsAdmin: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isAdmin: false,
  isFormacao: false,
  signOut: async () => {},
  setProfile: () => {},
  setIsLoading: () => {},
  signIn: async () => {},
  signInAsMember: async () => {},
  signInAsAdmin: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificação simples de admin baseada no email
  const isAdmin = user?.email === 'rafael@viverdeia.ai' || 
                  user?.email === 'admin@teste.com' ||
                  user?.email?.includes('@viverdeia.ai') ||
                  profile?.role === 'admin';

  const isFormacao = profile?.role === 'formacao';

  console.log("AuthProvider state:", { 
    user: !!user, 
    profile: !!profile, 
    isAdmin, 
    isFormacao,
    userEmail: user?.email,
    profileRole: profile?.role,
    isLoading
  });

  // Função para carregar perfil com fallback
  const loadUserProfile = async (userId: string, userEmail: string | undefined) => {
    try {
      console.log('AuthProvider: Carregando perfil para', userEmail);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('AuthProvider: Erro ao carregar perfil, criando fallback:', error);
        
        // Criar perfil de fallback baseado no email
        const fallbackRole = userEmail?.includes('@viverdeia.ai') || userEmail === 'admin@teste.com' ? 'admin' : 'member';
        const fallbackProfile: Profile = {
          id: userId,
          email: userEmail || null,
          name: userEmail?.split('@')[0] || 'Usuário',
          role: fallbackRole,
          avatar_url: null,
          created_at: new Date().toISOString()
        };
        
        console.log('AuthProvider: Usando perfil fallback:', fallbackProfile);
        setProfile(fallbackProfile);
        return;
      }

      if (data) {
        console.log('AuthProvider: Perfil carregado com sucesso:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('AuthProvider: Exception ao carregar perfil:', error);
      
      // Fallback mesmo em caso de exception
      const fallbackRole = userEmail?.includes('@viverdeia.ai') || userEmail === 'admin@teste.com' ? 'admin' : 'member';
      const fallbackProfile: Profile = {
        id: userId,
        email: userEmail || null,
        name: userEmail?.split('@')[0] || 'Usuário',
        role: fallbackRole,
        avatar_url: null,
        created_at: new Date().toISOString()
      };
      
      setProfile(fallbackProfile);
    }
  };

  // Métodos de login
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast.success("Login realizado com sucesso");
      return { success: true, data };
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      toast.error("Erro ao fazer login", {
        description: error.message,
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const signInAsMember = async () => {
    return signIn("user@teste.com", "123456");
  };

  const signInAsAdmin = async () => {
    return signIn("admin@teste.com", "123456");
  };

  useEffect(() => {
    let mounted = true;
    
    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;
      
      console.log('AuthProvider: Evento de autenticação:', event);
      
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      if (newSession?.user) {
        // Usar setTimeout para evitar bloqueio
        setTimeout(() => {
          if (mounted) {
            loadUserProfile(newSession.user.id, newSession.user.email);
          }
        }, 0);
      } else {
        setProfile(null);
      }
      
      // Reduzir tempo de loading para melhor UX
      setTimeout(() => {
        if (mounted) setIsLoading(false);
      }, 100);
    });

    // Buscar sessão atual
    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          await loadUserProfile(currentSession.user.id, currentSession.user.email);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('AuthProvider: Erro ao inicializar autenticação:', error);
        if (mounted) setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
      toast.success('Você saiu com sucesso');
    } catch (error) {
      console.error('Erro ao sair:', error);
      toast.error('Ocorreu um erro ao tentar sair');
    }
  };

  // Reduzir tempo de loading screen
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
    <AuthContext.Provider value={{ 
      user, 
      session, 
      profile,
      isLoading, 
      isAdmin, 
      isFormacao,
      signOut,
      setProfile,
      setIsLoading,
      signIn,
      signInAsMember,
      signInAsAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
