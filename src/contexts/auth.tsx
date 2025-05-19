import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { UserProfile } from "@/lib/supabase/types";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isFormacao: boolean;
  isLoading: boolean;
  session: Session | null;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInAsMember: () => Promise<void>;
  signInAsAdmin: () => Promise<void>;
  setProfile: (profile: UserProfile | null) => void;
  setIsLoading: (loading: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isAdmin: false,
  isFormacao: false,
  isLoading: true,
  session: null,
  signOut: async () => {},
  signIn: async () => {},
  signInAsMember: async () => {},
  signInAsAdmin: async () => {},
  setProfile: () => {},
  setIsLoading: () => {},
});

// Hook para usar o contexto de autenticação
export const useAuth = () => useContext(AuthContext);

// Provedor do contexto de autenticação
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Computar papéis
  const isAdmin = !!profile?.role === !!profile?.role && ['admin'].includes(profile?.role!);
  const isFormacao = !!profile?.role === !!profile?.role && ['admin', 'formacao'].includes(profile?.role!);
  
  // Checar sessão quando o componente montar
  useEffect(() => {
    console.log("AuthProvider: Verificando sessão de autenticação");
    
    const checkSession = async () => {
      try {
        // Em ambiente de desenvolvimento, permitir acesso sem autenticação
        if (import.meta.env.DEV) {
          console.log("AuthProvider: Ambiente de desenvolvimento detectado. Permitindo acesso como mock.");
          const mockUser = {
            id: 'dev-user-1',
            email: 'dev@example.com',
          } as User;
          
          const mockProfile = {
            id: 'dev-profile-1',
            user_id: 'dev-user-1',
            name: 'Desenvolvimento',
            email: 'dev@example.com',
            role: 'admin',
          } as UserProfile;
          
          setUser(mockUser);
          setProfile(mockProfile);
          setIsLoading(false);
          return;
        }
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("AuthProvider: Erro ao verificar sessão:", error.message);
          setIsLoading(false);
          return;
        }
        
        console.log("AuthProvider: Sessão verificada:", !!data.session);
        
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
          
          // Buscar perfil do usuário
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", data.session.user.id)
            .single();
            
          if (profileError) {
            console.error("AuthProvider: Erro ao buscar perfil:", profileError.message);
          } else if (profileData) {
            console.log("AuthProvider: Perfil carregado:", profileData.id);
            setProfile(profileData as UserProfile);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("AuthProvider: Erro inesperado:", error);
        setIsLoading(false);
      }
    };
    
    // Assinar eventos de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("AuthProvider: Evento de autenticação:", event);
        
        if (session) {
          console.log("AuthProvider: Usuário autenticado:", session.user.id);
          setSession(session);
          setUser(session.user);
          
          // Se LOGIN ou TOKEN_REFRESHED, buscar perfil atualizado
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("*")
              .eq("user_id", session.user.id)
              .single();
              
            if (profileError && event === 'SIGNED_IN') {
              console.error("AuthProvider: Erro ao buscar perfil após login:", profileError.message);
            } else if (profileData) {
              setProfile(profileData as UserProfile);
            }
          }
        } else {
          // Limpar estado se usuário deslogar
          if (event === 'SIGNED_OUT') {
            console.log("AuthProvider: Usuário deslogou");
            setUser(null);
            setProfile(null);
            setSession(null);
          }
        }
        
        // Se não estiver mais carregando, atualizar estado
        if (isLoading) setIsLoading(false);
      }
    );
    
    // Verificar sessão inicial
    checkSession();
    
    // Limpar subscriber ao desmontar
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // Função para logout
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("AuthProvider: Erro ao deslogar:", error.message);
        toast.error("Erro ao deslogar. Tente novamente.");
      } else {
        console.log("AuthProvider: Usuário deslogou com sucesso");
        setUser(null);
        setProfile(null);
        setSession(null);
        toast.success("Você foi desconectado com sucesso!");
      }
    } catch (error) {
      console.error("AuthProvider: Erro inesperado ao deslogar:", error);
      toast.error("Ocorreu um erro inesperado. Tente novamente.");
    }
  };
  
  // Funções de login/signin que estão faltando
  const signIn = async (email: string, password: string) => {
    try {
      // Se estamos usando Google (email e senha vazios)
      if (!email && !password) {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          }
        });
        
        if (error) throw error;
        
        // O redirecionamento será manipulado pelo próprio supabase
        return;
      }
      
      // Login com email e senha
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      setUser(data.user);
      setSession(data.session);
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      toast.error(error.message || "Falha ao fazer login");
      throw error;
    }
  };
  
  // Implementação do login como membro (para testes)
  const signInAsMember = async () => {
    try {
      await signIn("member@teste.com", "password123");
      toast.success("Login como membro realizado com sucesso");
    } catch (error) {
      toast.error("Erro ao fazer login como membro");
      throw error;
    }
  };
  
  // Implementação do login como admin (para testes)
  const signInAsAdmin = async () => {
    try {
      await signIn("admin@teste.com", "admin123");
      toast.success("Login como admin realizado com sucesso");
    } catch (error) {
      toast.error("Erro ao fazer login como admin");
      throw error;
    }
  };
  
  // Contexto autenticação atualizado com as novas funções
  const value = {
    user,
    profile,
    isAdmin,
    isFormacao,
    isLoading,
    session,
    signOut,
    signIn,
    signInAsMember,
    signInAsAdmin,
    setProfile,
    setIsLoading,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
