
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildPersonalUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  // Certifique-se de que temos um objeto de retorno mesmo que não haja dados
  if (!data) {
    console.warn("Dados vazios recebidos");
    return {};
  }

  console.log("Construindo atualização para dados pessoais:", data);

  // Verificar se temos dados pessoais no objeto recebido
  const personalInfo = data.personal_info || {};
  
  if (Object.keys(personalInfo).length === 0) {
    console.warn("Dados pessoais vazios ou incompletos recebidos");
    return {};
  }

  console.log("Dados pessoais para atualização:", personalInfo);

  // Mescla os dados existentes com os novos para evitar perder informações
  const existingPersonalInfo = progress?.personal_info || {};
  
  // Criar um objeto atualizado com tipagem segura
  const updatedPersonalInfo: OnboardingData['personal_info'] = {
    ...existingPersonalInfo,
    ...personalInfo,
  };

  console.log("Dados pessoais mesclados:", updatedPersonalInfo);

  return {
    personal_info: updatedPersonalInfo
  };
}
