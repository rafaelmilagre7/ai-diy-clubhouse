
import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { useSolutionEditor } from '@/components/admin/solution-editor/useSolutionEditor';
import LoadingScreen from '@/components/common/LoadingScreen';
import SolutionEditorHeader from '@/components/admin/solution-editor/SolutionEditorHeader';
import SolutionEditorTabs from '@/components/admin/solution-editor/SolutionEditorTabs';
import { Card, CardContent } from '@/components/ui/card';
import NavigationButtons from '@/components/admin/solution-editor/NavigationButtons';
import AuthError from '@/components/admin/solution-editor/AuthError';
import { useToast } from '@/hooks/use-toast';

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
  
  const handleSaveWithToast = async () => {
    try {
      await onSubmit({...currentValues, published: currentStep === totalSteps - 1});
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
