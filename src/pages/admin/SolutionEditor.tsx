
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import SolutionEditorHeader from "@/components/admin/solution-editor/SolutionEditorHeader";
import SolutionEditorTabs from "@/components/admin/solution-editor/SolutionEditorTabs";
import { Card, CardContent } from "@/components/ui/card";
import NavigationButtons from "@/components/admin/solution-editor/NavigationButtons";
import AuthError from "@/components/admin/solution-editor/AuthError";
import { useToast } from "@/hooks/use-toast";
import { useSolutionEditor } from "@/components/admin/solution-editor/useSolutionEditor";
import { useEffect } from "react";
import { toast as sonnerToast } from "sonner";

const SolutionEditor = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Toast para informar que está carregando
  useEffect(() => {
    if (id) {
      sonnerToast.info("Carregando editor de solução...", {
        id: `loading-solution-editor-${id}`,
        duration: 3000
      });
    }
  }, [id]);
  
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
  
  useEffect(() => {
    // Logging for debugging purposes
    console.log("Solution Editor loaded with ID:", id);
    console.log("Solution data:", solution);
    
    if (!solution && !loading && id) {
      sonnerToast.error("Solução não encontrada", {
        description: "Não foi possível encontrar a solução com o ID fornecido.",
        id: `solution-editor-not-found-${id}`,
        duration: 5000
      });
    }
  }, [id, solution, loading]);
  
  if (loading) {
    return <LoadingScreen message="Carregando editor de solução..." />;
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
        onSave={handleSaveWithToast}
        title={currentValues.title}
        difficulty={currentValues.difficulty}
        difficultyColor={getDifficultyColor()}
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
