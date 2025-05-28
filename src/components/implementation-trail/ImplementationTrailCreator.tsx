
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuickOnboardingValidation } from "@/hooks/onboarding/useQuickOnboardingValidation";
import { useImplementationTrail } from "@/hooks/implementation/useImplementationTrail";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { OnboardingIncompleteState } from "./OnboardingIncompleteState";
import { TrailGenerationAnimation } from "./TrailGenerationAnimation";
import { TrailDisplayContent } from "./TrailDisplayContent";

export const ImplementationTrailCreator = () => {
  const navigate = useNavigate();
  const { validateOnboardingCompletion } = useQuickOnboardingValidation();
  const { trail, isLoading, hasContent, generateImplementationTrail } = useImplementationTrail();
  
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  // Verificar onboarding e primeira visita
  useEffect(() => {
    const checkOnboardingAndFirstVisit = async () => {
      try {
        console.log('🔍 Verificando status do onboarding...');
        
        const isComplete = await validateOnboardingCompletion();
        setOnboardingComplete(isComplete);
        
        if (isComplete) {
          // Verificar se é primeira visita
          const firstVisitKey = 'implementation_trail_first_visit';
          const hasVisited = localStorage.getItem(firstVisitKey);
          
          if (!hasVisited && !hasContent) {
            setIsFirstVisit(true);
            localStorage.setItem(firstVisitKey, 'true');
            
            // Gerar trilha automaticamente na primeira visita
            handleGenerateTrail();
          }
        }
      } catch (error) {
        console.error("❌ Erro ao verificar onboarding:", error);
        toast.error("Erro ao verificar seus dados. Tente novamente.");
        setOnboardingComplete(false);
      }
    };

    checkOnboardingAndFirstVisit();
  }, [validateOnboardingCompletion, hasContent]);

  const handleGenerateTrail = async () => {
    try {
      setIsGenerating(true);
      console.log('🚀 Gerando trilha personalizada...');
      
      await generateImplementationTrail();
      
      toast.success("Trilha personalizada gerada com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao gerar trilha:", error);
      toast.error("Erro ao gerar trilha personalizada.");
    } finally {
      setIsGenerating(false);
      setIsFirstVisit(false);
    }
  };

  const handleNavigateToOnboarding = () => {
    navigate("/onboarding-new");
  };

  // Loading inicial
  if (onboardingComplete === null || isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 text-viverblue animate-spin mr-3" />
        <span className="text-neutral-300">Verificando seus dados...</span>
      </div>
    );
  }

  // Onboarding incompleto
  if (!onboardingComplete) {
    return (
      <OnboardingIncompleteState 
        onNavigateToOnboarding={handleNavigateToOnboarding}
      />
    );
  }

  // Primeira visita - animação de geração
  if (isFirstVisit || isGenerating) {
    return (
      <TrailGenerationAnimation 
        isGenerating={isGenerating}
        onComplete={() => setIsFirstVisit(false)}
      />
    );
  }

  // Trilha já existe - exibir conteúdo
  if (hasContent && trail) {
    return (
      <TrailDisplayContent 
        trail={trail}
        onRegenerate={handleGenerateTrail}
      />
    );
  }

  // Estado de erro ou trilha não encontrada
  return (
    <Card className="bg-[#151823]/80 border-neutral-700/50">
      <CardContent className="pt-6">
        <div className="text-center py-8">
          <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-4">
            Trilha não encontrada
          </h3>
          <p className="text-neutral-300 mb-6 max-w-md mx-auto">
            Não foi possível carregar sua trilha de implementação. 
            Vamos gerar uma nova trilha personalizada para você.
          </p>
          
          <Button 
            onClick={handleGenerateTrail}
            disabled={isGenerating}
            className="bg-viverblue hover:bg-viverblue/90"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Gerar Trilha Personalizada
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
