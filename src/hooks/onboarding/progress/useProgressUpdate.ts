
import { OnboardingProgress } from "@/types/onboarding";
import { updateOnboardingProgress } from "../persistence/progressPersistence";
import { toast } from "sonner";

export function useProgressUpdate(
  progress: OnboardingProgress | null,
  setProgress: (progress: OnboardingProgress) => void,
  toastShownRef: React.MutableRefObject<boolean>,
  lastError: React.MutableRefObject<Error | null>,
  refreshProgress: () => Promise<OnboardingProgress | null>
) {
  const updateProgress = async (updates: Partial<OnboardingProgress>) => {
    if (!progress?.id) {
      console.error("Usuário ou progresso não disponível para atualização");
      throw new Error("Usuário ou progresso não disponível");
    }

    try {
      console.log("Atualizando progresso:", updates);
      
      // Prevenção de múltiplas chamadas de toast
      const shouldShowToasts = !toastShownRef.current;
      toastShownRef.current = true;
      
      const { data, error } = await updateOnboardingProgress(progress.id, updates);

      if (error) {
        console.error("Erro ao atualizar dados:", error);
        lastError.current = new Error(error.message);
        throw error;
      }

      const updatedProgress = data || { ...progress, ...updates };
      setProgress(updatedProgress);
      console.log("Progresso atualizado com sucesso:", updatedProgress);
      
      // Reset do flag de toast após um tempo
      setTimeout(() => {
        toastShownRef.current = false;
      }, 2000);
      
      return updatedProgress;
    } catch (error) {
      console.error("Erro ao atualizar progresso:", error);
      lastError.current = error instanceof Error ? error : new Error(String(error));
      throw error;
    }
  };

  return { updateProgress };
}
