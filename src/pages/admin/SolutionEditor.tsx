
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import SolutionEditorHeader from "@/components/admin/solution-editor/SolutionEditorHeader";
import SolutionEditorTabs from "@/components/admin/solution-editor/SolutionEditorTabs";
import { useSolutionEditor } from "@/components/admin/solution-editor/useSolutionEditor";
import { Card, CardContent } from "@/components/ui/card";
import ProgressIndicator from "@/components/admin/solution-editor/ProgressIndicator";
import NavigationButtons from "@/components/admin/solution-editor/NavigationButtons";
import AuthError from "@/components/admin/solution-editor/AuthError";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

const SolutionEditor = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  
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
    stepTitles
  } = useSolutionEditor(id, user);
  
  // Auto-save when changing steps
  useEffect(() => {
    // Skip auto-save during initial loading
    if (solution && currentStep > 0) {
      onSubmit(currentValues);
    }
  }, [currentStep]);
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  const handleSave = () => {
    // Na primeira etapa, dispara o submit do formulário
    if (currentStep === 0) {
      const form = document.querySelector("form");
      if (form) form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    } else {
      // Nas outras etapas, chama a função específica de salvamento
      onSubmit({...currentValues, published: currentStep === totalSteps - 1})
        .then(() => {
          toast({
            title: "Progresso salvo",
            description: "Suas alterações foram salvas com sucesso."
          });
        })
        .catch(error => {
          toast({
            title: "Erro ao salvar",
            description: "Ocorreu um erro ao salvar suas alterações.",
            variant: "destructive"
          });
        });
    }
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps - 1) {
      // Salvar o estado atual antes de avançar
      handleSave();
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Determina a cor do nível de dificuldade
  const getDifficultyColor = () => {
    const difficulty = currentValues.difficulty;
    switch (difficulty) {
      case "easy":
        return "bg-green-500";
      case "medium":
        return "bg-orange-500";
      case "advanced":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };
  
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <SolutionEditorHeader 
        id={id} 
        saving={saving} 
        onSave={handleSave}
        title={currentValues.title}
        difficulty={currentValues.difficulty}
        difficultyColor={getDifficultyColor()}
      />
      
      {!user && <AuthError />}
      
      {(solution || currentStep === 0) && (
        <ProgressIndicator 
          currentStep={currentStep}
          totalSteps={totalSteps}
          stepTitle={stepTitles[currentStep]}
        />
      )}
      
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
          />
        </CardContent>
      </Card>
      
      {(solution || currentStep === 0) && (
        <NavigationButtons 
          currentStep={currentStep}
          totalSteps={totalSteps}
          onPrevious={handlePreviousStep}
          onNext={handleNextStep}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
};

export default SolutionEditor;
