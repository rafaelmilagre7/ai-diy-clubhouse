
import { supabase } from '@/lib/supabase';
import { TEST_MEMBER } from './constants';
import { toast } from '@/hooks/use-toast';

export const signInAsTestMember = async (): Promise<void> => {
  try {
    console.log("Tentando login como membro de teste usando:", TEST_MEMBER.email);
    
    // Clear any previous session first
    await supabase.auth.signOut();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_MEMBER.email,
      password: TEST_MEMBER.password,
    });
    
    if (error) {
      console.error("Erro ao fazer login como membro:", error);
      throw error;
    }
    
    if (data && data.user) {
      console.log("Login como membro de teste bem-sucedido:", data.user.id);
      
      // Redirect to home page to trigger proper routing
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
      
      toast({
        title: "Login como Membro",
        description: "Você está logado como um membro de teste.",
      });
    }
  } catch (error) {
    console.error("Erro no login de membro de teste:", error);
    toast({
      title: "Erro no Login",
      description: "Não foi possível fazer login como membro de teste. Tente novamente.",
      variant: "destructive",
    });
    throw error;
  }
};
