
import React, { useEffect, useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { PersonalInfoStep } from "@/components/onboarding/steps/PersonalInfoStep";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const PersonalInfo = () => {
  const { saveStepData, progress, completeOnboarding, navigateToStep } = useOnboardingSteps();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isLoading, refreshProgress, lastError } = useProgress();
  const navigate = useNavigate();
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Efeito para carregar dados mais recentes ao entrar na página
  useEffect(() => {
    console.log("PersonalInfo montado - carregando dados mais recentes");
    refreshProgress();
  }, [refreshProgress]);

  const handleSaveData = async (data: any) => {
    setIsSubmitting(true);
    setFormErrors([]);
    
    try {
      console.log("Salvando dados pessoais:", data);
      await saveStepData(data, true);
      console.log("Dados pessoais salvos com sucesso");
      
      toast.success("Dados salvos com sucesso!", {
        description: "Redirecionando para a próxima etapa...",
        icon: <CheckCircle className="h-5 w-5 text-green-500" />
      });
      
      // Navegar para a próxima etapa após salvar
      setTimeout(() => {
        navigate("/onboarding/professional-data");
      }, 800);
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      setFormErrors(["Falha ao salvar dados. Verifique sua conexão."]);
      
      toast.error("Erro ao salvar dados", {
        description: "Verifique sua conexão e tente novamente.",
        icon: <AlertCircle className="h-5 w-5 text-red-500" />
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingLayout
      currentStep={1}
      title="Dados Pessoais"
      description="Vamos conhecer um pouco mais sobre você para personalizar sua experiência no VIVER DE IA Club."
      backUrl="/onboarding"
      onStepClick={(step) => navigateToStep(step - 1)}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <MilagrinhoMessage
          message="Bem-vindo ao onboarding do VIVER DE IA Club! Vamos começar coletando algumas informações pessoais para personalizar sua experiência."
        />
        
        {lastError && (
          <Alert variant="destructive" className="animate-fade-in">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {lastError.message || "Erro ao carregar dados. Tente novamente."}
            </AlertDescription>
          </Alert>
        )}
        
        {formErrors.length > 0 && (
          <Alert variant="destructive" className="animate-fade-in">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {formErrors.map((err, i) => (
                <div key={i}>{err}</div>
              ))}
            </AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <LoadingSpinner size={10} />
            <p className="text-gray-500 animate-pulse">Carregando seus dados...</p>
          </div>
        ) : (
          <PersonalInfoStep
            onSubmit={handleSaveData}
            isSubmitting={isSubmitting}
            initialData={progress?.personal_info}
          />
        )}
      </div>
    </OnboardingLayout>
  );
};

export default PersonalInfo;
