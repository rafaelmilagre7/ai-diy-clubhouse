
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";
import { normalizeComplementaryInfo, NormalizedComplementaryInfo } from "../utils/complementaryInfoNormalization";

export function buildComplementaryInfoUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  
  console.log("Construindo atualização para complementary_info com dados:", data);
  
  // Verificações iniciais
  if (!data) {
    console.warn("Dados vazios recebidos em buildComplementaryInfoUpdate");
    return updateObj;
  }
  
  // Garantir base consistente para os dados
  const existingComplementaryInfo: NormalizedComplementaryInfo = normalizeComplementaryInfo(
    progress?.complementary_info || {}
  );
  
  console.log("Dados atuais de progresso complementary_info:", existingComplementaryInfo);
  
  // CORREÇÃO: Verificar primeiro se temos dados específicos no campo complementary_info
  if (data.complementary_info) {
    console.log("Dados específicos encontrados no campo complementary_info:", data.complementary_info);
    
    // Normalizar e mesclar com dados existentes
    updateObj.complementary_info = {
      ...existingComplementaryInfo,
      ...normalizeComplementaryInfo(data.complementary_info)
    };
    
    console.log("Objeto final de atualização para complementary_info:", updateObj);
    return updateObj;
  }
  
  // CORREÇÃO: Verificar se os dados estão no nível raiz do objeto
  const complementaryFields = [
    'how_found_us',
    'referred_by',
    'authorize_case_usage',
    'interested_in_interview',
    'priority_topics'
  ];
  
  const hasRootFields = complementaryFields.some(field => field in data);
  
  if (hasRootFields) {
    console.log("Dados complementares encontrados no nível raiz:", data);
    
    // Extrair dados relevantes
    const complementaryData: any = {};
    
    complementaryFields.forEach(field => {
      if (field in data) {
        complementaryData[field] = data[field as keyof typeof data];
      }
    });
    
    // Normalizar e mesclar com dados existentes
    updateObj.complementary_info = {
      ...existingComplementaryInfo,
      ...normalizeComplementaryInfo(complementaryData)
    };
    
    console.log("Objeto final de atualização para complementary_info:", updateObj);
    return updateObj;
  }
  
  // Se o próprio objeto data parece ser os dados complementares
  if (Object.keys(data).some(key => complementaryFields.includes(key))) {
    console.log("O payload parece ser diretamente os dados complementares:", data);
    
    // Normalizar e mesclar com dados existentes
    updateObj.complementary_info = {
      ...existingComplementaryInfo,
      ...normalizeComplementaryInfo(data)
    };
    
    console.log("Objeto final de atualização para complementary_info:", updateObj);
    return updateObj;
  }
  
  console.warn("Nenhum dado específico de complementary_info encontrado para atualização");
  return updateObj;
}
