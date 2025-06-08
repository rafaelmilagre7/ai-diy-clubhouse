
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";
import { cleanupAuthState, redirectToDomain } from "@/utils/authUtils";

interface UseAuthMethodsProps {
  setIsLoading: (isLoading: boolean) => void;
}

export const useAuthMethods = ({ setIsLoading }: UseAuthMethodsProps) => {
  /**
   * Login com email e senha
   */
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Limpar estado de autenticação anterior
      cleanupAuthState();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast.success("Login realizado com sucesso");
      
      // Redirecionar para o domínio correto
      redirectToDomain('/dashboard');
      
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
  
  /**
   * Login como membro (para teste)
   */
  const signInAsMember = async () => {
    return signIn("user@teste.com", "123456");
  };
  
  /**
   * Login como admin (para teste)
   */
  const signInAsAdmin = async () => {
    return signIn("admin@teste.com", "123456");
  };

  /**
   * Login como membro do club (novo usuário de teste)
   */
  const signInAsTestMember = async () => {
    return signIn("membro-teste@viverdeia.ai", "teste-membro-2024");
  };

  /**
   * Login como usuário da formação (novo usuário de teste)
   */
  const signInAsTestFormacao = async () => {
    return signIn("formacao-teste@viverdeia.ai", "teste-formacao-2024");
  };

  /**
   * Login como usuário de teste do club (novo)
   */
  const signInAsClubTest = async () => {
    return signIn("club-teste@viverdeia.ai", "12345");
  };
  
  /**
   * Logout
   */
  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Limpar estado de autenticação
      cleanupAuthState();
      
      // Tentar logout global para garantir limpeza completa
      await supabase.auth.signOut({ scope: 'global' });
      
      toast.success("Logout realizado com sucesso");
      
      // Redirecionamento forçado para garantir limpeza completa do estado
      window.location.href = window.location.origin.includes('localhost')
        ? 'http://localhost:3000/login'
        : 'https://app.viverdeia.ai/login';
        
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error);
      
      // Mesmo em caso de erro, forçar redirecionamento para login
      window.location.href = window.location.origin.includes('localhost')
        ? 'http://localhost:3000/login'
        : 'https://app.viverdeia.ai/login';
      
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    signIn,
    signOut,
    signInAsMember,
    signInAsAdmin,
    signInAsTestMember,
    signInAsTestFormacao,
    signInAsClubTest,
  };
};
