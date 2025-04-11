
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

// Sign out user
export const signOutUser = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
    
    toast({
      title: 'Logout realizado',
      description: 'Você foi desconectado com sucesso.',
    });
  } catch (error) {
    console.error('Error signing out:', error);
    toast({
      title: 'Erro ao fazer logout',
      description: 'Ocorreu um erro ao tentar fazer logout. Por favor, tente novamente.',
      variant: 'destructive',
    });
  }
};
