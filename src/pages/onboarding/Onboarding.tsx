
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useAuth } from "@/contexts/auth";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { PersonalInfoFormFull } from "@/components/onboarding/steps/PersonalInfoFormFull";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { Button } from "@/components/ui/button";
import { TrailGenerationPanel } from "@/components/onboarding/TrailGenerationPanel";
import { toast } from "sonner";

const Onboarding = () => {
  const { user } = useAuth();
  const { progress, isLoading } = useProgress();
  const navigate = useNavigate();
  const [showTrailPanel, setShowTrailPanel] = useState(false);

  // Se o usuário não estiver autenticado, redireciona para login
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  // Extrair primeiro nome para mensagem de boas-vindas
  const firstName = user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0] || '';

  // Se onboarding já foi concluído, mostrar painel de onboarding e trilha (não mais redirecionar)
  const isOnboardingCompleted = !!progress?.is_completed;

  // Carregamento inicial
  if (isLoading) {
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
            : "Parabéns! Você concluiu o onboarding. Aqui você pode editar suas informações e gerar uma nova trilha personalizada quando quiser!"
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
                  Edite suas respostas sempre que precisar. E sempre que atualizar, pode regenerar sua trilha personalizada.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate("/onboarding/review")}>
                  Revisar/Editar Respostas
                </Button>
                <Button className="bg-[#0ABAB5] text-white" onClick={() => setShowTrailPanel((v) => !v)}>
                  {!showTrailPanel ? "Ver Minha Trilha" : "Ocultar Trilha"}
                </Button>
              </div>
            </div>
            {/* Painel de trilha: aberto inline ou oculto por toggle */}
            {showTrailPanel && (
              <div className="mt-8">
                <TrailGenerationPanel />
              </div>
            )}
          </div>
        )}
      </div>
    </OnboardingLayout>
  );
};

export default Onboarding;
