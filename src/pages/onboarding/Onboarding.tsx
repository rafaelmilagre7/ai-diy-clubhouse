
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
  const [showTrailPanel, setShowTrailPanel] = useState(false);

  // Hook para trilha com força refresh ao montar
  const { 
    trail, 
    isLoading: trailLoading, 
    generateImplementationTrail,
    refreshTrail,
    hasContent
  } = useImplementationTrail();

  // Se o usuário não estiver autenticado, redireciona para login
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  // Forçar carregamento da trilha ao montar
  useEffect(() => {
    const loadTrail = async () => {
      console.log("Forçando carregamento inicial da trilha");
      await refreshTrail(true);
    };
    
    loadTrail();
  }, [refreshTrail]);

  // Extrair primeiro nome para mensagem de boas-vindas
  const firstName = user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0] || '';

  // Se onboarding já foi concluído, mostrar painel de onboarding e trilha
  const isOnboardingCompleted = !!progress?.is_completed;

  // Função para gerar trilha com feedback aprimorado
  const handleGenerateTrail = useCallback(async () => {
    try {
      toast.loading("Gerando sua trilha personalizada...");
      await generateImplementationTrail();
      toast.dismiss();
      setShowTrailPanel(true);
    } catch (error) {
      toast.dismiss();
      console.error("Erro ao gerar trilha:", error);
      toast.error("Ocorreu um erro ao gerar sua trilha. Tente novamente.");
    }
  }, [generateImplementationTrail]);

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

        {/* Fluxo: Caso onboarding incompleto, formulário normal. Se completo, mostra painel de edição e acesso à trilha */}
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
                  Edite suas respostas sempre que precisar. Você pode acessar sua trilha já gerada ou atualizar para uma nova a qualquer momento!
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate("/onboarding/review")}>
                  Revisar/Editar Respostas
                </Button>
                
                {/* Exibe botões condicionalmente com base no estado da trilha e carregamento */}
                {trailLoading ? (
                  <Button disabled className="bg-gray-200 text-gray-500">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Carregando trilha...
                  </Button>
                ) : hasContent ? (
                  <Button 
                    className="bg-[#0ABAB5] text-white hover:bg-[#09a19c]" 
                    onClick={() => setShowTrailPanel((v) => !v)}
                  >
                    {!showTrailPanel ? "Ver Minha Trilha" : "Ocultar Trilha"}
                  </Button>
                ) : (
                  <Button
                    className="bg-[#0ABAB5] text-white hover:bg-[#09a19c]"
                    onClick={handleGenerateTrail}
                    disabled={trailLoading}
                  >
                    Gerar Trilha Personalizada
                  </Button>
                )}
                
                {hasContent && (
                  <Button
                    variant="secondary"
                    className="border-[#0ABAB5] text-[#0ABAB5]"
                    onClick={handleGenerateTrail}
                    disabled={trailLoading}
                  >
                    Gerar Nova Trilha
                  </Button>
                )}
              </div>
            </div>
            
            {/* Painel de trilha: aberto inline ou oculto por toggle */}
            {showTrailPanel && hasContent && (
              <div className="mt-8">
                <TrailGenerationPanel onClose={() => setShowTrailPanel(false)} />
              </div>
            )}
            
            {/* Caso esteja carregando a trilha */}
            {showTrailPanel && trailLoading && (
              <div className="flex flex-col items-center gap-4 py-8 mt-8">
                <Loader2 className="h-8 w-8 text-[#0ABAB5] animate-spin" />
                <span className="text-[#0ABAB5] font-medium">Carregando sua trilha personalizada...</span>
              </div>
            )}
            
            {/* Mensagem se não houver trilha mas o painel estiver aberto */}
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
