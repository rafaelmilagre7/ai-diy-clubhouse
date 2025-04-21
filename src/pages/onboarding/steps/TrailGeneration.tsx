
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { TrailGuidedExperience } from "@/components/onboarding/TrailGuidedExperience";
import { TrailMagicExperience } from "@/components/onboarding/TrailMagicExperience";
import { useImplementationTrail } from "@/hooks/implementation/useImplementationTrail";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const TrailGeneration = () => {
  const navigate = useNavigate();
  const { 
    trail, 
    isLoading, 
    generateImplementationTrail, 
    hasContent, 
    refreshTrail 
  } = useImplementationTrail();
  
  const [generatingTrail, setGeneratingTrail] = useState(false);
  const [showMagicExperience, setShowMagicExperience] = useState(false);

  // Carregar trilha existente ao montar o componente
  useEffect(() => {
    const loadTrail = async () => {
      try {
        await refreshTrail(true);
      } catch (error) {
        console.error("Erro ao carregar trilha:", error);
      }
    };
    
    loadTrail();
    console.log("Componente TrailGeneration montado");
  }, [refreshTrail]);

  // Função para iniciar a experiência mágica e gerar a trilha
  const startTrailGeneration = async () => {
    setShowMagicExperience(true);
    setGeneratingTrail(true);
    
    try {
      await generateImplementationTrail();
      toast.success("Trilha personalizada gerada com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar trilha:", error);
      toast.error("Ocorreu um erro ao gerar sua trilha. Tente novamente.");
    } finally {
      setGeneratingTrail(false);
    }
  };

  // Quando a animação terminar, mostrar a experiência guiada
  const handleMagicFinish = () => {
    setShowMagicExperience(false);
  };

  // Voltar para a página de onboarding
  const handleBackToOnboarding = () => {
    navigate("/onboarding");
  };

  // Se estiver carregando
  if (isLoading) {
    return (
      <OnboardingLayout 
        currentStep={9} 
        title="Sua Trilha Personalizada"
        backUrl="/onboarding"
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0ABAB5]"></div>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout 
      currentStep={9} 
      title="Sua Trilha Personalizada"
      backUrl="/onboarding"
    >
      <div className="max-w-5xl mx-auto p-4">
        {showMagicExperience ? (
          <TrailMagicExperience onFinish={handleMagicFinish} />
        ) : hasContent ? (
          <>
            <div className="mb-6 flex justify-between items-center">
              <Button 
                variant="outline" 
                onClick={handleBackToOnboarding}
              >
                Voltar para Onboarding
              </Button>
              <Button 
                className="bg-[#0ABAB5] text-white" 
                onClick={startTrailGeneration}
                disabled={generatingTrail}
              >
                {generatingTrail ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando Nova Trilha...
                  </>
                ) : "Gerar Nova Trilha"}
              </Button>
            </div>
            <TrailGuidedExperience />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-6 py-12">
            <h2 className="text-2xl font-bold text-[#0ABAB5]">
              Vamos criar sua trilha personalizada!
            </h2>
            <p className="text-gray-600 text-center max-w-lg">
              Com base nas informações que você forneceu, o Milagrinho irá gerar uma trilha personalizada 
              com as melhores soluções para o seu negócio.
            </p>
            <Button 
              className="bg-[#0ABAB5] text-white px-8 py-6 text-lg"
              onClick={startTrailGeneration}
              disabled={generatingTrail}
              size="lg"
            >
              {generatingTrail ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Gerando Trilha...
                </>
              ) : "Gerar Minha Trilha Personalizada"}
            </Button>
          </div>
        )}
      </div>
    </OnboardingLayout>
  );
};

export default TrailGeneration;
