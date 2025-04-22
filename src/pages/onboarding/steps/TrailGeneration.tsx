import React, { useState, useEffect, useCallback } from "react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { generateTrail } from "@/services/trailGeneration";
import { useLogging } from "@/hooks/useLogging";

const TrailGeneration: React.FC = () => {
  const navigate = useNavigate();
  const { log } = useLogging();
  const [trail, setTrail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>("Gerando sua trilha personalizada...");
  const [showButton, setShowButton] = useState(false);
  const { progress } = useOnboardingSteps();
  const { refreshProgress } = useProgress();

  useEffect(() => {
    const loadData = async () => {
      console.log("Carregando dados atualizados na página de geração de trilha");
      await refreshProgress();
    };
    
    loadData();
  }, [refreshProgress]);

  const generatePersonalizedTrail = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setProgressMessage("Analisando suas respostas...");
    
    try {
      if (!progress) {
        throw new Error("Dados do onboarding não encontrados.");
      }
      
      log("trail_generation_started", { userId: progress.user_id });
      
      const generatedTrail = await generateTrail(progress);
      
      if (!generatedTrail) {
        throw new Error("Falha ao gerar a trilha personalizada.");
      }
      
      log("trail_generation_success", { userId: progress.user_id, trail: generatedTrail });
      
      setTrail(generatedTrail);
      setProgressMessage("Trilha gerada com sucesso!");
      setShowButton(true);
    } catch (err: any) {
      console.error("Erro ao gerar trilha:", err);
      log("trail_generation_error", { error: err.message });
      setError("Erro ao gerar sua trilha personalizada. Por favor, tente novamente.");
      toast.error("Erro ao gerar sua trilha personalizada. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, [progress, log]);

  useEffect(() => {
    generatePersonalizedTrail();
  }, [generatePersonalizedTrail]);

  const handleContinue = useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <OnboardingLayout
      currentStep={9}
      totalSteps={9}
      title="Sua Trilha Personalizada"
      backUrl="/onboarding/review"
      hideProgress={true}
    >
      <div className="flex flex-col items-center justify-center h-full">
        <MilagrinhoMessage
          message="Parabéns! Com base nas suas respostas, montamos uma trilha de conteúdo personalizada para você."
        />
        {isLoading && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin h-10 w-10 text-[#0ABAB5]" />
            <p className="text-gray-500">{progressMessage}</p>
          </div>
        )}
        {error && (
          <div className="text-red-500 mt-4">
            {error}
          </div>
        )}
        {trail && !isLoading && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <h3 className="text-xl font-semibold text-white">Sua Trilha:</h3>
            <ul className="list-disc pl-5 text-white">
              {trail.map((item: any) => (
                <li key={item.id}>{item.title}</li>
              ))}
            </ul>
          </div>
        )}
        {showButton && (
          <Button onClick={handleContinue} className="mt-8 bg-[#0ABAB5] hover:bg-[#0ABAB5]/90">
            Ir para o Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </OnboardingLayout>
  );
};

export default TrailGeneration;
