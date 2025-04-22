
import { OnboardingData, OnboardingProgress } from "@/types/onboarding";
import { buildBaseUpdate } from "./baseBuilder";

export function buildPersonalUpdate(data: Partial<OnboardingData>, progress: OnboardingProgress | null) {
  // Processar dados antes de enviar ao builder
  if (data.personal_info?.ddi) {
    // Garantir que o DDI tenha um formato válido
    data.personal_info.ddi = data.personal_info.ddi.replace(/^(?!\+)/, '+');
  }
  
  // Usar o builder base para construir o objeto de atualização
  return buildBaseUpdate("personal_info", data, progress, {});
}
