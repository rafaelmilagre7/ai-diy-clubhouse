
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useSolution } from "@/hooks/useSolution";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";
import { useToast } from "@/hooks/use-toast";
import { useToolsChecklist } from "@/hooks/useToolsChecklist";

export const useSolutionEditor = (id: string | undefined, user: any) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const {
    solution,
    loading,
    onSubmit,
    currentValues
  } = useSolution(id, user);

  // Hook para ferramentas (apenas quando há solução)
  const { saveTools } = useToolsChecklist(solution?.id || null);

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

  const handleSaveCurrentStep = useCallback(async () => {
    console.log("💾 Salvando etapa atual:", currentStep);
    setSaving(true);
    
    try {
      switch (currentStep) {
        case 0:
          // Etapa básica - usar onSubmit existente
          console.log("💾 Salvando informações básicas...");
          await onSubmit(currentValues);
          break;
          
        case 1:
          // Etapa de ferramentas - chamar saveTools diretamente
          console.log("🔧 Salvando ferramentas...");
          if (saveTools) {
            await saveTools();
          }
          break;
          
        case 2:
          console.log("📚 Salvando materiais...");
          // Implementar salvamento de materiais se necessário
          break;
          
        case 3:
          console.log("🎥 Salvando vídeos...");
          // Implementar salvamento de vídeos se necessário
          break;
          
        case 4:
          console.log("✅ Salvando checklist...");
          // Implementar salvamento de checklist se necessário
          break;
          
        case 5:
          console.log("🚀 Publicando solução...");
          // Implementar publicação se necessário
          break;
          
        default:
          console.log("⚠️ Etapa não reconhecida:", currentStep);
      }
      
      console.log("✅ Etapa salva com sucesso");
      
    } catch (error) {
      console.error("❌ Erro ao salvar etapa:", error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [currentStep, onSubmit, currentValues, saveTools]);

  const handleNextStep = useCallback(async () => {
    console.log("▶️ Avançando para próxima etapa...");
    
    try {
      // Salvar etapa atual antes de avançar
      await handleSaveCurrentStep();
      
      // Avançar para próxima etapa
      if (currentStep < totalSteps - 1) {
        const nextStep = currentStep + 1;
        console.log(`📈 Avançando da etapa ${currentStep} para ${nextStep}`);
        setCurrentStep(nextStep);
      }
      
    } catch (error) {
      console.error("❌ Erro ao avançar etapa:", error);
      toast({
        title: "Erro ao avançar",
        description: "Não foi possível salvar e avançar para a próxima etapa.",
        variant: "destructive"
      });
      throw error;
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
    handleSaveCurrentStep
  };
};
