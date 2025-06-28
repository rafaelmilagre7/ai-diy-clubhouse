
import { useState } from "react";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";
import { useSolutionData } from "@/hooks/useSolutionData";
import { useSolutionSave } from "@/hooks/useSolutionSave";
import { useSolutionSteps } from "@/hooks/useSolutionSteps";

export const useSolutionEditor = (id: string | undefined, user: any) => {
  // Get solution data
  const { solution, setSolution, loading } = useSolutionData(id);
  
  // Get step navigation
  const { currentStep, setCurrentStep, activeTab, setActiveTab, totalSteps, stepTitles } = useSolutionSteps(0);
  
  // Get save functionality
  const { saving, onSubmit } = useSolutionSave(id, setSolution);
  
  // Prepare the default and current form values
  const defaultValues: SolutionFormValues = {
    title: "",
    description: "",
    category: "Receita" as const,
    difficulty: "medium" as const,
    thumbnail_url: "",
    published: false,
    slug: "",
  };
  
  const currentValues: SolutionFormValues = solution
    ? {
        title: solution.title,
        description: solution.description,
        category: solution.category as "Receita" | "Operacional" | "Estratégia",
        difficulty: (solution.difficulty || solution.difficulty_level) as "easy" | "medium" | "advanced",
        thumbnail_url: solution.thumbnail_url || solution.cover_image_url || "",
        published: solution.published || solution.is_published || false,
        slug: solution.slug || "",
      }
    : defaultValues;

  // Create a submit handler that uses our onSubmit function
  const handleSubmit = (values: SolutionFormValues) => {
    return onSubmit(values);
  };

  return {
    solution,
    loading,
    saving,
    activeTab,
    setActiveTab,
    onSubmit: handleSubmit,
    currentValues,
    currentStep,
    setCurrentStep,
    totalSteps,
    stepTitles
  };
};
