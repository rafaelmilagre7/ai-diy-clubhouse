
import { supabase } from "@/lib/supabase";

/**
 * Busca dados profissionais específicos para um progresso
 */
export const fetchProfessionalData = async (progressId: string) => {
  if (!progressId) {
    console.error("[ERRO] ID de progresso não fornecido para busca de dados profissionais");
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('onboarding_professional_info')
      .select('*')
      .eq('progress_id', progressId)
      .maybeSingle();
    
    if (error) {
      console.error("[ERRO] Erro ao buscar dados profissionais:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("[ERRO] Exceção ao buscar dados profissionais:", error);
    return null;
  }
};

/**
 * Salva dados profissionais para um progresso específico
 */
export const saveProfessionalData = async (progressId: string, userId: string, data: any) => {
  if (!progressId) {
    console.error("[ERRO] ID de progresso não fornecido para salvar dados profissionais");
    throw new Error("ID de progresso não fornecido");
  }
  
  try {
    console.log("[DEBUG] Salvando dados profissionais:", { progressId, userId, data });
    
    // Extrair os dados profissionais do objeto
    const professionalInfo = data.professional_info || {
      company_name: data.company_name || "",
      company_size: data.company_size || "",
      company_sector: data.company_sector || "",
      company_website: data.company_website || "",
      current_position: data.current_position || "",
      annual_revenue: data.annual_revenue || ""
    };
    
    // Verificar se registro já existe
    const { data: existingRecord, error: checkError } = await supabase
      .from('onboarding_professional_info')
      .select('id')
      .eq('progress_id', progressId)
      .maybeSingle();
    
    let result;
    
    if (existingRecord) {
      // Atualizar registro existente
      const { data: updateResult, error: updateError } = await supabase
        .from('onboarding_professional_info')
        .update({
          company_name: professionalInfo.company_name,
          company_size: professionalInfo.company_size,
          company_sector: professionalInfo.company_sector,
          company_website: professionalInfo.company_website,
          current_position: professionalInfo.current_position,
          annual_revenue: professionalInfo.annual_revenue,
          updated_at: new Date().toISOString()
        })
        .eq('progress_id', progressId)
        .select();
      
      if (updateError) throw updateError;
      result = updateResult;
    } else {
      // Criar novo registro
      const { data: insertResult, error: insertError } = await supabase
        .from('onboarding_professional_info')
        .insert({
          progress_id: progressId,
          user_id: userId,
          company_name: professionalInfo.company_name,
          company_size: professionalInfo.company_size,
          company_sector: professionalInfo.company_sector,
          company_website: professionalInfo.company_website,
          current_position: professionalInfo.current_position,
          annual_revenue: professionalInfo.annual_revenue
        })
        .select();
      
      if (insertError) throw insertError;
      result = insertResult;
    }
    
    return result;
  } catch (error) {
    console.error("[ERRO] Erro ao salvar dados profissionais:", error);
    throw error;
  }
};

/**
 * Formata dados profissionais para o formato esperado
 */
export const formatProfessionalData = (data: any) => {
  if (!data) return {};
  
  // Extrair os campos específicos para professional_info
  const professional_info = {
    company_name: data.company_name || "",
    company_size: data.company_size || "",
    company_sector: data.company_sector || "",
    company_website: data.company_website || "",
    current_position: data.current_position || "",
    annual_revenue: data.annual_revenue || ""
  };
  
  // Retornar formato consistente com os dados top-level
  return {
    professional_info,
    company_name: data.company_name || "",
    company_size: data.company_size || "",
    company_sector: data.company_sector || "",
    company_website: data.company_website || "",
    current_position: data.current_position || "",
    annual_revenue: data.annual_revenue || ""
  };
};
