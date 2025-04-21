
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Button } from "@/components/ui/button";
import { TrailGenerationPanel } from "@/components/onboarding/TrailGenerationPanel";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useAuth } from "@/contexts/auth";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const TrailGeneration = () => {
  const { user } = useAuth();
  const { progress } = useProgress();
  const navigate = useNavigate();
  const [isCompleting, setIsCompleting] = useState(false);
  
  // Extrair primeiro nome para mensagem de boas-vindas
  const firstName = user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0] || '';
  
  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      // Já estamos na página final, apenas navegar para o dashboard
      toast.success("Onboarding concluído com sucesso!");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Erro ao concluir onboarding:", error);
      toast.error("Erro ao concluir onboarding");
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <OnboardingLayout 
      currentStep={9} 
      title="Sua Trilha Personalizada"
      backUrl="/onboarding/review"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <CheckCircle2 className="h-12 w-12 text-[#0ABAB5] mx-auto mb-2" />
          <h2 className="text-2xl font-bold text-gray-900">
            Parabéns, {firstName}!
          </h2>
          <p className="text-gray-600 mt-2">
            Com base nas suas informações, criamos uma trilha personalizada de soluções de IA para seu negócio.
            Estas soluções foram cuidadosamente selecionadas para maximizar os resultados com base no seu contexto.
          </p>
        </div>

        <TrailGenerationPanel />

        <div className="flex justify-between mt-8">
          <Button 
            variant="outline" 
            onClick={() => navigate("/onboarding/review")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para Revisão
          </Button>
          
          <Button 
            className="bg-[#0ABAB5] hover:bg-[#09a29d] text-white"
            onClick={handleComplete}
            disabled={isCompleting}
          >
            {isCompleting ? "Concluindo..." : "Ir para o Dashboard"}
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default TrailGeneration;
