
import React, { useEffect } from "react";
import BasicInfoForm from "@/components/admin/solution/BasicInfoForm";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";

interface BasicInfoTabProps {
  defaultValues?: SolutionFormValues;
  currentValues?: SolutionFormValues;
  onSubmit: (values: SolutionFormValues) => Promise<void>;
  saving: boolean;
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  defaultValues,
  currentValues,
  onSubmit,
  saving,
}) => {
  // Log para debug
  useEffect(() => {
    console.log("BasicInfoTab renderizando com valores:", { defaultValues, currentValues });
  }, [defaultValues, currentValues]);

  // Usamos currentValues se disponível, caso contrário, defaultValues
  const values = currentValues || defaultValues || {
    title: "",
    description: "",
    category: "revenue" as const,
    difficulty: "medium" as const,
    thumbnail_url: "",
    published: false,
    slug: "",
  };
  
  return (
    <BasicInfoForm 
      defaultValues={values} 
      onSubmit={onSubmit} 
      saving={saving} 
    />
  );
};

export default BasicInfoTab;
