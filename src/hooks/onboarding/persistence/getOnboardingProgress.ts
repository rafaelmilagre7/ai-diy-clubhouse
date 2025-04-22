
import { supabase } from '@/lib/supabase';
import { OnboardingProgress } from '@/types/onboarding';

/**
 * Busca os dados de progresso de onboarding para um usuário específico
 */
export async function getOnboardingProgress(userId: string): Promise<OnboardingProgress | null> {
  try {
    console.log(`Buscando progresso de onboarding para usuário ${userId}`);
    
    const { data, error } = await supabase
      .from('onboarding')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Erro ao buscar progresso de onboarding:', error);
      throw error;
    }
    
    if (!data) {
      console.log('Nenhum registro de onboarding encontrado para o usuário');
      return null;
    }
    
    console.log('Dados de progresso obtidos com sucesso');
    
    // Processar os campos que podem estar armazenados como strings JSON
    const processedData: OnboardingProgress = {
      ...data,
    };
    
    // Lista de campos que podem estar armazenados como strings JSON
    const jsonFields = [
      'personal_info',
      'professional_info',
      'business_context',
      'business_goals',
      'ai_experience',
      'experience_personalization',
      'complementary_info',
      'business_data'
    ];
    
    // Converter campos de string JSON para objetos
    jsonFields.forEach(field => {
      if (typeof data[field] === 'string' && data[field]) {
        try {
          processedData[field as keyof OnboardingProgress] = JSON.parse(data[field]);
        } catch (e) {
          console.warn(`Falha ao analisar campo ${field} como JSON:`, e);
        }
      }
    });
    
    return processedData;
  } catch (error) {
    console.error('Erro ao buscar progresso de onboarding:', error);
    throw error;
  }
}
