
import React, { useState, useEffect, useContext, createContext } from 'react';
import { AuthContextType } from './types';
import { cleanupAuthState } from './utils/authUtils';
import { AuthStateManager } from './managers/AuthStateManager';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { UserProfile } from '@/lib/supabase/types';

// Usuários de teste para login rápido
export const TEST_MEMBER = {
  email: 'member@teste.com',
  password: 'password123'
};

export const TEST_ADMIN = {
  email: 'admin@teste.com',
  password: 'admin123'
};

// Criar o contexto de autenticação
export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isAdmin: false,
  isFormacao: false,
  setProfile: () => {},
  setIsLoading: () => {},
  setUser: () => {},
  setSession: () => {},
  setIsAdmin: () => {},
  signIn: async () => {},
  signInAsMember: async () => {},
  signInAsAdmin: async () => {},
  signOut: async () => {}
});

// Hook para acessar o contexto de autenticação
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFormacao, setIsFormacao] = useState(false);

  // Efeito para verificar se o usuário é formação com base no perfil
  useEffect(() => {
    if (profile) {
      // Verifica se o usuário tem papel "formacao"
      const userIsFormacao = profile.role === 'formacao' || 
                          (profile.user_roles && profile.user_roles.name === 'formacao');
      
      setIsFormacao(userIsFormacao);
    } else {
      setIsFormacao(false);
    }
  }, [profile]);

  // Implementação do login
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
      await signIn(TEST_MEMBER.email, TEST_MEMBER.password);
      toast.success("Login como membro realizado com sucesso");
    } catch (error) {
      toast.error("Erro ao fazer login como membro");
      throw error;
    }
  };
  
  // Implementação do login como admin (para testes)
  const signInAsAdmin = async () => {
    try {
      await signIn(TEST_ADMIN.email, TEST_ADMIN.password);
      toast.success("Login como admin realizado com sucesso");
    } catch (error) {
      toast.error("Erro ao fazer login como admin");
      throw error;
    }
  };
  
  // Implementação do logout
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsAdmin(false);
      setIsFormacao(false);
      toast.success("Logout realizado com sucesso");
    } catch (error: any) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao fazer logout");
      throw error;
    }
  };

  // Estado de autenticação já é gerenciado no AuthStateManager
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session, 
        profile, 
        isLoading, 
        isAdmin, 
        isFormacao, 
        signOut, 
        signIn,
        signInAsMember,
        signInAsAdmin,
        setProfile, 
        setIsLoading,
        setUser,
        setSession,
        setIsAdmin 
      }}
    >
      <AuthStateManager>
        {children}
      </AuthStateManager>
    </AuthContext.Provider>
  );
};

export default AuthProvider;
