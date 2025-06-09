
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";
import { clearProfileCache } from "@/hooks/auth/utils/authSessionUtils";

interface UseAuthMethodsProps {
  setIsLoading: (isLoading: boolean) => void;
}

export const useAuthMethods = ({ setIsLoading }: UseAuthMethodsProps) => {
  /**
   * Login otimizado com email e senha
   */
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast.success("Login realizado com sucesso");
      
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
   * Logout otimizado
   */
  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Limpar cache de perfis
      clearProfileCache();
      
      // Logout do Supabase
      await supabase.auth.signOut({ scope: 'global' });
      
      toast.success("Logout realizado com sucesso");
      
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error);
      
      // Mesmo em caso de erro, limpar estado local
      clearProfileCache();
      
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
  };
};
