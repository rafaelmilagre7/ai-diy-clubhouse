
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface UseAuthMethodsProps {
  setIsLoading: (loading: boolean) => void;
}

export const useAuthMethods = ({ setIsLoading }: UseAuthMethodsProps) => {
  
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error || undefined };
    } catch (error) {
      return { error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, options?: { name?: string; invite_token?: string }) => {
    try {
      setIsLoading(true);
      
      const metadata: any = {};
      if (options?.name) metadata.name = options.name;
      if (options?.invite_token) metadata.invite_token = options.invite_token;

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: metadata
        }
      });
      
      return { error: error || undefined };
    } catch (error) {
      return { error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      return { success: !error, error: error || null };
    } catch (error) {
      return { success: false, error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  const signInAsMember = async (email: string, password: string) => {
    return signIn(email, password);
  };

  const signInAsAdmin = async (email: string, password: string) => {
    return signIn(email, password);
  };

  return {
    signIn,
    signUp,
    signOut,
    signInAsMember,
    signInAsAdmin,
  };
};
