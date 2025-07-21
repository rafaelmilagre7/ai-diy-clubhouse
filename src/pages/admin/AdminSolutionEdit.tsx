
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import LoadingScreen from '@/components/common/LoadingScreen';
import SolutionEditorHeader from '@/components/admin/solution-editor/SolutionEditorHeader';
import SolutionEditorTabs from '@/components/admin/solution-editor/SolutionEditorTabs';
import { Card, CardContent } from '@/components/ui/card';
import NavigationButtons from '@/components/admin/solution-editor/NavigationButtons';
import AuthError from '@/components/admin/solution-editor/AuthError';
import { useToast } from '@/hooks/use-toast';
import { useSolutionEditor } from '@/components/admin/solution-editor/useSolutionEditor';

const AdminSolutionEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
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
  } = useSolutionEditor(id, user);
  
  useEffect(() => {
    // Logging para depuração
    console.log("🚀 AdminSolutionEdit: Solution Editor carregado com ID:", id);
    console.log("📊 AdminSolutionEdit: Dados da solução:", solution);
    console.log("📍 AdminSolutionEdit: Etapa atual:", currentStep);
    console.log("🔖 AdminSolutionEdit: Aba ativa:", activeTab);
    console.log("📋 AdminSolutionEdit: Valores atuais:", currentValues);
  }, [id, solution, currentStep, activeTab, currentValues]);
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  const handleSaveWithToast = async (): Promise<void> => {
    try {
      // Na primeira etapa, dispara o submit do formulário
      if (currentStep === 0) {
        const form = document.querySelector("form");
        if (form) {
          const submitEvent = new Event("submit", { cancelable: true, bubbles: true });
          form.dispatchEvent(submitEvent);
          // Aguardar processamento do form
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } else {
        // Nas outras etapas, salvar dados da etapa atual
        await handleSaveCurrentStep();
      }
      
      toast({
        title: "Progresso salvo",
        description: "Suas alterações foram salvas com sucesso."
      });
    } catch (error) {
      console.error("❌ AdminSolutionEdit: Erro ao salvar:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar suas alterações.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNextStepWithFunction = async () => {
    console.log("🚀 AdminSolutionEdit: Chamando handleNextStep");
    await handleNextStep();
  };

  // Determina a cor do nível de dificuldade
  const getDifficultyColor = () => {
    const difficulty = currentValues.difficulty;
    switch (difficulty) {
      case "easy":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "advanced":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };
  
  // Obtém o texto traduzido para a dificuldade
  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "Fácil";
      case "medium": return "Normal";
      case "advanced": return "Avançado";
      default: return difficulty;
    }
  };
  
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <SolutionEditorHeader 
        id={id} 
        saving={saving} 
        onSave={handleSaveWithToast}
        title={currentValues.title}
        difficulty={currentValues.difficulty}
        difficultyColor={getDifficultyColor()}
        difficultyText={getDifficultyText(currentValues.difficulty)}
      />
      
      {!user && <AuthError />}
      
      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <SolutionEditorTabs 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            solution={solution}
            currentValues={currentValues}
            onSubmit={onSubmit}
            saving={saving}
            currentStep={currentStep}
            onStepSave={handleStepSaveRegistration}
          />
        </CardContent>
      </Card>
      
      {(solution || currentStep === 0) && (
        <NavigationButtons 
          currentStep={currentStep}
          totalSteps={totalSteps}
          onPrevious={handlePreviousStep}
          onNext={handleNextStepWithFunction}
          onSave={handleSaveWithToast}
          saving={saving}
        />
      )}
    </div>
  );
};

export default AdminSolutionEdit;
