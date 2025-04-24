
import { supabase } from "@/lib/supabase";
import { ProfessionalDataInput } from "@/types/onboarding";
import { normalizeField } from "../utils/dataNormalization";
import { buildProfessionalDataUpdate } from "../stepBuilders/professionalDataBuilder";

/**
 * Salva dados profissionais do usuário
 * @param userId ID do usuário
 * @param data Dados profissionais
 */
export async function saveProfessionalData(userId: string, data: ProfessionalDataInput) {
  try {
    // Verificar se já existe um progresso para este usuário
    const { data: progressData, error } = await supabase
      .from('onboarding_progress')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao verificar progresso de onboarding:', error);
      return { success: false, error };
    }
    
    // Se não existe, criar novo
    if (!progressData) {
      console.log('Criando novo registro de progresso para dados profissionais');
      
      const professionalInfo = {
        company_name: data.company_name,
        company_size: data.company_size,
        company_sector: data.company_sector,
        company_website: data.company_website || '',
        current_position: data.current_position,
        annual_revenue: data.annual_revenue
      };
      
      const { data: newProgress, error: createError } = await supabase
        .from('onboarding_progress')
        .insert([{
          user_id: userId,
          professional_info: professionalInfo,
          company_name: data.company_name,
          company_size: data.company_size,
          company_sector: data.company_sector,
          company_website: data.company_website || '',
          current_position: data.current_position,
          annual_revenue: data.annual_revenue,
          current_step: 'business_context',
          completed_steps: ['personal', 'professional_data']
        }])
        .select()
        .single();
      
      if (createError) {
        console.error('Erro ao criar novo progresso de onboarding:', createError);
        return { success: false, error: createError };
      }
      
      return { success: true, data: newProgress };
    }
    
    // Já existe, atualizar com os novos dados
    console.log('Atualizando dados profissionais em progresso existente');
    
    // Construir objeto de atualização
    const existingProfessionalInfo = normalizeField(progressData.professional_info);
    const updateObj = buildProfessionalDataUpdate(data, progressData);
    
    // Atualizar também completed_steps se necessário
    if (!progressData.completed_steps?.includes('professional_data')) {
      updateObj.completed_steps = [
        ...Array.from(new Set([...(progressData.completed_steps || []), 'professional_data']))
      ];
    }
    
    // Definir current_step para business_context se estiver vazio ou em professional_data
    if (!progressData.current_step || progressData.current_step === 'professional_data') {
      updateObj.current_step = 'business_context';
    }
    
    // Atualizar no Supabase
    const { data: updatedProgress, error: updateError } = await supabase
      .from('onboarding_progress')
      .update(updateObj)
      .eq('id', progressData.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Erro ao atualizar progresso de onboarding:', updateError);
      return { success: false, error: updateError };
    }
    
    return { success: true, data: updatedProgress };
    
  } catch (error) {
    console.error('Exceção ao salvar dados profissionais:', error);
    return { success: false, error };
  }
}
