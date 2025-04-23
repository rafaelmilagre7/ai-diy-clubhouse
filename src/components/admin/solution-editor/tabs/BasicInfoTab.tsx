
import React, { useEffect } from "react";
import BasicInfoForm from "@/components/admin/solution/form/BasicInfoForm";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";
import { toSolutionCategory } from "@/lib/types/categoryTypes";
import { toSolutionDifficulty } from "@/lib/types/difficultyTypes";

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
  
  // Garantir que a categoria e dificuldade sejam dos tipos corretos
  const normalizedValues = {
    ...values,
    category: toSolutionCategory(values.category),
    difficulty: toSolutionDifficulty(values.difficulty)
  };
  
  // Log para debug dos valores normalizados
  console.log("Valores normalizados:", normalizedValues);
  
  return (
    <BasicInfoForm 
      defaultValues={normalizedValues} 
      onSubmit={onSubmit} 
      saving={saving} 
    />
  );
};

export default BasicInfoTab;
