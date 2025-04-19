
import { useState } from 'react';
import { supabase, TEST_ADMIN, TEST_MEMBER } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface UseAuthMethodsProps {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useAuthMethods = ({ setIsLoading }: UseAuthMethodsProps) => {
  // Função para fazer login com credenciais
  const signIn = async (email?: string, password?: string) => {
    try {
      setIsLoading(true);
      
      // Se email e senha não forem fornecidos, usar login com Google
      if (!email || !password) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        
        if (error) throw error;
        return;
      }
      
      // Login com email/senha
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: 'Login realizado com sucesso',
        description: 'Bem-vindo ao VIVER DE IA Club!',
      });
      
    } catch (error: any) {
      console.error('Erro no login:', error);
      toast({
        title: 'Erro de autenticação',
        description: error.message || 'Falha na autenticação. Verifique suas credenciais.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Função para fazer logout
  const signOut = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      window.location.href = '/auth';
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error);
      toast({
        title: 'Erro ao sair',
        description: 'Não foi possível fazer logout. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Login de teste como membro (apenas ambiente de desenvolvimento)
  const signInAsMember = async () => {
    if (process.env.NODE_ENV !== 'development') {
      console.error('Login de teste disponível apenas em ambiente de desenvolvimento');
      return;
    }
    
    try {
      setIsLoading(true);
      await signIn(TEST_MEMBER.email, TEST_MEMBER.password);
    } catch (error) {
      console.error('Erro ao fazer login como membro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Login de teste como admin (apenas ambiente de desenvolvimento)
  const signInAsAdmin = async () => {
    if (process.env.NODE_ENV !== 'development') {
      console.error('Login de teste disponível apenas em ambiente de desenvolvimento');
      return;
    }
    
    try {
      setIsLoading(true);
      await signIn(TEST_ADMIN.email, TEST_ADMIN.password);
    } catch (error) {
      console.error('Erro ao fazer login como admin:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signIn,
    signOut,
    signInAsMember,
    signInAsAdmin,
  };
};
