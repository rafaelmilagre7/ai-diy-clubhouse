
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';
import { AuthContextType } from './auth/types';

// Valor padrão do contexto
const defaultContext: AuthContextType = {
  session: null,
  user: null,
  profile: null,
  isAdmin: false,
  isLoading: true,
  
  signIn: async () => {},
  signOut: async () => {},
  signInAsMember: async () => {},
  signInAsAdmin: async () => {},
  
  setSession: () => {},
  setUser: () => {},
  setProfile: () => {},
  setIsLoading: () => {}
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar se o usuário é admin
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Se o usuário fizer logout, limpar o perfil
        if (!session) {
          setProfile(null);
        }
      }
    );

    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Se não há sessão, podemos parar de carregar
      if (!session) {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Carregar perfil do usuário quando o usuário estiver disponível
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setProfile(data as UserProfile);
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      loadProfile();
    }
  }, [user]);

  // Função de login com email/senha
  const signIn = async (email?: string, password?: string) => {
    try {
      setIsLoading(true);
      
      if (email && password) {
        // Login com email e senha
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
      } else {
        // Login com Google (ou outro provider)
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google'
        });
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Função de logout
  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Funções para teste (login como membro ou admin)
  const signInAsMember = async () => {
    await signIn('member@teste.com', 'password123');
  };

  const signInAsAdmin = async () => {
    await signIn('admin@teste.com', 'password123');
  };

  const value = {
    session,
    user,
    profile,
    isAdmin,
    isLoading,
    signIn,
    signOut,
    signInAsMember,
    signInAsAdmin,
    setSession,
    setUser,
    setProfile,
    setIsLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
