
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import SolutionEditorHeader from "@/components/admin/solution-editor/SolutionEditorHeader";
import SolutionEditorTabs from "@/components/admin/solution-editor/SolutionEditorTabs";
import { Card, CardContent } from "@/components/ui/card";
import NavigationButtons from "@/components/admin/solution-editor/NavigationButtons";
import AuthError from "@/components/admin/solution-editor/AuthError";
import { useToast } from "@/hooks/use-toast";
import { useSolutionEditor } from "@/components/admin/solution-editor/useSolutionEditor";

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
    stepTitles,
    handleNextStep,
    handleSaveCurrentStep,
    handleStepSaveRegistration
  } = useSolutionEditor(id, user);
  
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
      console.error("Erro ao salvar:", error);
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

  // Determina a cor do nível de dificuldade
  const getDifficultyColor = () => {
    const difficulty = currentValues.difficulty;
    switch (difficulty) {
      case "easy":
        return "bg-operational";
      case "medium":
        return "bg-status-warning";
      case "advanced":
        return "bg-status-error";
      default:
        return "bg-muted";
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
      />
      
      {!user && <AuthError />}
      
      <Card className="border-border/20 shadow-none bg-card/50 backdrop-blur-sm">
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
          onNext={handleNextStep}
          onSave={handleSaveWithToast}
          saving={saving}
        />
      )}
    </div>
  );
};

export default SolutionEditor;
