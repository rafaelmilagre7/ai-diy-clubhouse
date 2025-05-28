
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
    
    // Usar a função RPC atualizada para limpar os dados
    const { data, error } = await supabase.rpc('clean_user_onboarding_data', {
      p_user_id: userId
    });
    
    if (error) {
      console.error('❌ Erro ao limpar dados:', error);
      toast.error(`Erro ao limpar dados: ${error.message}`);
      return { success: false, message: error.message };
    }
    
    console.log('✅ Dados limpos com sucesso:', data);
    toast.success('Dados de onboarding limpos com sucesso!', {
      description: data?.message || 'Operação concluída'
    });
    
    return { success: true, message: data?.message || 'Dados limpos com sucesso' };
    
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

// Expor função no console para teste rápido
if (typeof window !== 'undefined') {
  (window as any).cleanRafaelOnboarding = cleanRafaelData;
  (window as any).cleanUserOnboarding = cleanUserOnboardingData;
}
