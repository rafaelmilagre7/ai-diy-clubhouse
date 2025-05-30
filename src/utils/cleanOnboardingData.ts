
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const cleanUserOnboardingData = async (userEmail: string) => {
  try {
    console.log(`🧹 Iniciando limpeza dos dados de onboarding para: ${userEmail}`);
    
    // Buscar o ID do usuário pelo email
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userEmail)
      .single();
    
    if (profileError || !userProfile) {
      console.error('❌ Usuário não encontrado:', profileError);
      toast.error('Usuário não encontrado');
      return { success: false, message: 'Usuário não encontrado' };
    }
    
    const userId = userProfile.id;
    console.log(`👤 ID do usuário encontrado: ${userId}`);
    
    try {
      // Verificar se existe função RPC para limpeza
      const { error: rpcError } = await supabase.rpc('clean_user_onboarding_data', {
        p_user_id: userId
      });
      
      if (rpcError) {
        console.warn('⚠️ Função RPC não disponível, fazendo limpeza manual:', rpcError);
        
        // Limpeza manual das tabelas de onboarding
        const { error: quickError } = await supabase
          .from('quick_onboarding')
          .delete()
          .eq('user_id', userId);
          
        if (quickError) {
          console.warn('⚠️ Erro ao limpar quick_onboarding:', quickError);
        }
        
        const { error: progressError } = await supabase
          .from('onboarding_progress')
          .delete()
          .eq('user_id', userId);
          
        if (progressError) {
          console.warn('⚠️ Erro ao limpar onboarding_progress:', progressError);
        }
        
        console.log('✅ Limpeza manual concluída');
        toast.success('Dados de onboarding limpos manualmente');
        return { success: true, message: 'Dados limpos manualmente' };
      }
      
      console.log('✅ Dados limpos via RPC com sucesso');
      toast.success('Dados de onboarding limpos com sucesso!');
      return { success: true, message: 'Dados limpos com sucesso' };
      
    } catch (error: any) {
      console.error('❌ Erro na operação RPC, tentando limpeza manual:', error);
      
      // Fallback para limpeza manual
      try {
        const { error: quickError } = await supabase
          .from('quick_onboarding')
          .delete()
          .eq('user_id', userId);
          
        const { error: progressError } = await supabase
          .from('onboarding_progress')
          .delete()
          .eq('user_id', userId);
          
        console.log('✅ Limpeza de fallback concluída');
        toast.success('Dados limpos via fallback');
        return { success: true, message: 'Dados limpos via fallback' };
        
      } catch (fallbackError: any) {
        console.error('❌ Erro no fallback:', fallbackError);
        toast.error('Erro na limpeza de dados');
        return { success: false, message: fallbackError.message };
      }
    }
    
  } catch (error: any) {
    console.error('❌ Erro inesperado:', error);
    toast.error('Erro inesperado ao limpar dados');
    return { success: false, message: error.message };
  }
};

// Função específica para o usuário rafael@viverdeia.ai (para teste)
export const cleanRafaelData = () => {
  return cleanUserOnboardingData('rafael@viverdeia.ai');
};

// Expor função no console para teste rápido apenas em desenvolvimento
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).cleanRafaelOnboarding = cleanRafaelData;
  (window as any).cleanUserOnboarding = cleanUserOnboardingData;
}
