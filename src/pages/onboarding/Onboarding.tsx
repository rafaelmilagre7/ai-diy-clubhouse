
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { EtapasProgresso } from "@/components/onboarding/EtapasProgresso";
import { ChatOnboarding } from "@/components/onboarding/ChatOnboarding";
import { PersonalInfoFormFull } from "@/components/onboarding/steps/PersonalInfoFormFull";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Onboarding = () => {
  const { user } = useAuth();
  const { progress, isLoading } = useProgress();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && progress?.is_completed) {
      toast.info("Você já completou o onboarding!");
      navigate("/dashboard");
    }
  }, [isLoading, progress, navigate]);

  if (!user || isLoading) return null;

  return (
    <OnboardingLayout>
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

        <ChatOnboarding />

        <div>
          <EtapasProgresso currentStep={1} totalSteps={7} />
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Dados Pessoais</h2>
          <PersonalInfoFormFull />
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default Onboarding;
