
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { PersonalInfoFormFull } from "@/components/onboarding/steps/PersonalInfoFormFull";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Onboarding = () => {
  const { user } = useAuth();
  const { progress, isLoading } = useProgress();
  const navigate = useNavigate();
  const [checkComplete, setCheckComplete] = useState(false);

  useEffect(() => {
    // Só verificamos se já completou após carregar e apenas uma vez
    if (!isLoading && progress?.is_completed && !checkComplete) {
      setCheckComplete(true);
      toast.info("Você já completou o onboarding!");
      navigate("/dashboard", { replace: true });
    }
  }, [isLoading, progress, navigate, checkComplete]);

  if (!user) return null;
  
  // Mostra tela de carregamento apenas na primeira carga
  if (isLoading && !checkComplete) return (
    <OnboardingLayout currentStep={1} title="Carregando...">
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0ABAB5]"></div>
      </div>
    </OnboardingLayout>
  );

  return (
    <OnboardingLayout 
      currentStep={1} 
      title="Dados Pessoais"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center mb-1">
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-gray-600"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        <div className="mt-8">
          <PersonalInfoFormFull />
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default Onboarding;
