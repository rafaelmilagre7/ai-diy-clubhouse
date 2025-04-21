
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useAuth } from "@/contexts/auth";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { OnboardingHeader } from "@/components/onboarding/OnboardingHeader";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { OnboardingCompleted } from "@/components/onboarding/OnboardingCompleted";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const Onboarding = () => {
  const { user, profile } = useAuth();
  const { progress, isLoading: progressLoading, refreshProgress } = useProgress();
  const navigate = useNavigate();
  const [refreshAttempt, setRefreshAttempt] = useState(0);

  // Atualizar dados ao montar o componente
  useEffect(() => {
    console.log("Onboarding montado - carregando dados");
    refreshProgress();
  }, [refreshProgress, refreshAttempt]);

  // Redirecionar para login se não autenticado
  useEffect(() => {
    if (!user) {
      toast.error("Você precisa estar autenticado para acessar esta página");
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  // Extrair primeiro nome do usuário
  const firstName =
    profile?.name?.split(" ")[0] ||
    user?.user_metadata?.name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "Usuário";

  const isOnboardingCompleted = !!progress?.is_completed;

  const handleRetryLoad = () => {
    toast.info("Tentando carregar dados novamente...");
    setRefreshAttempt(prev => prev + 1);
  };

  // Carregando progresso
  if (progressLoading) {
    return (
      <OnboardingLayout currentStep={1} title="Carregando...">
        <div className="flex flex-col justify-center items-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0ABAB5]"></div>
          <p className="text-gray-500">Carregando seus dados...</p>
        </div>
      </OnboardingLayout>
    );
  }

  // Se houver erro ao carregar os dados
  if (!progress && !progressLoading) {
    return (
      <OnboardingLayout currentStep={1} title="Erro ao carregar dados">
        <div className="flex flex-col justify-center items-center h-64 space-y-4">
          <div className="bg-red-50 p-6 rounded-lg border border-red-200 max-w-md text-center">
            <h3 className="text-red-700 text-lg font-medium mb-2">Erro ao carregar seus dados</h3>
            <p className="text-red-600 mb-4">Não foi possível carregar suas informações de progresso.</p>
            <Button 
              onClick={handleRetryLoad}
              className="inline-flex items-center gap-2"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              Tentar novamente
            </Button>
          </div>
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
        <OnboardingHeader firstName={firstName} isOnboardingCompleted={isOnboardingCompleted} />
        {!isOnboardingCompleted ? <OnboardingForm /> : <OnboardingCompleted />}
      </div>
    </OnboardingLayout>
  );
};

export default Onboarding;
