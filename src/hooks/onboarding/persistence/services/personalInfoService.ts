
import { supabase } from "@/lib/supabase";
import { PersonalInfo } from "@/types/onboarding";
import { useLogging } from "@/hooks/useLogging";

/**
 * Salva os dados pessoais na tabela personal_info
 */
export async function savePersonalInfoData(
  progressId: string,
  userId: string,
  data: PersonalInfo,
  logError: ReturnType<typeof useLogging>["logError"]
) {
  try {
    console.log(`Salvando dados pessoais para progresso ${progressId}:`, data);
    
    // Verificar se já existe um registro para este progresso
    const { data: existingData, error: checkError } = await supabase
      .from('personal_info')
      .select('id')
      .eq('progress_id', progressId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Erro ao verificar dados pessoais existentes:', checkError);
      logError('personal_info_check_error', { error: checkError.message });
      return { success: false, error: checkError };
    }
    
    // Preparar os dados com IDs de referência
    const personalInfoData = {
      ...data,
      progress_id: progressId,
      user_id: userId,
      updated_at: new Date().toISOString()
    };
    
    // Inserir ou atualizar dependendo da existência
    let result;
    if (existingData?.id) {
      // Atualizar registro existente
      result = await supabase
        .from('personal_info')
        .update(personalInfoData)
        .eq('id', existingData.id)
        .select();
    } else {
      // Inserir novo registro - adicionar campo created_at apenas no momento da inserção
      result = await supabase
        .from('personal_info')
        .insert({
          ...personalInfoData,
          created_at: new Date().toISOString()
        })
        .select();
    }
    
    const { data: savedData, error } = result;
    
    if (error) {
      console.error('Erro ao salvar dados pessoais:', error);
      logError('personal_info_save_error', { error: error.message });
      return { success: false, error };
    }
    
    return { success: true, data: savedData };
  } catch (error) {
    console.error('Exceção ao salvar dados pessoais:', error);
    logError('personal_info_save_exception', { 
      error: error instanceof Error ? error.message : String(error)
    });
    return { success: false, error };
  }
}

/**
 * Busca os dados pessoais para um progresso específico
 */
export async function fetchPersonalInfo(progressId: string) {
  try {
    console.log(`Buscando dados pessoais para progresso ${progressId}`);
    
    const { data, error } = await supabase
      .from('personal_info')
      .select('*')
      .eq('progress_id', progressId)
      .maybeSingle();
    
    if (error) {
      console.error('Erro ao buscar dados pessoais:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Exceção ao buscar dados pessoais:', error);
    return null;
  }
}

/**
 * Formata os dados pessoais para o formato esperado pelo objeto de progresso
 */
export function formatPersonalInfoData(data: any) {
  if (!data) return { personal_info: {} };
  
  // Extrair apenas os campos relevantes para evitar campos de sistema
  const {
    id, progress_id, user_id, created_at, updated_at,
    ...personalInfoFields
  } = data;
  
  // Retornar no formato esperado pelo objeto de progresso
  return {
    personal_info: personalInfoFields
  };
}
