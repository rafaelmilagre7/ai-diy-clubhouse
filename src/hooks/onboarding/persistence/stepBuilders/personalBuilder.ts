
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildPersonalUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  // Certifique-se de que temos um objeto de retorno mesmo que não haja dados
  if (!data || !data.personal_info) {
    console.warn("Dados pessoais vazios ou incompletos recebidos");
    return {};
  }

  console.log("Construindo atualização para dados pessoais:", data.personal_info);

  // Mescla os dados existentes com os novos para evitar perder informações
  const existingPersonalInfo = progress?.personal_info || {};
  const personalInfo = {
    ...existingPersonalInfo,
    ...data.personal_info
  };

  return {
    personal_info: personalInfo
  };
}
