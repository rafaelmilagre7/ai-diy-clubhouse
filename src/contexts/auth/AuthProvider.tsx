
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isFormacao: boolean;
  signOut: () => Promise<void>;
  setProfile: (profile: Profile | null) => void;
  setIsLoading: (loading: boolean) => void;
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
  setIsLoading: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificação simples de admin baseada apenas no email
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
    profileRole: profile?.role 
  });

  // Função para carregar perfil do usuário
  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar perfil:', error);
        return;
      }

      if (data) {
        setProfile(data);
        console.log("Perfil carregado:", data);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  useEffect(() => {
    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Evento de autenticação:', event);
      
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      if (newSession?.user) {
        // Carregar perfil do usuário
        await loadUserProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
      
      setIsLoading(false);
    });

    // Buscar sessão atual
    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          await loadUserProfile(currentSession.user.id);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        setIsLoading(false);
      }
    };

    initAuth();

    return () => {
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

  // Mostrar loading apenas enquanto não temos resposta definitiva
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
      setIsLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
