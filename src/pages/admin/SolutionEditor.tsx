
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import SolutionEditorHeader from "@/components/admin/solution-editor/SolutionEditorHeader";
import SolutionEditorTabs from "@/components/admin/solution-editor/SolutionEditorTabs";
import { useSolutionEditor } from "@/components/admin/solution-editor/useSolutionEditor";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { moduleTypes } from "@/components/admin/solution/moduleTypes";

const SolutionEditor = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
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
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  const handleSave = () => {
    if (activeTab === "basic") {
      const form = document.querySelector("form");
      if (form) form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    } else {
      onSubmit(currentValues);
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
      // Salvar o estado atual antes de retroceder
      handleSave();
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
      
      {!user && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro de autenticação</AlertTitle>
          <AlertDescription>
            Você precisa estar autenticado para editar soluções. Por favor, faça login novamente.
          </AlertDescription>
        </Alert>
      )}
      
      {solution && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Etapa {currentStep + 1} de {totalSteps}:
              <span className="ml-2 font-semibold text-primary">{stepTitles[currentStep]}</span>
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round((currentStep / (totalSteps - 1)) * 100)}% concluído
            </span>
          </div>
          <Progress 
            value={(currentStep / (totalSteps - 1)) * 100} 
            className="h-2" 
            indicatorClassName="bg-[#0ABAB5]"
          />
        </div>
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
      
      {solution && (
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePreviousStep}
            disabled={currentStep === 0}
            className="flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>
          
          <Button
            onClick={handleNextStep}
            disabled={currentStep === totalSteps - 1}
            className="flex items-center bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
          >
            Próximo
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default SolutionEditor;
