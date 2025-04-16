
import { supabase } from '@/lib/supabase';
import { TEST_ADMIN } from './constants';
import { toast } from '@/hooks/use-toast';

export const signInAsTestAdmin = async (): Promise<void> => {
  try {
    console.log("Tentando login como admin de teste usando:", TEST_ADMIN.email);
    
    // Clear any previous session first
    await supabase.auth.signOut();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_ADMIN.email,
      password: TEST_ADMIN.password,
    });
    
    if (error) {
      console.error("Erro ao fazer login como admin:", error);
      throw error;
    }
    
    if (data && data.user) {
      console.log("Login como admin de teste bem-sucedido:", data.user.id);
      
      toast({
        title: "Login como Admin",
        description: "Você está logado como um administrador de teste.",
      });
      
      // Give time for the auth state to update before redirecting
      // This prevents race conditions with the auth state listener
      setTimeout(() => {
        window.location.href = '/';
      }, 800);
    }
  } catch (error) {
    console.error("Erro no login de admin de teste:", error);
    toast({
      title: "Erro no Login",
      description: "Não foi possível fazer login como administrador de teste. Tente novamente.",
      variant: "destructive",
    });
    throw error;
  }
};
