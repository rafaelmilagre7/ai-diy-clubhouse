
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

/**
 * Constrói o objeto de atualização com dados pessoais
 */
export function buildPersonalInfoUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  
  // Garantir uma base consistente para os dados
  let existingPersonalInfo: any = {};
  
  // Verificar se temos dados válidos de progresso
  if (progress) {
    if (typeof progress.personal_info === 'string') {
      try {
        const trimmedValue = String(progress.personal_info).trim();
        if (trimmedValue !== '') {
          existingPersonalInfo = JSON.parse(trimmedValue);
        }
      } catch (e) {
        console.error("Erro ao converter personal_info de string para objeto:", e);
      }
    } else if (progress.personal_info && typeof progress.personal_info === 'object') {
      existingPersonalInfo = progress.personal_info;
    }
  }
  
  // Inicializar o objeto de atualização com os dados existentes
  updateObj.personal_info = {...existingPersonalInfo};
  
  // Verificar se estamos recebendo dados diretos ou em um objeto aninhado
  const sourceData = data.personal_info || data;
  
  if (typeof sourceData === 'object' && sourceData !== null) {
    // Processar campos de texto
    ['name', 'email', 'phone', 'ddi', 'linkedin', 'instagram', 'country', 'state', 'city', 'timezone'].forEach(field => {
      if (field in sourceData && sourceData[field as keyof typeof sourceData]) {
        updateObj.personal_info[field] = sourceData[field as keyof typeof sourceData];
      }
    });
    
    // Garantir formato adequado para alguns campos
    if (updateObj.personal_info.ddi && !updateObj.personal_info.ddi.startsWith('+')) {
      updateObj.personal_info.ddi = '+' + updateObj.personal_info.ddi.replace(/^\+/, '');
    }
    
    // Normalizar URLs das redes sociais
    ['linkedin', 'instagram'].forEach(socialField => {
      if (updateObj.personal_info[socialField]) {
        let socialUrl = updateObj.personal_info[socialField];
        if (!socialUrl.match(/^https?:\/\//)) {
          if (socialField === 'linkedin') {
            updateObj.personal_info[socialField] = `https://linkedin.com/in/${socialUrl.replace(/^(https?:\/\/)?(www\.)?(linkedin\.com\/in\/)?/, '')}`;
          } else if (socialField === 'instagram') {
            updateObj.personal_info[socialField] = `https://instagram.com/${socialUrl.replace(/^(https?:\/\/)?(www\.)?(instagram\.com\/)?/, '')}`;
          }
        }
      }
    });
  }
  
  console.log("Objeto de atualização para personal_info:", updateObj);
  
  return updateObj;
}
