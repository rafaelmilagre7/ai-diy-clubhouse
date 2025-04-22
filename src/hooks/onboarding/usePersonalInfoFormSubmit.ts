
import { useState } from "react";
import { toast } from "sonner";
import { validatePersonalInfoForm } from "@/utils/validatePersonalInfoForm";
import { savePersonalInfoData } from "./persistence/services/personalInfoService";
import { markStepAsCompleted } from "./persistence/services/progressService";
import { useProgress } from "./useProgress";
import { useLogging } from "@/hooks/useLogging";
import { PersonalInfoData } from "@/types/onboarding";

type SubmitParams = {
  progress: any,
  user: any,
  formData: PersonalInfoData,
  logError: (event: string, data?: Record<string, any>) => void,
  refreshProgress: () => Promise<void>,
  setValidationAttempted: (value: boolean) => void,
  setErrors: (val: Record<string, string>) => void,
  setIsSubmitting: (v: boolean) => void
};

export const usePersonalInfoFormSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { refreshProgress } = useProgress();
  const { logError } = useLogging();

  const handleSubmit = async ({
    progress, user, formData, setValidationAttempted, setErrors
  }: Omit<SubmitParams, "logError" | "refreshProgress" | "setIsSubmitting"> & { setIsSubmitting?: (v: boolean) => void }) => {
    if (isSubmitting) return false;

    setValidationAttempted(true);
    const validationErrors = validatePersonalInfoForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      // Mostrar toast com os erros
      const errorFields = Object.keys(validationErrors).map(field =>
        field.charAt(0).toUpperCase() + field.slice(1)
      ).join(', ');
      toast.error("Por favor, corrija os erros no formulário", {
        description: `Verifique os campos: ${errorFields}`
      });
      return false;
    }

    setIsSubmitting(true);
    try {
      if (!progress?.id || !user?.id) {
        throw new Error("Dados de progresso ou usuário não disponíveis");
      }

      // 1. Salvar dados na tabela dedicada
      const saveResult = await savePersonalInfoData(
        progress.id,
        user.id,
        formData,
        logError
      );

      if (!saveResult.success) {
        throw new Error("Falha ao salvar dados pessoais");
      }

      // 2. Marcar etapa como concluída e atualizar progresso
      const updateResult = await markStepAsCompleted(
        progress.id,
        "personal",
        "professional_data",
        logError
      );

      if (!updateResult.success) {
        console.warn("Aviso: Dados salvos, mas falha ao atualizar status do progresso");
      }

      // 3. Atualizar dados locais
      await refreshProgress();

      toast.success("Dados pessoais salvos com sucesso!", {
        description: "Avançando para a próxima etapa..."
      });

      return true;
    } catch (error) {
      console.error("[ERRO] Erro ao salvar dados:", error);
      logError("personal_info_submit_error", {
        error: error instanceof Error ? error.message : String(error)
      });
      toast.error("Erro ao salvar dados. Tente novamente.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    setIsSubmitting,
    handleSubmit,
  };
};
