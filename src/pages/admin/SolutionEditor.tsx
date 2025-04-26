
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
    stepTitles
  } = useSolutionEditor(id, user);
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  // Função para mostrar toast explicitamente ao salvar
  const handleSaveWithToast = () => {
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
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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
