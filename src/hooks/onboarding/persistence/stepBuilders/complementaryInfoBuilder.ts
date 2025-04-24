
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";
import { normalizeComplementaryInfo } from "../utils/complementaryInfoNormalization";

export function buildComplementaryInfoUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  
  console.log("Construindo atualização para complementary_info com dados:", data);
  
  // Verificações iniciais
  if (!data) {
    console.warn("Dados vazios recebidos em buildComplementaryInfoUpdate");
    return updateObj;
  }
  
  // Garantir base consistente para os dados
  const existingComplementaryInfo = normalizeComplementaryInfo(
    progress?.complementary_info || {}
  );
  
  console.log("Dados atuais de progresso complementary_info:", existingComplementaryInfo);
  
  // Verificar se estamos recebendo dados específicos de complementary_info
  if (!data.complementary_info && typeof data !== 'object') {
    console.warn("Nenhum dado específico de complementary_info encontrado para atualização");
    return updateObj;
  }
  
  // Extrair dados de complementary_info seja de data.complementary_info ou do próprio data
  const complementaryInfoData = data.complementary_info || data;
  
  // Normalizar os dados recebidos
  const normalizedData = normalizeComplementaryInfo(complementaryInfoData);
  
  // Construir objeto de atualização mesclando os dados existentes com os novos
  updateObj.complementary_info = {
    ...existingComplementaryInfo,
    ...normalizedData
  };
  
  console.log("Objeto final de atualização para complementary_info:", updateObj);
  
  return updateObj;
}
