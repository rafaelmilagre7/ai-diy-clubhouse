
import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  company_name?: string;
  industry?: string;
  role_id?: string;
  role?: string;
  user_roles?: {
    name: string;
  };
  created_at: string;
  onboarding_completed: boolean;
  onboarding_completed_at?: string;
}

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  isFormacao: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: Error }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error?: Error }>;
  signOut: () => Promise<{ success: boolean; error?: Error | null }>;
  refreshProfile: () => Promise<void>;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast({
          title: "Erro no login",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro inesperado');
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {}
        }
      });

      if (error) {
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro inesperado');
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { success: false, error };
      }

      setUser(null);
      setProfile(null);
      return { success: true, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro inesperado');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select(`
            *,
            user_roles (
              name
            )
          `)
          .eq('id', user.id)
          .single();
          
        if (!profileError && profile) {
          setProfile(profile);
        }
      } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
      }
    }
  };

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        
        setUser(user);
        
        if (user) {
          // Get profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select(`
              *,
              user_roles (
                name
              )
            `)
            .eq('id', user.id)
            .single();
            
          if (profileError) {
            console.error('Profile error:', profileError);
          } else {
            setProfile(profile);
          }
        }
      } catch (error: any) {
        console.error('Auth error:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Get profile for new user
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select(`
              *,
              user_roles (
                name
              )
            `)
            .eq('id', session.user.id)
            .single();
            
          if (!profileError) {
            setProfile(profile);
          }
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [toast]);

  const isAdmin = profile?.user_roles?.name === 'admin' || profile?.role === 'admin';
  const isFormacao = profile?.user_roles?.name === 'formacao' || profile?.role === 'formacao';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        error,
        isAdmin,
        isFormacao,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        setProfile,
        setIsLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
