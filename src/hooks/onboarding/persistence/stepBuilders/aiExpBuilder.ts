
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";
import { buildBaseUpdate } from "./baseBuilder";

/**
 * Builder específico para dados de experiência com IA
 * Processa e normaliza os dados para facilitar interpretação por IA
 */
export function buildAiExpUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  // Criar cópia dos dados para processamento
  const processedData = { ...data };
  
  // Se os dados vieram dentro de um objeto ai_experience
  const aiExp = processedData.ai_experience || (data as any).ai_exp;
  let dataToProcess = aiExp;
  
  // Se ai_experience é uma string, tenta converter para objeto
  if (typeof aiExp === 'string') {
    try {
      dataToProcess = JSON.parse(aiExp);
      console.warn("Convertendo ai_experience de string para objeto:", dataToProcess);
    } catch (e) {
      console.error("Erro ao converter ai_experience string para objeto:", e);
      dataToProcess = { knowledge_level: "iniciante" }; // Fallback básico
    }
  }
  
  // Se não temos dados dentro de ai_experience, usar o próprio data como fonte
  if (!dataToProcess && typeof data === 'object') {
    dataToProcess = { ...data };
    // Remover campos que não pertencem a experiência com IA
    delete dataToProcess.ai_experience;
  }
  
  // Garantir que temos um objeto para processar
  dataToProcess = dataToProcess || {};
  
  // Normalizar arrays se necessário
  if (dataToProcess) {
    // Verificar que arrays específicos são realmente arrays
    if (dataToProcess.desired_ai_areas && !Array.isArray(dataToProcess.desired_ai_areas)) {
      dataToProcess.desired_ai_areas = [dataToProcess.desired_ai_areas];
    }
    
    if (dataToProcess.previous_tools && !Array.isArray(dataToProcess.previous_tools)) {
      dataToProcess.previous_tools = [dataToProcess.previous_tools];
    }
    
    // Converter valores de string para booleanos quando apropriado
    if (dataToProcess.has_implemented !== undefined) {
      if (typeof dataToProcess.has_implemented === 'string') {
        // Armazenar como string 'sim' ou 'nao' para consistência
        dataToProcess.has_implemented = 
          (dataToProcess.has_implemented.toLowerCase() === 'sim' || 
          dataToProcess.has_implemented.toLowerCase() === 'yes' || 
          dataToProcess.has_implemented === '1' || 
          dataToProcess.has_implemented.toLowerCase() === 'true') ? 'sim' : 'nao';
      } else if (typeof dataToProcess.has_implemented === 'boolean') {
        // Converter booleano para string
        dataToProcess.has_implemented = dataToProcess.has_implemented ? 'sim' : 'nao';
      }
    }
    
    // Garantir que o nível de conhecimento seja um dos valores esperados
    if (dataToProcess.knowledge_level && typeof dataToProcess.knowledge_level === 'string') {
      const validLevels = ['iniciante', 'basico', 'intermediario', 'avancado', 'especialista'];
      if (!validLevels.includes(dataToProcess.knowledge_level.toLowerCase())) {
        dataToProcess.knowledge_level = 'iniciante';
      }
    }
  }
  
  // Criar o objeto finalizado para ai_experience
  const finalAiExpData = {
    ...dataToProcess,
    _last_updated: new Date().toISOString()
  };
  
  // Log dos dados processados
  console.log("Dados de AI Experience processados:", finalAiExpData);
  
  // Construir objeto de atualização
  const updateObj: any = {};
  updateObj.ai_experience = finalAiExpData;
  
  return updateObj;
}
