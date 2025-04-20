
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { OnboardingSteps } from "@/components/onboarding/OnboardingSteps";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">
            Bem-vindo ao VIVER DE IA Club!
          </h1>
          <p className="text-xl text-gray-300">
            Vamos configurar seu perfil para personalizar sua experiência.
          </p>
        </div>

        <OnboardingSteps />
      </div>
    </OnboardingLayout>
  );
};

export default Onboarding;
