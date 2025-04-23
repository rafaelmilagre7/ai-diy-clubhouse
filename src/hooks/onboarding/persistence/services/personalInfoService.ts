
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

/**
 * Busca os dados pessoais do usuário
 */
export async function fetchPersonalInfo(progressId: string) {
  try {
    console.log(`Buscando dados pessoais para progresso ${progressId}`);
    
    const { data, error } = await supabase
      .from("onboarding")
      .select("personal_info")
      .eq("id", progressId)
      .single();
    
    if (error) {
      console.error('Erro ao buscar dados pessoais:', error);
      return null;
    }
    
    return data?.personal_info || null;
  } catch (error) {
    console.error('Exceção ao buscar dados pessoais:', error);
    return null;
  }
}

/**
 * Formata os dados pessoais para exibição
 */
export function formatPersonalInfoData(data: any) {
  if (!data) return { personal_info: {} };
  
  // Se os dados já estiverem no formato esperado, retorna-os diretamente
  if (typeof data === 'object' && !Array.isArray(data)) {
    return { personal_info: data };
  }
  
  // Tenta converter string para objeto, se necessário
  if (typeof data === 'string') {
    try {
      const parsedData = JSON.parse(data);
      return { personal_info: parsedData };
    } catch (e) {
      console.error('Erro ao fazer parse dos dados pessoais:', e);
      return { personal_info: {} };
    }
  }
  
  // Fallback para objeto vazio
  return { personal_info: {} };
}
