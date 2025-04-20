
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

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
      <div className="space-y-6 text-white">
        <h1 className="text-3xl font-bold">
          Bem-vindo ao VIVER DE IA Club!
        </h1>
        <p className="text-xl text-gray-300">
          Vamos configurar seu perfil para personalizar sua experiência.
        </p>
        {/* TODO: Implementar os steps do onboarding */}
      </div>
    </OnboardingLayout>
  );
};

export default Onboarding;
