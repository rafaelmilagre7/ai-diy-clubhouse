
import { useState, useEffect } from "react";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";
import { useSolutionData } from "@/hooks/useSolutionData";
import { useSolutionSave } from "@/hooks/useSolutionSave";
import { useSolutionSteps } from "@/hooks/useSolutionSteps";
import { Solution } from "@/lib/supabase";
import { toast } from "sonner";

export const useSolutionEditor = (id: string | undefined, user: any) => {
  // Get solution data - agora com setSolution disponível
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
  
  const [currentValuesState, setCurrentValuesState] = useState<SolutionFormValues>(defaultValues);
  
  // Atualizar valores atuais quando a solução mudar
  useEffect(() => {
    if (solution) {
      const updatedValues = {
        title: solution.title,
        description: solution.description,
        category: solution.category as "revenue" | "operational" | "strategy",
        difficulty: solution.difficulty as "easy" | "medium" | "advanced",
        thumbnail_url: solution.thumbnail_url || "",
        published: solution.published,
        slug: solution.slug,
      };
      setCurrentValuesState(updatedValues);
      
      console.log("Valores da solução carregados:", updatedValues);
    } else if (!loading && id) {
      console.warn("Solução não encontrada para edição com ID:", id);
    }
  }, [solution, loading, id]);

  // Create a submit handler that uses our onSubmit function
  const handleSubmit = (values: SolutionFormValues) => {
    console.log("Enviando formulário com valores:", values);
    return onSubmit(values)
      .then(() => {
        setCurrentValuesState(values);
        toast.success("Solução salva com sucesso!");
      })
      .catch((error) => {
        console.error("Erro ao salvar solução:", error);
        toast.error("Erro ao salvar solução", {
          description: "Por favor, tente novamente."
        });
      });
  };

  return {
    solution,
    loading,
    saving,
    activeTab,
    setActiveTab,
    onSubmit: handleSubmit,
    currentValues: currentValuesState,
    currentStep,
    setCurrentStep,
    totalSteps,
    stepTitles
  };
};
