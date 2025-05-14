
import { supabase } from "@/lib/supabase";

// Função auxiliar para validar formato UUID
const isValidUUID = (id: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * Busca dados profissionais específicos para um progresso
 */
export const fetchProfessionalData = async (progressId: string) => {
  if (!progressId) {
    console.error("[ERRO] ID de progresso não fornecido para busca de dados profissionais");
    return null;
  }
  
  // Verificar se o ID de progresso é válido antes de fazer chamadas ao banco de dados
  if (!isValidUUID(progressId)) {
    console.warn("[WARN] ID de progresso inválido ou simulado, retornando dados simulados:", progressId);
    return {
      progress_id: progressId,
      company_name: "Empresa Teste",
      company_size: "11-50",
      company_sector: "Tecnologia",
      company_website: "https://exemplo.com",
      current_position: "Diretor",
      annual_revenue: "1-5M"
    };
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
  
  // Verificar se o ID de progresso é válido antes de fazer chamadas ao banco de dados
  if (!isValidUUID(progressId)) {
    console.warn("[WARN] ID de progresso inválido ou simulado, skipping database call:", progressId);
    return [{ simulated: true, success: true }];
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
