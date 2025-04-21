
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useAuth } from "@/contexts/auth";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { PersonalInfoFormFull } from "@/components/onboarding/steps/PersonalInfoFormFull";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { Button } from "@/components/ui/button";
import { TrailGenerationPanel } from "@/components/onboarding/TrailGenerationPanel";
import { useImplementationTrail } from "@/hooks/implementation/useImplementationTrail";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Onboarding = () => {
  const { user } = useAuth();
  const { progress, isLoading: progressLoading } = useProgress();
  const navigate = useNavigate();
  
  // Exibe painel da trilha se ela existir, exceto ao gerar agora
  const [showTrailPanel, setShowTrailPanel] = useState(false);

  // Hook da trilha
  const { 
    trail, 
    isLoading: trailLoading, 
    refreshTrail,
    hasContent
  } = useImplementationTrail();

  // Redirecionar se não autenticado
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  // Carregar trilha ao montar ou ao progredir onboarding
  useEffect(() => {
    const loadTrail = async () => {
      await refreshTrail(true);
    };
    loadTrail();
  }, [refreshTrail]);

  // Extrai primeiro nome
  const firstName = user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0] || '';

  const isOnboardingCompleted = !!progress?.is_completed;

  // Mostrar painel da trilha automaticamente após onboarding completo e a trilha existir
  useEffect(() => {
    if (isOnboardingCompleted && hasContent && !trailLoading) {
      setShowTrailPanel(true);
    }
  }, [isOnboardingCompleted, hasContent, trailLoading]);

  // Redireciona para a página de geração de trilha
  const handleGenerateTrail = useCallback(() => {
    navigate("/onboarding/trail-generation");
  }, [navigate]);

  // Carregamento inicial
  if (progressLoading) {
    return (
      <OnboardingLayout currentStep={1} title="Carregando...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0ABAB5]"></div>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout 
      currentStep={1} 
      title="Personalização e Trilha VIVER DE IA"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <MilagrinhoMessage 
          userName={firstName}
          message={!isOnboardingCompleted 
            ? "Eu sou o Milagrinho, seu assistente de IA do VIVER DE IA Club. Vamos começar conhecendo um pouco sobre você. Estas informações vão me ajudar a personalizar sua experiência, onde você vai encontrar uma comunidade incrível transformando negócios com IA."
            : "Parabéns! Você concluiu o onboarding. Aqui você pode editar suas informações e consultar ou gerar uma nova trilha personalizada sempre que quiser!"
          }
        />

        {/* Fluxo: onboarding incompleto, mostra formulário. Caso completo, mostra área de controle + trilha diretamente */}
        {!isOnboardingCompleted ? (
          <div className="mt-8">
            <PersonalInfoFormFull />
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-6 border border-[#0ABAB5]/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-[#0ABAB5] mb-1">
                  Onboarding Completo!
                </h3>
                <p className="text-gray-600 text-sm">
                  Edite suas respostas sempre que precisar. Você pode acessar sua trilha já gerada ou gerar uma nova a qualquer momento!
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate("/onboarding/review")}>
                  Revisar/Editar Respostas
                </Button>
                
                {/* Exibe botões com base na existência da trilha */}
                {trailLoading ? (
                  <Button disabled className="bg-gray-200 text-gray-500">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Carregando trilha...
                  </Button>
                ) : hasContent ? (
                  <Button 
                    className="bg-[#0ABAB5] text-white hover:bg-[#09a19c]" 
                    onClick={() => setShowTrailPanel((prev) => !prev)}
                  >
                    {!showTrailPanel ? "Ver Minha Trilha" : "Ocultar Trilha"}
                  </Button>
                ) : (
                  <Button
                    className="bg-[#0ABAB5] text-white hover:bg-[#09a19c]"
                    onClick={handleGenerateTrail}
                  >
                    Gerar Trilha Personalizada
                  </Button>
                )}
                
                {hasContent && (
                  <Button
                    variant="secondary"
                    className="border-[#0ABAB5] text-[#0ABAB5]"
                    onClick={handleGenerateTrail}
                  >
                    Gerar Nova Trilha
                  </Button>
                )}
              </div>
            </div>
            
            {/* Exibe painel da trilha já carregada logo abaixo do header quando a trilha existe e não está carregando */}
            {showTrailPanel && hasContent && !trailLoading && (
              <div className="mt-8">
                <TrailGenerationPanel onClose={() => setShowTrailPanel(false)} />
              </div>
            )}
            
            {/* Em loading */}
            {showTrailPanel && trailLoading && (
              <div className="flex flex-col items-center gap-4 py-8 mt-8">
                <Loader2 className="h-8 w-8 text-[#0ABAB5] animate-spin" />
                <span className="text-[#0ABAB5] font-medium">Carregando sua trilha personalizada...</span>
              </div>
            )}
            
            {/* Caso não haja trilha após abertura do painel */}
            {showTrailPanel && !hasContent && !trailLoading && (
              <div className="text-center mt-8 p-6 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-gray-600 mb-4">
                  Nenhuma trilha personalizada foi encontrada. Vamos criar uma agora!
                </p>
                <Button 
                  className="bg-[#0ABAB5] text-white" 
                  onClick={handleGenerateTrail}
                >
                  Gerar Trilha Personalizada
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </OnboardingLayout>
  );
};

export default Onboarding;
