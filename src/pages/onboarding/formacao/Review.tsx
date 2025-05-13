
import React, { useEffect, useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useNavigate } from "react-router-dom";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useStepPersistenceCore } from "@/hooks/onboarding/useStepPersistenceCore";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ChevronRight, Loader2 } from "lucide-react";

const FormacaoReview = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { progress, isLoading, refreshProgress } = useProgress();
  
  const { completeOnboarding } = useStepPersistenceCore({
    currentStepIndex: 4,
    setCurrentStepIndex: () => {},
    navigate,
    onboardingType: 'formacao',
  });
  
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await refreshProgress();
      } catch (error) {
        console.error("Erro ao carregar dados para revisão:", error);
        toast.error("Não foi possível carregar seus dados para revisão");
      }
    };
    
    loadInitialData();
  }, []);

  const handleComplete = async () => {
    try {
      setIsSubmitting(true);
      await completeOnboarding();
    } catch (error) {
      console.error("Erro ao finalizar onboarding:", error);
      toast.error("Erro ao concluir o processo. Por favor, tente novamente.");
      setIsSubmitting(false);
    }
  };
  
  const handleEditSection = (sectionPath: string) => {
    navigate(sectionPath);
  };

  if (isLoading) {
    return (
      <OnboardingLayout 
        currentStep={5} 
        title="Revisão" 
        backUrl="/onboarding/formacao/preferences"
        isFormacao={true}
      >
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
          <p className="ml-4 text-gray-400">Carregando seus dados...</p>
        </div>
      </OnboardingLayout>
    );
  }
  
  // Verificar se temos dados suficientes para mostrar a revisão
  if (!progress || !progress.personal_info) {
    return (
      <OnboardingLayout 
        currentStep={5} 
        title="Revisão" 
        backUrl="/onboarding/formacao/preferences"
        isFormacao={true}
      >
        <div className="bg-amber-950/30 p-6 rounded-lg border border-amber-700">
          <h3 className="text-lg font-medium text-amber-300">Dados incompletos</h3>
          <p className="mt-2 text-amber-200">
            Não conseguimos encontrar todos os dados necessários para revisão. Por favor, volte às etapas anteriores 
            e verifique se preencheu todas as informações.
          </p>
          <div className="mt-4">
            <Button 
              onClick={() => navigate("/onboarding/formacao/personal-info")}
              variant="outline"
            >
              Voltar ao início
            </Button>
          </div>
        </div>
      </OnboardingLayout>
    );
  }

  const personalInfo = progress.personal_info;
  const aiExperience = progress.ai_experience;
  const formationData = progress.formation_data;
  
  // Função para obter rótulo do nível de conhecimento
  const getKnowledgeLevelLabel = (level?: string) => {
    const levels: Record<string, string> = {
      "beginner": "Iniciante",
      "intermediate": "Intermediário",
      "advanced": "Avançado",
      "expert": "Especialista"
    };
    return level ? levels[level] || level : "Não informado";
  };
  
  // Função para obter rótulos do estilo de aprendizado
  const getLearningStyleLabel = (styles?: string[]) => {
    if (!styles || styles.length === 0) return "Não informado";
    
    const styleMap: Record<string, string> = {
      "visual": "Visual",
      "auditory": "Auditivo",
      "reading": "Leitura",
      "practice": "Prática"
    };
    
    return styles.map(style => styleMap[style] || style).join(", ");
  };

  return (
    <OnboardingLayout 
      currentStep={5} 
      title="Revisão e Confirmação" 
      backUrl="/onboarding/formacao/preferences"
      isFormacao={true}
    >
      <div className="text-gray-300 mb-6">
        <p>Revise suas informações antes de finalizar o processo.</p>
        <p>Se precisar fazer alterações, clique no botão "Editar" da respectiva seção.</p>
      </div>
      
      <div className="space-y-6">
        {/* Dados Pessoais */}
        <Card className="bg-[#151823] border-neutral-700">
          <CardHeader className="flex flex-row items-center justify-between bg-slate-800 rounded-t-lg">
            <div>
              <CardTitle className="text-white">Dados Pessoais</CardTitle>
              <CardDescription className="text-gray-300">Informações de contato</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleEditSection("/onboarding/formacao/personal-info")}
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              Editar
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-400">Nome</dt>
                <dd className="mt-1 text-base text-white">{personalInfo.name || "Não informado"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-400">Email</dt>
                <dd className="mt-1 text-base text-white">{personalInfo.email || "Não informado"}</dd>
              </div>
              {personalInfo.phone && (
                <div>
                  <dt className="text-sm font-medium text-gray-400">Telefone</dt>
                  <dd className="mt-1 text-base text-white">{personalInfo.ddi || "+55"} {personalInfo.phone}</dd>
                </div>
              )}
              {personalInfo.city && (
                <div>
                  <dt className="text-sm font-medium text-gray-400">Localização</dt>
                  <dd className="mt-1 text-base text-white">
                    {[personalInfo.city, personalInfo.state, personalInfo.country].filter(Boolean).join(", ")}
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
        
        {/* Experiência com IA */}
        <Card className="bg-[#151823] border-neutral-700">
          <CardHeader className="flex flex-row items-center justify-between bg-slate-800 rounded-t-lg">
            <div>
              <CardTitle className="text-white">Experiência com IA</CardTitle>
              <CardDescription className="text-gray-300">Seu conhecimento atual</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleEditSection("/onboarding/formacao/ai-experience")}
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              Editar
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-400">Nível de conhecimento</dt>
                <dd className="mt-1 text-base text-white">{getKnowledgeLevelLabel(aiExperience?.knowledge_level)}</dd>
              </div>
              {aiExperience?.previous_tools && aiExperience.previous_tools.length > 0 && (
                <div>
                  <dt className="text-sm font-medium text-gray-400">Ferramentas já utilizadas</dt>
                  <dd className="mt-1 text-base text-white">{aiExperience.previous_tools.join(", ")}</dd>
                </div>
              )}
              {aiExperience?.desired_ai_areas && aiExperience.desired_ai_areas.length > 0 && (
                <div className="col-span-2">
                  <dt className="text-sm font-medium text-gray-400">Áreas de interesse</dt>
                  <dd className="mt-1 text-base text-white">{aiExperience.desired_ai_areas.join(", ")}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
        
        {/* Objetivos e Preferências */}
        <Card className="bg-[#151823] border-neutral-700">
          <CardHeader className="flex flex-row items-center justify-between bg-slate-800 rounded-t-lg">
            <div>
              <CardTitle className="text-white">Objetivos e Preferências</CardTitle>
              <CardDescription className="text-gray-300">Suas metas de aprendizado</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleEditSection("/onboarding/formacao/preferences")}
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              Editar
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {formationData?.learning_goals && formationData.learning_goals.length > 0 && (
                <div className="col-span-2">
                  <dt className="text-sm font-medium text-gray-400">Objetivos de aprendizado</dt>
                  <dd className="mt-1 text-base text-white">{formationData.learning_goals.join(", ")}</dd>
                </div>
              )}
              {formationData?.preferred_learning_style && (
                <div>
                  <dt className="text-sm font-medium text-gray-400">Estilo de aprendizado preferido</dt>
                  <dd className="mt-1 text-base text-white">{getLearningStyleLabel(formationData.preferred_learning_style)}</dd>
                </div>
              )}
              {formationData?.availability_hours_per_week && (
                <div>
                  <dt className="text-sm font-medium text-gray-400">Disponibilidade semanal</dt>
                  <dd className="mt-1 text-base text-white">{formationData.availability_hours_per_week} horas</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
        
        {/* Botão de confirmação */}
        <div className="flex flex-col items-center mt-10">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-white">Pronto para começar sua jornada?</h3>
            <p className="mt-2 text-gray-300">Suas informações serão usadas para personalizar sua experiência</p>
          </div>
          
          <Button 
            onClick={handleComplete}
            disabled={isSubmitting}
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 mt-4 px-12 py-6 text-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Finalizando...
              </>
            ) : (
              <>
                <Check className="mr-2 h-5 w-5" />
                Confirmar e Começar
              </>
            )}
          </Button>
          
          <p className="text-xs text-gray-400 mt-4">
            Ao confirmar, você será direcionado para sua área de aprendizado personalizada
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default FormacaoReview;
