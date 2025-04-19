
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

// Sign out user
export const signOutUser = async (): Promise<void> => {
  try {
    // Limpa o token e realiza logout do Supabase
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Erro ao realizar logout:', error);
      // Em caso de erro, força logout limpando armazenamento local
      localStorage.removeItem('sb-zotzvtepvpnkcoobdubt-auth-token');
      window.location.href = '/auth';
    } else {
      // Logout bem-sucedido, redireciona para a página de login
      window.location.href = '/auth';
    }
    
    toast({
      title: 'Logout realizado',
      description: 'Você foi desconectado com sucesso.',
    });
  } catch (error) {
    console.error('Erro ao realizar logout:', error);
    
    // Em caso de exceção, força logout limpando armazenamento local
    localStorage.removeItem('sb-zotzvtepvpnkcoobdubt-auth-token');
    window.location.href = '/auth';
    
    toast({
      title: 'Logout realizado',
      description: 'Você foi desconectado com sucesso, mas ocorreu um erro interno.',
      variant: 'default',
    });
  }
};
