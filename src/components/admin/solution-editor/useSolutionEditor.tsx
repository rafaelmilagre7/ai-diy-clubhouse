
import { useState } from "react";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";
import { useSolutionData } from "@/hooks/useSolutionData";
import { useSolutionSave } from "@/hooks/useSolutionSave";
import { useSolutionSteps } from "@/hooks/useSolutionSteps";
import { useToast } from "@/hooks/use-toast";

export const useSolutionEditor = (id: string | undefined, user: any) => {
  const { toast } = useToast();
  
  // Get solution data
  const { solution, setSolution, loading } = useSolutionData(id);
  
  // Get step navigation
  const { currentStep, setCurrentStep, activeTab, setActiveTab, totalSteps, stepTitles } = useSolutionSteps(0);
  
  // Get save functionality
  const { saving, onSubmit } = useSolutionSave(id, setSolution);
  
  // Estado para salvamento de etapas específicas
  const [stepSaving, setStepSaving] = useState(false);
  
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
          if (!solution?.id) return false;
          
          // Verificar se existem ferramentas selecionadas
          const toolsEvent = new CustomEvent('validate-tools-step');
          window.dispatchEvent(toolsEvent);
          
          // Por enquanto, permitir prosseguir (a validação real será implementada no componente)
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
      setStepSaving(true);
      
      // Primeiro, salvar os dados atuais
      await handleSaveCurrentStep();
      
      // Validar se a etapa atual está completa
      const isValid = await validateStepCompletion(currentStep);
      if (!isValid) {
        throw new Error("Complete os campos obrigatórios desta etapa antes de continuar");
      }
      
      // Avançar para próxima etapa
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
        toast({
          title: "Etapa salva com sucesso",
          description: "Avançando para a próxima etapa."
        });
      }
    } catch (error) {
      console.error("Erro ao avançar etapa:", error);
      toast({
        title: "Erro ao avançar",
        description: error instanceof Error ? error.message : "Não foi possível avançar para a próxima etapa.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setStepSaving(false);
    }
  };

  // Save current step data using direct function calls instead of events
  const handleSaveCurrentStep = async (): Promise<void> => {
    try {
      // Para a primeira etapa, usar onSubmit padrão
      if (currentStep === 0) {
        await onSubmit(currentValues);
        return;
      }

      // Para outras etapas, chamar função de salvamento específica
      if (currentStep === 1) {
        // Tools step - disparar salvamento das ferramentas
        const saveToolsPromise = new Promise<void>((resolve, reject) => {
          const handleToolsSaved = (event: CustomEvent) => {
            window.removeEventListener('tools-saved', handleToolsSaved as EventListener);
            if (event.detail.success) {
              resolve();
            } else {
              reject(new Error(event.detail.error || "Erro ao salvar ferramentas"));
            }
          };
          
          window.addEventListener('tools-saved', handleToolsSaved as EventListener);
          
          // Disparar evento para salvar ferramentas
          const saveEvent = new CustomEvent('save-tools-step');
          window.dispatchEvent(saveEvent);
          
          // Timeout de segurança
          setTimeout(() => {
            window.removeEventListener('tools-saved', handleToolsSaved as EventListener);
            reject(new Error("Timeout ao salvar ferramentas"));
          }, 10000);
        });
        
        await saveToolsPromise;
      }
      
      // Para outras etapas, implementar salvamento específico conforme necessário
      
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
    saving: saving || stepSaving,
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
