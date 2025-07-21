
import { useState } from "react";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";
import { useSolutionData } from "@/hooks/useSolutionData";
import { useSolutionSave } from "@/hooks/useSolutionSave";
import { useSolutionSteps } from "@/hooks/useSolutionSteps";
import { useToast } from "@/hooks/use-toast";
import { Solution } from "@/lib/supabase";

export const useSolutionEditor = (id: string | undefined, user: any) => {
  const { toast } = useToast();
  
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
        difficulty: solution.difficulty as "easy" | "medium" | "advanced",
        thumbnail_url: solution.thumbnail_url || "",
        published: solution.published,
        slug: solution.slug,
      }
    : defaultValues;

  // Validate step completion before advancing
  const validateStepCompletion = async (step: number): Promise<boolean> => {
    switch (step) {
      case 0: // Basic info - sempre válido se chegou até aqui
        return true;
      
      case 1: // Tools - verificar se tem pelo menos uma ferramenta
        try {
          // Esta validação será implementada quando necessário
          // Por enquanto, permitir prosseguir
          return true;
        } catch (error) {
          console.error("Erro ao validar ferramentas:", error);
          return false;
        }
      
      case 2: // Resources - permitir prosseguir mesmo sem recursos
        return true;
      
      case 3: // Videos - permitir prosseguir mesmo sem vídeos
        return true;
      
      case 4: // Checklist - permitir prosseguir mesmo sem checklist
        return true;
      
      default:
        return true;
    }
  };

  // Save current step and advance
  const handleNextStep = async (): Promise<void> => {
    try {
      // Primeiro, salvar os dados atuais
      await handleSaveCurrentStep();
      
      // Validar se a etapa atual está completa
      const isValid = await validateStepCompletion(currentStep);
      if (!isValid) {
        throw new Error("Etapa incompleta");
      }
      
      // Avançar para próxima etapa
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
        toast({
          title: "Avançando para a próxima etapa",
          description: "Seus dados foram salvos com sucesso."
        });
      }
    } catch (error) {
      console.error("Erro ao avançar etapa:", error);
      throw error;
    }
  };

  // Save current step data
  const handleSaveCurrentStep = async (): Promise<void> => {
    try {
      // Para a primeira etapa, usar onSubmit padrão
      if (currentStep === 0) {
        await onSubmit(currentValues);
        return;
      }

      // Para outras etapas, disparar evento de salvamento
      const saveEvent = new CustomEvent('save-current-step', {
        detail: { step: currentStep }
      });
      window.dispatchEvent(saveEvent);
      
      // Aguardar um tempo para que o salvamento seja processado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error("Erro ao salvar etapa atual:", error);
      throw error;
    }
  };

  // Create a submit handler that uses our onSubmit function
  const handleSubmit = async (values: SolutionFormValues): Promise<void> => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error("Erro ao submeter formulário:", error);
      throw error;
    }
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
    stepTitles,
    handleNextStep,
    handleSaveCurrentStep
  };
};
