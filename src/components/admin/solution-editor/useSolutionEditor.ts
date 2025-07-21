
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useSolutionData } from "@/hooks/useSolutionData";
import { useSolutionSave } from "@/hooks/useSolutionSave";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";
import { useToast } from "@/hooks/use-toast";

export const useSolutionEditor = (id: string | undefined, user: any) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [currentStepSaveFunction, setCurrentStepSaveFunction] = useState<(() => Promise<void>) | undefined>();

  // Hook para dados da solução
  const { solution, loading, setSolution } = useSolutionData(id);
  
  // Hook para salvamento
  const { onSubmit, saving: savingSolution } = useSolutionSave(id, setSolution);
  
  // Estado para valores atuais do formulário (para manter compatibilidade)
  const [currentValues, setCurrentValues] = useState<SolutionFormValues>({
    title: solution?.title || '',
    description: solution?.description || '',
    category: (solution?.category as "Receita" | "Operacional" | "Estratégia") || 'Receita',
    difficulty: solution?.difficulty || 'easy',
    slug: solution?.slug || '',
    thumbnail_url: solution?.thumbnail_url || '',
    published: solution?.published || false
  });

  // Atualizar valores quando solução carregar
  useEffect(() => {
    if (solution) {
      setCurrentValues({
        title: solution.title || '',
        description: solution.description || '',
        category: (solution.category as "Receita" | "Operacional" | "Estratégia") || 'Receita',
        difficulty: solution.difficulty || 'easy',
        slug: solution.slug || '',
        thumbnail_url: solution.thumbnail_url || '',
        published: solution.published || false
      });
    }
  }, [solution]);

  const stepTitles = [
    "Informações Básicas",
    "Ferramentas", 
    "Materiais",
    "Vídeos",
    "Checklist",
    "Publicar"
  ];

  const totalSteps = stepTitles.length;

  // Mapear activeTab baseado no currentStep
  useEffect(() => {
    const stepToTab = {
      0: "basic",
      1: "tools", 
      2: "resources",
      3: "video",
      4: "checklist",
      5: "publish"
    };
    setActiveTab(stepToTab[currentStep as keyof typeof stepToTab] || "basic");
  }, [currentStep]);

  // Callback para registrar função de salvamento da etapa atual
  const handleStepSaveRegistration = useCallback((stepSaveFunction: () => Promise<void>) => {
    console.log("📝 useSolutionEditor: REGISTRANDO função de salvamento da etapa");
    setCurrentStepSaveFunction(() => stepSaveFunction);
  }, []);

  // Função para salvar a etapa atual - agora usa a função registrada
  const handleSaveCurrentStep = useCallback(async (stepSaveFunction?: () => Promise<void>) => {
    console.log("💾 useSolutionEditor: Salvando etapa atual:", currentStep);
    console.log("🔧 useSolutionEditor: Função passada como parâmetro:", !!stepSaveFunction);
    console.log("🔧 useSolutionEditor: Função registrada:", !!currentStepSaveFunction);
    
    setSaving(true);
    
    try {
      switch (currentStep) {
        case 0:
          // Etapa básica - usar onSubmit existente
          console.log("💾 useSolutionEditor: Salvando informações básicas...");
          await onSubmit(currentValues);
          break;
          
        case 1:
          // Etapa de ferramentas - usar função registrada ou passada
          const toolsSaveFunction = stepSaveFunction || currentStepSaveFunction;
          if (toolsSaveFunction) {
            console.log("💾 useSolutionEditor: Salvando ferramentas com função registrada...");
            await toolsSaveFunction();
          } else {
            console.log("⚠️ useSolutionEditor: Nenhuma função de salvamento disponível para ferramentas");
            throw new Error("Função de salvamento de ferramentas não encontrada");
          }
          break;
          
        case 2:
        case 3:
        case 4:
        case 5:
          // Para outras etapas, usar a função de salvamento passada
          if (stepSaveFunction) {
            console.log(`💾 useSolutionEditor: Salvando etapa ${currentStep}...`);
            await stepSaveFunction();
          } else {
            console.log(`⚠️ useSolutionEditor: Nenhuma função de salvamento para etapa ${currentStep}`);
          }
          break;
          
        default:
          console.log("⚠️ useSolutionEditor: Etapa não reconhecida:", currentStep);
      }
      
      console.log("✅ useSolutionEditor: Etapa salva com sucesso");
      
    } catch (error) {
      console.error("❌ useSolutionEditor: Erro ao salvar etapa:", error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [currentStep, onSubmit, currentValues, currentStepSaveFunction]);

  const handleNextStep = useCallback(async (stepSaveFunction?: () => Promise<void>) => {
    console.log("▶️ useSolutionEditor: Avançando para próxima etapa...");
    console.log("🔍 useSolutionEditor: Etapa atual:", currentStep);
    console.log("🔧 useSolutionEditor: Função de salvamento:", !!stepSaveFunction);
    console.log("🔧 useSolutionEditor: Função registrada:", !!currentStepSaveFunction);
    
    try {
      // Salvar etapa atual antes de avançar
      await handleSaveCurrentStep(stepSaveFunction);
      
      // Avançar para próxima etapa
      if (currentStep < totalSteps - 1) {
        const nextStep = currentStep + 1;
        console.log(`📈 useSolutionEditor: Avançando da etapa ${currentStep} para ${nextStep}`);
        setCurrentStep(nextStep);
        
        // Limpar função registrada ao mudar de etapa
        setCurrentStepSaveFunction(undefined);
        
        toast({
          title: "Progresso salvo",
          description: `Avançando para: ${stepTitles[nextStep]}`
        });
      }
      
    } catch (error) {
      console.error("❌ useSolutionEditor: Erro ao avançar etapa:", error);
      toast({
        title: "Erro ao avançar",
        description: "Não foi possível salvar e avançar para a próxima etapa.",
        variant: "destructive"
      });
      throw error;
    }
  }, [currentStep, totalSteps, handleSaveCurrentStep, toast, stepTitles, currentStepSaveFunction]);

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
    handleStepSaveRegistration
  };
};
