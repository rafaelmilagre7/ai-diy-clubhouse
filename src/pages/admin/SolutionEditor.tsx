
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
    totalSteps
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
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SolutionEditorHeader 
        id={id} 
        saving={saving} 
        onSave={handleSave} 
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
              Etapa {currentStep + 1} de {totalSteps}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round((currentStep / (totalSteps - 1)) * 100)}% concluído
            </span>
          </div>
          <Progress value={(currentStep / (totalSteps - 1)) * 100} className="h-2" />
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
            className="flex items-center"
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
