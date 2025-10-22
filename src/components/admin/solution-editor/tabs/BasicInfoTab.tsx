
import React, { useEffect, useRef } from "react";
import BasicInfoForm from "@/components/admin/solution/BasicInfoForm";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";

interface BasicInfoTabProps {
  currentValues: SolutionFormValues;
  onSubmit: (values: SolutionFormValues) => Promise<void>;
  saving: boolean;
  onStepSave?: (stepSaveFunction: () => Promise<void>) => void;
  onValuesChange?: (values: SolutionFormValues) => void;
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  currentValues,
  onSubmit,
  saving,
  onStepSave,
  onValuesChange,
}) => {
  const formRef = useRef<HTMLDivElement>(null);
  
  // BasicInfoTab renderizado

  // Função para salvar os dados da primeira etapa
  const handleSave = async () => {
    // Salvando BasicInfo
    
    // Tentar submeter o formulário programaticamente
    if (formRef.current) {
      const form = formRef.current;
      const submitEvent = new Event("submit", { cancelable: true, bubbles: true });
      form.dispatchEvent(submitEvent);
    } else {
      // Fallback: buscar formulário no DOM
      const form = document.querySelector("form");
      if (form) {
        const submitEvent = new Event("submit", { cancelable: true, bubbles: true });
        form.dispatchEvent(submitEvent);
      }
    }
    
    // Aguardar processamento do form
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  // Registrar a função de salvamento
  useEffect(() => {
    if (onStepSave) {
      console.log("✅ BasicInfoTab: Registrando função de salvamento");
      onStepSave(handleSave);
    }
  }, [onStepSave]);

  return (
    <div ref={formRef}>
      <BasicInfoForm 
        defaultValues={currentValues} 
        onSubmit={onSubmit} 
        saving={saving}
        onValuesChange={onValuesChange}
      />
    </div>
  );
};

export default BasicInfoTab;
