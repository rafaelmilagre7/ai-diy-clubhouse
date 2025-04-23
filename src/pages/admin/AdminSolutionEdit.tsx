
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useSolutionData } from "@/hooks/solution/useSolutionData";
import { useSolutionSave } from "@/hooks/useSolutionSave";
import { useState } from "react";
import TabBasedNavigation from "@/components/admin/solution-editor/components/TabBasedNavigation";
import SolutionEditorHeader from "@/components/admin/solution-editor/SolutionEditorHeader";
import AuthError from "@/components/admin/solution-editor/AuthError";
import NavigationButtons from "@/components/admin/solution-editor/NavigationButtons";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";

const AdminSolutionEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Estados para controle de navegação e formulário
  const [activeTab, setActiveTab] = useState("basic");
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const totalSteps = 7;
  
  // Busca dados da solução
  const { 
    solution, 
    loading, 
    setSolution 
  } = useSolutionData(id || "");
  
  // Valores iniciais do formulário
  const currentValues: SolutionFormValues = {
    title: solution?.title || "",
    description: solution?.description || "",
    category: (solution?.category as "revenue" | "operational" | "strategy") || "revenue",
    difficulty: (solution?.difficulty as "easy" | "medium" | "advanced") || "medium",
    thumbnail_url: solution?.thumbnail_url || "",
    published: solution?.published || false,
    slug: solution?.slug || ""
  };
  
  // Hook para salvar alterações
  const { onSubmit: saveSubmit } = useSolutionSave(id, setSolution);
  
  // Função para mostrar toast explicitamente ao salvar
  const handleSaveWithToast = () => {
    setSaving(true);
    
    saveSubmit({...currentValues, published: currentStep === totalSteps - 1})
      .then(() => {
        toast.success("Alterações salvas com sucesso");
        setSaving(false);
      })
      .catch(error => {
        console.error("Erro ao salvar:", error);
        toast.error("Erro ao salvar alterações");
        setSaving(false);
      });
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
  
  if (loading) {
    return <LoadingScreen message="Carregando editor de solução..." />;
  }
  
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
        <CardContent className="p-4 md:p-6">
          <TabBasedNavigation 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            solution={solution}
            currentValues={currentValues}
            onSubmit={saveSubmit}
            saving={saving}
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

export default AdminSolutionEdit;
