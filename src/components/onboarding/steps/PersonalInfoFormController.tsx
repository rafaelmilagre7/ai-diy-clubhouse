
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { PersonalInfoInputs } from "./PersonalInfoInputs";
import { NavigationButtons } from "@/components/onboarding/NavigationButtons";
import { usePersonalInfoFormData } from "@/hooks/onboarding/usePersonalInfoFormData";
import { validatePersonalInfoForm } from "@/utils/validatePersonalInfoForm";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export const PersonalInfoFormController = () => {
  const {
    formData, 
    setFormData,
    formErrors, 
    setFormErrors,
    formDataLoaded,
    updateProgress, 
    progress, 
    profile, 
    user, 
    isLoading,
    handleFormChange
  } = usePersonalInfoFormData();

  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carregamento inicial de dados, sem salvamento automático
  useEffect(() => {
    if (formDataLoaded && progress?.id && !isSubmitting) {
      console.log("Dados iniciais carregados");
    }
  }, [formDataLoaded, progress?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    const errors = validatePersonalInfoForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Por favor, corrija os erros no formulário");
      return;
    }
    setIsSubmitting(true);

    try {
      const fullName = profile?.name || user?.user_metadata?.name || formData.name;
      const email = profile?.email || user?.email || formData.email;
      const personalInfo = { ...formData, name: fullName, email: email };
      await updateProgress({
        personal_info: personalInfo,
        current_step: "professional_data",
        completed_steps: [...(progress?.completed_steps || []), "personal"],
      });
      toast.success("Dados salvos com sucesso!");
      navigate("/onboarding/professional-data", { replace: true });
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast.error("Erro ao salvar dados. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
      <PersonalInfoInputs 
        formData={formData} 
        onChange={handleFormChange} 
        disabled={isSubmitting}
        readOnly 
        errors={formErrors}
      />
      <NavigationButtons isSubmitting={isSubmitting} />
    </form>
  );
};
