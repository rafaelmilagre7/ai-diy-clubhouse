
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";
import { buildBaseUpdate } from "./baseBuilder";

export function buildBusinessContextUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  // Para backward compatibility, atualizamos tanto business_context quanto business_data
  const contextUpdate = buildBaseUpdate("business_context", data, progress, {});
  
  // Verificar se business_data existe no progresso atual
  const dataUpdate = progress && 'business_data' in progress 
    ? buildBaseUpdate("business_data", data, progress, {})
    : {};
  
  // Mesclar os dois objetos de atualização
  return { ...contextUpdate, ...dataUpdate };
}
