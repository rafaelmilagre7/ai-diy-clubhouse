
import { useState } from "react";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";
import { useSolutionData } from "@/hooks/useSolutionData";
import { useSolutionSave } from "@/hooks/useSolutionSave";
import { useSolutionSteps } from "@/hooks/useSolutionSteps";
import { Solution } from "@/lib/supabase";

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
    category: "revenue" as const,
    difficulty: "medium" as const,
    thumbnail_url: "",
    published: false,
    slug: "",
  };
  
  // Normaliza a dificuldade para compatibilidade
  const normalizeDifficulty = (difficulty: string): "easy" | "medium" | "advanced" => {
    if (difficulty === "beginner") return "easy";
    if (difficulty === "intermediate") return "medium";
    
    // Garantir que o valor esteja entre os aceitos
    if (["easy", "medium", "advanced"].includes(difficulty)) {
      return difficulty as "easy" | "medium" | "advanced";
    }
    
    // Valor padrão caso nenhum dos anteriores seja válido
    return "medium";
  };
  
  const currentValues: SolutionFormValues = solution
    ? {
        title: solution.title,
        description: solution.description,
        category: solution.category as "revenue" | "operational" | "strategy",
        difficulty: normalizeDifficulty(solution.difficulty),
        thumbnail_url: solution.thumbnail_url || "",
        published: solution.published,
        slug: solution.slug,
      }
    : defaultValues;

  // Create a submit handler that uses our onSubmit function
  const handleSubmit = (values: SolutionFormValues) => {
    // Garantir que difficulty seja normalizado antes de enviar
    const normalizedValues = {
      ...values,
      difficulty: normalizeDifficulty(values.difficulty)
    };
    
    return onSubmit(normalizedValues);
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
