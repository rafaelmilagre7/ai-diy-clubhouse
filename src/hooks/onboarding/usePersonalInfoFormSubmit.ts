
import { useState } from "react";
import { toast } from "sonner";
import { validatePersonalInfoForm } from "@/utils/validatePersonalInfoForm";
import { savePersonalInfoData } from "./persistence/services/personalInfoService";
import { markStepAsCompleted } from "./persistence/services/progressService";
import { useProgress } from "./useProgress";
import { useLogging } from "@/hooks/useLogging";
import { PersonalInfoData } from "@/types/onboarding";
import { useNavigate } from "react-router-dom";

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
  // Inicializar explicitamente com false para garantir que o botão esteja habilitado inicialmente
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);
  const { refreshProgress } = useProgress();
  const { logError } = useLogging();
  const navigate = useNavigate();

  // Log para diagnóstico
  console.log("[DEBUG] usePersonalInfoFormSubmit estados:", { isSubmitting, isSaving });

  const handleSubmit = async ({
    progress, user, formData, setValidationAttempted, setErrors, logError, refreshProgress
  }: Omit<SubmitParams, "setIsSubmitting"> & { setIsSubmitting?: (v: boolean) => void }) => {
    if (isSubmitting) {
      console.log("Já está submetendo, ignorando chamada duplicada");
      return false;
    }

    console.log("Iniciando processo de submissão do formulário");
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
    setIsSaving(true);
    try {
      if (!progress?.id || !user?.id) {
        throw new Error("Dados de progresso ou usuário não disponíveis");
      }

      console.log("Salvando dados pessoais para progresso:", progress.id);
      
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

      // Atualizar timestamp do último salvamento
      setLastSaveTime(Date.now());

      toast.success("Dados pessoais salvos com sucesso!", {
        description: "Avançando para a próxima etapa..."
      });
      
      // 4. Navegação para a próxima etapa após sucesso
      console.log("Navegando para a próxima etapa: /onboarding/professional-data");
      setTimeout(() => {
        navigate("/onboarding/professional-data", { replace: true });
      }, 500);

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
      setIsSaving(false);
    }
  };

  return {
    isSubmitting,
    setIsSubmitting,
    isSaving,
    lastSaveTime,
    handleSubmit,
  };
};
