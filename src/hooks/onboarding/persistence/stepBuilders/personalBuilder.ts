
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";
import { buildBaseUpdate } from "./baseBuilder";

/**
 * Builder específico para dados pessoais
 * Processa e normaliza os dados para facilitar interpretação por IA
 */
export function buildPersonalUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  // Processar dados antes de enviar ao builder
  const processedData = { ...data };
  
  if (processedData.personal_info?.ddi) {
    // Garantir que o DDI tenha um formato válido
    processedData.personal_info.ddi = processedData.personal_info.ddi.replace(/^(?!\+)/, '+');
  }
  
  // Normalizar URLs de redes sociais
  if (processedData.personal_info?.linkedin) {
    const linkedin = processedData.personal_info.linkedin;
    if (!linkedin.match(/^https?:\/\//)) {
      processedData.personal_info.linkedin = `https://linkedin.com/in/${linkedin.replace(/^(https?:\/\/)?(www\.)?(linkedin\.com\/in\/)?/, '')}`;
    }
  }
  
  if (processedData.personal_info?.instagram) {
    const instagram = processedData.personal_info.instagram;
    if (!instagram.match(/^https?:\/\//)) {
      processedData.personal_info.instagram = `https://instagram.com/${instagram.replace(/^(https?:\/\/)?(www\.)?(instagram\.com\/)?/, '')}`;
    }
  }
  
  // Adicionar metadados semânticos para facilitar interpretação por IA
  const semanticMetadata = {
    data_type: "personal_info",
    data_context: "personal_identity",
    data_version: "1.0",
    timestamp: new Date().toISOString()
  };
  
  // Usar o builder base para construir o objeto de atualização
  return buildBaseUpdate("personal_info", processedData, progress, {
    metadata: semanticMetadata
  });
}
