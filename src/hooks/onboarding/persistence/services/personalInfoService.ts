
import { supabase } from '@/lib/supabase';
import { PersonalInfo } from '@/types/onboarding';

/**
 * Salva os dados pessoais do usuário
 */
export async function savePersonalInfoData(
  progressId: string,
  userId: string,
  personalInfo: PersonalInfo,
  logError: (event: string, data?: Record<string, any>) => void
) {
  try {
    console.log(`Salvando dados pessoais para usuário ${userId}, progresso ${progressId}`);
    
    // Prepara os dados para salvar
    const dataToSave = {
      personal_info: personalInfo,
      updated_at: new Date().toISOString()
    };
    
    // Atualiza o registro de onboarding
    const { error } = await supabase
      .from('onboarding')
      .update(dataToSave)
      .eq('id', progressId);
    
    if (error) {
      console.error('Erro ao salvar dados pessoais:', error);
      logError('save_personal_info_error', { error: error.message });
      return { success: false, error };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Exceção ao salvar dados pessoais:', error);
    logError('save_personal_info_exception', { 
      error: error instanceof Error ? error.message : String(error)
    });
    return { success: false, error };
  }
}
