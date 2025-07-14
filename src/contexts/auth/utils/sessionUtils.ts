
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

// Sign out user
export const signOutUser = async (): Promise<void> => {
  try {
    console.log('🚪 [AUTH] Iniciando logout seguro');
    
    // 1. Limpar todos os dados de auth do localStorage
    const authKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('sb-') || key.includes('auth') || key.includes('supabase')
    );
    
    authKeys.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn(`Erro ao limpar ${key}:`, e);
      }
    });
    
    // 2. Realizar logout no Supabase
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    
    if (error) {
      console.error('Erro no logout do Supabase:', error);
      // Continuar mesmo com erro, pois já limpamos o localStorage
    }
    
    // 3. Aguardar um pouco para garantir limpeza
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // 4. Redirecionar para login
    window.location.href = '/login';
    
    toast({
      title: 'Logout realizado',
      description: 'Você foi desconectado com sucesso.',
    });
    
  } catch (error) {
    console.error('Erro crítico no logout:', error);
    
    // Fallback: limpeza forçada e redirecionamento
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Erro ao limpar storage:', e);
    }
    
    window.location.href = '/login';
    
    toast({
      title: 'Logout realizado',
      description: 'Desconectado com sucesso (modo de recuperação).',
      variant: 'default',
    });
  }
};
