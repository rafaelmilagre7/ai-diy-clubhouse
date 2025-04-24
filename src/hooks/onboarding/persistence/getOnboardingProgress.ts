
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
    // Usamos uma asserção de tipo para garantir que as propriedades requeridas existam
    const processedData = {
      id: data.id,  // Garantimos que id não é opcional
      user_id: data.user_id, // Garantimos que user_id não é opcional
      current_step: data.current_step || 'personal',
      completed_steps: data.completed_steps || [],
      is_completed: data.is_completed || false,
      created_at: data.created_at,
      updated_at: data.updated_at,
      personal_info: data.personal_info,
      professional_info: data.professional_info,
      business_context: data.business_context,
      business_goals: data.business_goals,
      ai_experience: data.ai_experience,
      experience_personalization: data.experience_personalization,
      complementary_info: data.complementary_info,
      business_data: data.business_data,
      review: data.review,
      trail_generation: data.trail_generation,
      company_name: data.company_name,
      company_size: data.company_size,
      company_sector: data.company_sector,
      company_website: data.company_website,
      current_position: data.current_position,
      annual_revenue: data.annual_revenue
    } as OnboardingProgress;
    
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
          // Usamos type assertion para resolver o erro de tipo
          (processedData as any)[field] = JSON.parse(data[field]);
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
