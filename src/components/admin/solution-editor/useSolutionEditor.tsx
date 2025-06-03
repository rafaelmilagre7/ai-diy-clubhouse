
import { useState } from "react";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";
import { useSolutionSave } from "@/hooks/useSolutionSave";
import { useSolutionSteps } from "@/hooks/useSolutionSteps";
import { Solution } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const useSolutionEditor = (id: string | undefined, user: any) => {
  // Get solution data directly using React Query
  const { data: solution, isLoading: loading } = useQuery({
    queryKey: ['solution', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const [solutionState, setSolution] = useState<Solution | null>(solution || null);
  
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
        difficulty: solution.difficulty as "easy" | "medium" | "advanced",
        thumbnail_url: solution.thumbnail_url || "",
        published: solution.published,
        slug: solution.slug,
      }
    : defaultValues;

  // Create a submit handler that uses our onSubmit function
  const handleSubmit = (values: SolutionFormValues) => {
    return onSubmit(values);
  };

  return {
    solution: solutionState || solution,
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
