
import React from "react";
import BasicInfoForm from "@/components/admin/solution/BasicInfoForm";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";

interface BasicInfoTabProps {
  defaultValues?: SolutionFormValues;  // Mantemos para compatibilidade
  currentValues?: SolutionFormValues;  // Adicionamos a nova prop
  onSubmit: (values: SolutionFormValues) => Promise<void>;
  saving: boolean;
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  defaultValues,
  currentValues,
  onSubmit,
  saving,
}) => {
  // Usamos currentValues se disponível, caso contrário, defaultValues
  const values = currentValues || defaultValues;
  
  return (
    <BasicInfoForm 
      defaultValues={values} 
      onSubmit={onSubmit} 
      saving={saving} 
    />
  );
};

export default BasicInfoTab;
