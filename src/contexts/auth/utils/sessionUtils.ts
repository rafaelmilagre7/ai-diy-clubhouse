
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

// Sign out user
export const signOutUser = async (): Promise<void> => {
  try {
    // Verifica se existe uma sessão antes de fazer logout
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session) {
      // Se não houver sessão, limpa o armazenamento local apenas
      localStorage.removeItem('supabase.auth.token');
      window.location.href = '/login';
      
      toast({
        title: 'Sessão encerrada',
        description: 'Você foi desconectado com sucesso.',
      });
      
      return;
    }
    
    // Se houver sessão, faz o logout normal
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      // Se houver erro no logout, tenta solução alternativa
      console.warn('Erro ao fazer logout normal, usando método alternativo:', error);
      localStorage.removeItem('supabase.auth.token');
      window.location.href = '/login';
    }
    
    toast({
      title: 'Logout realizado',
      description: 'Você foi desconectado com sucesso.',
    });
  } catch (error) {
    console.error('Error signing out:', error);
    
    // Em caso de qualquer erro, força o logout limpando o armazenamento local
    localStorage.removeItem('supabase.auth.token');
    window.location.href = '/login';
    
    toast({
      title: 'Logout realizado',
      description: 'Você foi desconectado com sucesso, mas ocorreu um erro interno.',
      variant: 'default',
    });
  }
};
