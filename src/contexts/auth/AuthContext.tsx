
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  isLoading: boolean;
  isAdmin: boolean;
  isFormacao: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signInAsMember: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<{ success: boolean; error?: any }>;
  refreshSession: () => Promise<void>;
  setProfile: React.Dispatch<React.SetStateAction<any | null>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFormacao, setIsFormacao] = useState(false);

  // Função simples para carregar perfil do usuário
  const loadUserProfile = async (currentUser: User) => {
    try {
      // Buscar perfil no banco de dados
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Erro ao buscar perfil:", error);
        setProfile({ id: currentUser.id, email: currentUser.email, role: 'member' });
        setIsAdmin(false);
        setIsFormacao(false);
        return;
      }

      // Se não encontrou perfil, criar um básico
      if (!profileData) {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.user_metadata?.name || currentUser.user_metadata?.full_name,
            role: 'member'
          })
          .select()
          .single();

        if (insertError) {
          console.error("Erro ao criar perfil:", insertError);
          setProfile({ id: currentUser.id, email: currentUser.email, role: 'member' });
          setIsAdmin(false);
          setIsFormacao(false);
          return;
        }

        setProfile(newProfile);
        setIsAdmin(newProfile.role === 'admin');
        setIsFormacao(newProfile.role === 'formacao');
        return;
      }

      // Verificar admin
      const trustedEmails = ['rafael@viverdeia.ai', 'admin@viverdeia.ai'];
      if (process.env.NODE_ENV === 'development') {
        trustedEmails.push('admin@teste.com');
      }

      const isAdminByEmail = trustedEmails.includes(currentUser.email?.toLowerCase() || '');
      const isAdminByRole = profileData.role === 'admin';
      const adminStatus = isAdminByEmail || isAdminByRole;

      if (isAdminByEmail && !isAdminByRole) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', currentUser.id);

        if (!updateError) {
          profileData.role = 'admin';
        }
      }

      setProfile(profileData);
      setIsAdmin(adminStatus);
      setIsFormacao(profileData.role === 'formacao');

    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      setProfile({ 
        id: currentUser.id, 
        email: currentUser.email, 
        role: 'member' 
      });
      setIsAdmin(false);
      setIsFormacao(false);
    }
  };

  // Login simples
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast.error('Erro ao fazer login: ' + error.message);
        return { error };
      }

      toast.success('Login realizado com sucesso!');
      return { error: null };
    } catch (error) {
      toast.error('Erro interno no login');
      return { error };
    }
  };

  // Cadastro simples
  const signInAsMember = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        toast.error('Erro ao cadastrar: ' + error.message);
        return { error };
      }

      toast.success('Cadastro realizado com sucesso!');
      return { error: null };
    } catch (error) {
      toast.error('Erro interno no cadastro');
      return { error };
    }
  };

  // Logout simples
  const signOut = async (): Promise<{ success: boolean; error?: any }> => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error('Erro ao fazer logout');
        return { success: false, error };
      }

      setUser(null);
      setSession(null);
      setProfile(null);
      setIsAdmin(false);
      setIsFormacao(false);

      toast.success('Logout realizado com sucesso');
      return { success: true };

    } catch (error) {
      toast.error('Erro no logout');
      return { success: false, error };
    }
  };

  // Renovar sessão
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao renovar sessão:", error);
      await signOut();
    }
  };

  // Inicialização simples
  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserProfile(session.user);
        }
      } catch (error) {
        console.error("Erro ao obter sessão inicial:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserProfile(session.user);
        } else {
          setProfile(null);
          setIsAdmin(false);
          setIsFormacao(false);
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      isLoading,
      isAdmin,
      isFormacao,
      signIn,
      signInAsMember,
      signOut,
      refreshSession,
      setProfile,
      setIsLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
