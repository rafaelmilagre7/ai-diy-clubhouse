
import { useState, useEffect } from "react";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";
import { useSolutionData } from "@/hooks/solution/useSolutionData";
import { useSolutionSave } from "@/hooks/useSolutionSave";
import { useSolutionSteps } from "@/hooks/useSolutionSteps";
import { Solution } from "@/lib/supabase";
import { toast } from "sonner";
import { useLogging } from "@/hooks/useLogging";

export const useSolutionEditor = (id: string | undefined, user: any) => {
  // Get solution data com setSolution disponível
  const { solution, isLoading: loading, error, refetch, setSolution } = useSolutionData(id || "");
  const { log, logError } = useLogging("useSolutionEditor");
  
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
  
  // Carregar solução imediatamente se o ID estiver disponível
  useEffect(() => {
    if (id) {
      log("Tentando buscar solução com ID:", { id });
      refetch();
    }
  }, [id, refetch, log]);
  
  // Atualizar valores atuais quando a solução mudar
  useEffect(() => {
    if (solution) {
      log("Atualizando valores do formulário com solução obtida", {
        title: solution.title,
        hasDescription: !!solution.description,
        category: solution.category
      });
      
      // Debug temporário para verificar os dados recebidos
      console.log("Dados da solução carregados:", solution);
      
      const updatedValues = {
        title: solution.title || "",
        description: solution.description || "",
        category: (solution.category || "revenue") as "revenue" | "operational" | "strategy",
        difficulty: (solution.difficulty || "medium") as "easy" | "medium" | "advanced",
        thumbnail_url: solution.thumbnail_url || "",
        published: solution.published || false,
        slug: solution.slug || "",
      };
      
      // Importante: garantir que os valores sejam atualizados imediatamente
      setCurrentValuesState(updatedValues);
    } else if (!loading && id) {
      logError("Solução não encontrada para edição", { id });
    }
  }, [solution, loading, id, log, logError]);

  // Create a submit handler that uses our onSubmit function
  const handleSubmit = (values: SolutionFormValues) => {
    log("Enviando formulário", values);
    return onSubmit(values)
      .then(() => {
        setCurrentValuesState(values);
        toast.success("Solução salva com sucesso!");
      })
      .catch((error) => {
        logError("Erro ao salvar solução", { error });
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
