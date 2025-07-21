
import React, { useEffect } from "react";
import BasicInfoForm from "@/components/admin/solution/BasicInfoForm";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";

interface BasicInfoTabProps {
  currentValues: SolutionFormValues;
  onSubmit: (values: SolutionFormValues) => Promise<void>;
  saving: boolean;
  onStepSave?: (stepSaveFunction: () => Promise<void>) => void;
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  currentValues,
  onSubmit,
  saving,
  onStepSave,
}) => {
  console.log("🔧 BasicInfoTab: Renderizando com onStepSave =", !!onStepSave);

  // Função para salvar os dados da primeira etapa
  const handleSave = async () => {
    console.log("💾 BasicInfoTab: Executando handleSave");
    // Disparar o submit do formulário
    const form = document.querySelector("form");
    if (form) {
      const submitEvent = new Event("submit", { cancelable: true, bubbles: true });
      form.dispatchEvent(submitEvent);
      // Aguardar processamento do form
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  // Registrar a função de salvamento
  useEffect(() => {
    if (onStepSave) {
      console.log("✅ BasicInfoTab: Registrando função de salvamento");
      onStepSave(handleSave);
    }
  }, [onStepSave]);

  return (
    <BasicInfoForm 
      defaultValues={currentValues} 
      onSubmit={onSubmit} 
      saving={saving} 
    />
  );
};

export default BasicInfoTab;
