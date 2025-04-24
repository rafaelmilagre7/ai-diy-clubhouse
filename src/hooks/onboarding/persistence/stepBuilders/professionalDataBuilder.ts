
import { OnboardingData, OnboardingProgress, ProfessionalDataInput } from "@/types/onboarding";
import { normalizeField } from "../utils/dataNormalization";

/**
 * Constrói o objeto de atualização para dados profissionais
 * Função otimizada para evitar recriação desnecessária de objetos
 */
export function buildProfessionalDataUpdate(
  data: Partial<OnboardingData> | ProfessionalDataInput, 
  progress: OnboardingProgress | null
) {
  const updateObj: Record<string, any> = {};
  
  // Verifica se temos campos específicos de profissional
  if ('company_name' in data || 'company_size' in data) {
    const inputData = data as ProfessionalDataInput;
    
    // Definir valores padrão para evitar undefined
    const companyName = inputData.company_name || "";
    const companySize = inputData.company_size || "";
    const companySector = inputData.company_sector || "";
    const companyWebsite = inputData.company_website || "";
    const currentPosition = inputData.current_position || "";
    const annualRevenue = inputData.annual_revenue || "";
    
    // Criar objeto professional_info (não duplicar referências)
    updateObj.professional_info = {
      ...(progress?.professional_info || {}),
      company_name: companyName,
      company_size: companySize,
      company_sector: companySector,
      company_website: companyWebsite,
      current_position: currentPosition,
      annual_revenue: annualRevenue
    };
  }
  // Se temos dados aninhados em professional_info
  else if ('professional_info' in data && data.professional_info) {
    const professional_info = normalizeField(data.professional_info);
    updateObj.professional_info = professional_info;
  }
  
  return updateObj;
}
