
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { TEST_ADMIN, TEST_MEMBER } from '@/contexts/auth/constants';
import { toast } from '@/hooks/use-toast';
import { cleanupAuthState } from '@/utils/authUtils';

interface UseAuthMethodsProps {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useAuthMethods = ({ setIsLoading }: UseAuthMethodsProps) => {
  // Função para fazer login com credenciais
  const signIn = async (email?: string, password?: string): Promise<{ error: Error | null }> => {
    try {
      setIsLoading(true);
      
      // Limpar qualquer token existente para evitar conflitos
      cleanupAuthState();
      
      // Tentar realizar logout global preventivo para evitar conflitos de sessão
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (e) {
        // Ignorar erros de logout, pois pode não haver sessão ativa
        console.log("Logout preventivo falhou, continuando com login:", e);
      }
      
      // Se email e senha não forem fornecidos, usar login com Google
      if (!email || !password) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        
        if (error) throw error;
        return { error: null };
      }
      
      // Login com email/senha
      console.log("Tentando login com email/senha", { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      console.log("Login bem-sucedido:", data?.user?.id);
      
      toast({
        title: 'Login realizado com sucesso',
        description: 'Bem-vindo ao VIVER DE IA Club!',
      });
      
      return { error: null };
      
    } catch (error: any) {
      console.error('Erro no login:', error);
      toast({
        title: 'Erro de autenticação',
        description: error.message || 'Falha na autenticação. Verifique suas credenciais.',
        variant: 'destructive',
      });
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  // Função para fazer logout
  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Limpar tokens locais primeiro
      cleanupAuthState();
      
      // Tentar fazer logout global no Supabase
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) throw error;
      
      // Redirecionamento forçado para login com recarregamento completo da página
      window.location.href = '/login';
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error);
      toast({
        title: 'Erro ao sair',
        description: 'Não foi possível fazer logout. Tente novamente.',
        variant: 'destructive',
      });
      
      // Em caso de erro, forçar redirecionamento para login
      window.location.href = '/login';
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
