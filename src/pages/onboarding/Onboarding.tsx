
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { PersonalInfoFormFull } from "@/components/onboarding/steps/PersonalInfoFormFull";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";

const Onboarding = () => {
  const { user } = useAuth();
  const { progress, isLoading } = useProgress();
  const navigate = useNavigate();
  const [checkComplete, setCheckComplete] = useState(false);

  // Se já completou, redirecionar para dashboard
  useEffect(() => {
    if (!isLoading && progress?.is_completed && !checkComplete) {
      setCheckComplete(true);
      toast.info("Você já completou o onboarding!");
      navigate("/dashboard", { replace: true });
    }
  }, [isLoading, progress, navigate, checkComplete]);

  // Se o usuário não estiver autenticado, redirecionamos para login
  if (!user) {
    navigate("/login", { replace: true });
    return null;
  }
  
  // Mostra tela de carregamento apenas na primeira carga
  if (isLoading && !checkComplete) return (
    <OnboardingLayout currentStep={1} title="Carregando...">
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0ABAB5]"></div>
      </div>
    </OnboardingLayout>
  );

  // Extrair primeiro nome para mensagem de boas-vindas
  const firstName = user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0] || '';

  return (
    <OnboardingLayout 
      currentStep={1} 
      title="Dados Pessoais"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <MilagrinhoMessage 
          userName={firstName}
          message="Eu sou o Milagrinho, seu assistente de IA do VIVER DE IA Club. Vamos começar conhecendo um pouco sobre você. Estas informações vão me ajudar a personalizar sua experiência, onde você vai encontrar uma comunidade incrível de pessoas transformando negócios com IA."
        />
        
        <div className="mt-8">
          <PersonalInfoFormFull />
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default Onboarding;
