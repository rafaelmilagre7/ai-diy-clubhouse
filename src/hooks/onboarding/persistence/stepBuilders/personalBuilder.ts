
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";

export function buildPersonalUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  // Certifique-se de que temos um objeto de retorno mesmo que não haja dados
  if (!data) {
    console.warn("Dados vazios recebidos");
    return {};
  }

  console.log("Construindo atualização para dados pessoais:", data);

  // Verificar se temos dados pessoais no objeto recebido
  const personalInfo = data.personal_info || data;
  
  if (!personalInfo || Object.keys(personalInfo).length === 0) {
    console.warn("Dados pessoais vazios ou incompletos recebidos");
    return {};
  }

  console.log("Dados pessoais para atualização:", personalInfo);

  // Mescla os dados existentes com os novos para evitar perder informações
  const existingPersonalInfo = progress?.personal_info || {};
  
  // Verificar se cada campo existe antes de mesclar
  const updatedPersonalInfo = {
    ...existingPersonalInfo,
    ...personalInfo,
    name: personalInfo.name || existingPersonalInfo.name,
    email: personalInfo.email || existingPersonalInfo.email,
    phone: personalInfo.phone || existingPersonalInfo.phone || "",
    ddi: personalInfo.ddi || existingPersonalInfo.ddi || "+55",
    linkedin: personalInfo.linkedin || existingPersonalInfo.linkedin || "",
    instagram: personalInfo.instagram || existingPersonalInfo.instagram || "",
    country: personalInfo.country || existingPersonalInfo.country || "Brasil",
    state: personalInfo.state || existingPersonalInfo.state || "",
    city: personalInfo.city || existingPersonalInfo.city || "",
    timezone: personalInfo.timezone || existingPersonalInfo.timezone || "GMT-3",
  };

  console.log("Dados pessoais mesclados:", updatedPersonalInfo);

  return {
    personal_info: updatedPersonalInfo
  };
}
