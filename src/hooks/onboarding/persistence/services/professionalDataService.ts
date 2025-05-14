
import { professionalDataService } from "@/services/onboarding";

/**
 * Função para salvar dados profissionais em tabelas específicas
 */
export async function saveProfessionalData(
  progressId: string, 
  userId: string, 
  data: any
): Promise<any> {
  try {
    console.log("[DEBUG] Salvando dados profissionais:", { progressId, userId, data });
    
    // Chamar serviço especializado
    const result = await professionalDataService.save(progressId, userId, data);
    
    return result;
  } catch (error) {
    console.error("[ERRO] Falha ao salvar dados profissionais:", error);
    throw error;
  }
}

/**
 * Busca dados profissionais de tabelas relacionadas
 */
export async function fetchProfessionalData(progressId: string): Promise<any> {
  try {
    // Chamar serviço especializado
    const result = await professionalDataService.fetch(progressId);
    
    return result;
  } catch (error) {
    console.error("[ERRO] Falha ao buscar dados profissionais:", error);
    return null;
  }
}

/**
 * Formata os dados profissionais para integração
 */
export function formatProfessionalData(data: any): any {
  if (!data) return {};
  
  const formatted = {
    professional_info: data.professional_info || {},
    company_name: data.company_name || '',
    company_size: data.company_size || '',
    company_sector: data.company_sector || '',
    company_website: data.company_website || '',
    current_position: data.current_position || '',
    annual_revenue: data.annual_revenue || ''
  };
  
  return formatted;
}
