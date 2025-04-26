
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";
import { normalizeComplementaryInfo, NormalizedComplementaryInfo } from "../utils/complementaryInfoNormalization";

export function buildComplementaryInfoUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  const updateObj: any = {};
  
  console.log("[buildComplementaryInfoUpdate] Construindo atualização com dados:", data);
  
  // Verificações iniciais
  if (!data) {
    console.warn("[buildComplementaryInfoUpdate] Dados vazios recebidos");
    return updateObj;
  }
  
  // Garantir base consistente para os dados
  const existingComplementaryInfo: NormalizedComplementaryInfo = normalizeComplementaryInfo(
    progress?.complementary_info || {}
  );
  
  console.log("[buildComplementaryInfoUpdate] Dados atuais de progresso complementary_info:", existingComplementaryInfo);
  
  // CORREÇÃO 1: Verificação mais robusta para dados de complementary_info
  if (data.complementary_info) {
    console.log("[buildComplementaryInfoUpdate] Dados específicos encontrados:", 
      typeof data.complementary_info, data.complementary_info);
    
    // Se for string, tenta converter para objeto
    let complementaryData = data.complementary_info;
    if (typeof complementaryData === 'string') {
      try {
        complementaryData = JSON.parse(complementaryData);
        console.log("[buildComplementaryInfoUpdate] Dados convertidos de string para objeto:", complementaryData);
      } catch (e) {
        console.error("[buildComplementaryInfoUpdate] Erro ao converter dados de string para objeto:", e);
      }
    }
    
    // Normalizar e mesclar com dados existentes
    updateObj.complementary_info = {
      ...existingComplementaryInfo,
      ...normalizeComplementaryInfo(complementaryData)
    };
    
    console.log("[buildComplementaryInfoUpdate] Objeto final de atualização:", updateObj);
    return updateObj;
  }
  
  // CORREÇÃO 2: Verificar se os dados estão no nível raiz do objeto
  const complementaryFields = [
    'how_found_us',
    'referred_by',
    'authorize_case_usage',
    'interested_in_interview',
    'priority_topics'
  ];
  
  const hasRootFields = complementaryFields.some(field => field in data);
  
  if (hasRootFields) {
    console.log("[buildComplementaryInfoUpdate] Dados complementares encontrados no nível raiz:", data);
    
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
    
    console.log("[buildComplementaryInfoUpdate] Objeto final de atualização:", updateObj);
    return updateObj;
  }
  
  // CORREÇÃO 3: Verificação para campos específicos com tratamento seguro de tipagem
  if ('how_found_us' in data) {
    console.log("[buildComplementaryInfoUpdate] Campo how_found_us encontrado diretamente:", (data as any).how_found_us);
    
    updateObj.complementary_info = {
      ...existingComplementaryInfo,
      how_found_us: (data as any).how_found_us
    };
    
    console.log("[buildComplementaryInfoUpdate] Objeto final de atualização para how_found_us:", updateObj);
    return updateObj;
  }
  
  // Se o próprio objeto data parece ser os dados complementares
  if (Object.keys(data).some(key => complementaryFields.includes(key))) {
    console.log("[buildComplementaryInfoUpdate] O payload parece ser diretamente os dados complementares:", data);
    
    // Normalizar e mesclar com dados existentes
    updateObj.complementary_info = {
      ...existingComplementaryInfo,
      ...normalizeComplementaryInfo(data)
    };
    
    console.log("[buildComplementaryInfoUpdate] Objeto final de atualização:", updateObj);
    return updateObj;
  }
  
  console.warn("[buildComplementaryInfoUpdate] Nenhum dado específico encontrado para atualização");
  return updateObj;
}
