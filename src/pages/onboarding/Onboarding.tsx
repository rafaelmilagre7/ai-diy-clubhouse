
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useAuth } from "@/contexts/auth";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { OnboardingHeader } from "@/components/onboarding/OnboardingHeader";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { OnboardingCompleted } from "@/components/onboarding/OnboardingCompleted";

const Onboarding = () => {
  const { user } = useAuth();
  const { progress, isLoading: progressLoading } = useProgress();
  const navigate = useNavigate();

  // Redirecionar para login se não autenticado
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  // Extrai primeiro nome do usuário
  const firstName =
    user?.user_metadata?.name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "";

  const isOnboardingCompleted = !!progress?.is_completed;

  // Carregando progresso
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
        <OnboardingHeader firstName={firstName} isOnboardingCompleted={isOnboardingCompleted} />
        {!isOnboardingCompleted ? <OnboardingForm /> : <OnboardingCompleted />}
      </div>
    </OnboardingLayout>
  );
};

export default Onboarding;
