
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useAuth } from "@/contexts/auth";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { PersonalInfoFormFull } from "@/components/onboarding/steps/PersonalInfoFormFull";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Onboarding = () => {
  const { user } = useAuth();
  const { progress, isLoading: progressLoading } = useProgress();
  const navigate = useNavigate();
  
  // Definimos a variável isOnboardingCompleted antes de usá-la em qualquer lugar
  const isOnboardingCompleted = !!progress?.is_completed;
  
  // Redirecionar se não autenticado
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  // Extrai primeiro nome
  const firstName = user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0] || '';

  // Redireciona para a página de geração de trilha 
  const handleViewTrail = useCallback(() => {
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
            : "Parabéns! Você concluiu o onboarding. Aqui você pode editar suas informações e acessar sua trilha personalizada sempre que quiser!"
          }
        />

        {/* Fluxo: onboarding incompleto, mostra formulário. Caso completo, mostra área de controle + link para trilha */}
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
                  Edite suas respostas sempre que precisar. Para acessar sua trilha personalizada, clique no botão abaixo!
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => navigate("/onboarding/review")}>
                  Revisar/Editar Respostas
                </Button>
                
                <Button 
                  className="bg-[#0ABAB5] text-white hover:bg-[#09a19c]" 
                  onClick={handleViewTrail}
                >
                  Acessar Minha Trilha
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </OnboardingLayout>
  );
};

export default Onboarding;
