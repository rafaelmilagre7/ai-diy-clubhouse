
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase, Solution } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";
import { useSolutionData } from "@/hooks/useSolutionData";

export const useSolutionEditor = (id: string | undefined, user: any) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { solution, setSolution, loading } = useSolutionData(id);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [currentStep, setCurrentStep] = useState(0);
  const [currentValues, setCurrentValues] = useState<SolutionFormValues>({
    title: "",
    description: "",
    difficulty: "easy",
    category_id: "",
    status: "draft"
  });

  // Refs para funções de salvamento de cada etapa
  const saveToolsRef = useRef<(() => Promise<void>) | null>(null);
  const saveResourcesRef = useRef<(() => Promise<void>) | null>(null);
  const saveVideoRef = useRef<(() => Promise<void>) | null>(null);
  const saveChecklistRef = useRef<(() => Promise<void>) | null>(null);

  const stepTitles = [
    "Informações Básicas",
    "Ferramentas", 
    "Materiais",
    "Vídeos",
    "Checklist",
    "Publicar"
  ];
  const totalSteps = stepTitles.length;

  // Carregar dados da solução ao montar
  useEffect(() => {
    if (solution) {
      setCurrentValues({
        title: solution.title || "",
        description: solution.description || "",
        difficulty: solution.difficulty || "easy",
        category_id: solution.category_id || "",
        status: solution.status || "draft"
      });
    }
  }, [solution]);

  // Registrar funções de salvamento
  const registerSaveFunction = useCallback((step: number, saveFunction: () => Promise<void>) => {
    switch (step) {
      case 1:
        saveToolsRef.current = saveFunction;
        break;
      case 2:
        saveResourcesRef.current = saveFunction;
        break;
      case 3:
        saveVideoRef.current = saveFunction;
        break;
      case 4:
        saveChecklistRef.current = saveFunction;
        break;
    }
  }, []);

  const onSubmit = useCallback(async (values: SolutionFormValues): Promise<void> => {
    try {
      setSaving(true);
      
      let solutionData;
      if (id && solution) {
        // Atualizar solução existente
        const { data, error } = await supabase
          .from("solutions")
          .update({
            title: values.title,
            description: values.description,
            difficulty: values.difficulty,
            category_id: values.category_id || null,
            status: values.status,
            updated_at: new Date().toISOString()
          })
          .eq("id", id)
          .select()
          .single();
          
        if (error) throw error;
        solutionData = data;
      } else {
        // Criar nova solução
        const { data, error } = await supabase
          .from("solutions")
          .insert({
            title: values.title,
            description: values.description,
            difficulty: values.difficulty,
            category_id: values.category_id || null,
            status: values.status,
            user_id: user?.id
          })
          .select()
          .single();
          
        if (error) throw error;
        solutionData = data;
        
        // Redirecionar para edição da nova solução
        navigate(`/admin/solutions/${solutionData.id}`);
      }
      
      setSolution(solutionData as Solution);
      setCurrentValues(values);
      
    } catch (error: any) {
      console.error("Erro ao salvar solução:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar a solução.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setSaving(false);
    }
  }, [id, solution, user, setSolution, navigate, toast]);

  const handleSaveCurrentStep = useCallback(async (): Promise<void> => {
    if (currentStep === 0) {
      // Etapa básica - usar onSubmit
      const form = document.querySelector("form");
      if (form) {
        const submitEvent = new Event("submit", { cancelable: true, bubbles: true });
        form.dispatchEvent(submitEvent);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      return;
    }

    // Outras etapas - usar funções registradas
    const saveFunction = getSaveFunctionForStep(currentStep);
    if (saveFunction) {
      await saveFunction();
    } else {
      throw new Error(`Função de salvamento não encontrada para etapa ${currentStep}`);
    }
  }, [currentStep]);

  const getSaveFunctionForStep = (step: number) => {
    switch (step) {
      case 1: return saveToolsRef.current;
      case 2: return saveResourcesRef.current; 
      case 3: return saveVideoRef.current;
      case 4: return saveChecklistRef.current;
      default: return null;
    }
  };

  const handleNextStep = useCallback(async (): Promise<void> => {
    try {
      setSaving(true);
      
      // Salvar etapa atual antes de avançar
      await handleSaveCurrentStep();
      
      // Avançar para próxima etapa
      if (currentStep < totalSteps - 1) {
        setCurrentStep(prev => prev + 1);
      }
      
      toast({
        title: "Progresso salvo",
        description: "Etapa salva com sucesso!"
      });
      
    } catch (error: any) {
      console.error("Erro ao avançar etapa:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar a etapa atual.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setSaving(false);
    }
  }, [currentStep, totalSteps, handleSaveCurrentStep, toast]);

  return {
    solution,
    loading,
    saving,
    activeTab,
    setActiveTab,
    onSubmit,
    currentValues,
    currentStep,
    setCurrentStep,
    totalSteps,
    stepTitles,
    handleNextStep,
    handleSaveCurrentStep,
    registerSaveFunction
  };
};
