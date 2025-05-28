
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuickOnboardingValidation } from "@/hooks/onboarding/useQuickOnboardingValidation";
import { ImplementationTrailCreator } from "@/components/implementation-trail/ImplementationTrailCreator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { PageTransition } from "@/components/transitions/PageTransition";
import { FadeTransition } from "@/components/transitions/FadeTransition";

const ImplementationTrailPage = () => {
  const navigate = useNavigate();
  const { validateOnboardingCompletion } = useQuickOnboardingValidation();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const checkOnboardingStatus = async () => {
    try {
      setIsLoading(true);
      console.log('Verificando status do onboarding...');
      
      const isComplete = await validateOnboardingCompletion();
      console.log('Status do onboarding:', isComplete);
      
      setIsOnboardingComplete(isComplete);
      
      if (!isComplete && retryCount < 2) {
        console.log('Onboarding incompleto, tentando novamente em 1 segundo...');
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 1000);
      }
    } catch (error) {
      console.error("Erro ao verificar status do onboarding:", error);
      if (retryCount < 2) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 2000);
      } else {
        toast.error("Erro ao verificar seus dados. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkOnboardingStatus();
  }, [retryCount]);

  const handleRefresh = () => {
    setRetryCount(0);
    checkOnboardingStatus();
  };

  const handleGoToOnboarding = () => {
    navigate("/onboarding-new");
  };

  // Loading state
  if (isLoading) {
    return (
      <PageTransition>
        <div className="container py-8">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[300px]">
              <FadeTransition>
                <Loader2 className="h-8 w-8 text-viverblue animate-spin mb-4" />
                <p className="text-neutral-300">Verificando seus dados...</p>
              </FadeTransition>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    );
  }

  // Onboarding incompleto
  if (isOnboardingComplete === false) {
    return (
      <PageTransition>
        <div className="container py-8">
          <Card>
            <CardHeader>
              <CardTitle>Trilha de Implementação</CardTitle>
              <CardDescription>
                Para gerar sua trilha personalizada, você precisa completar o onboarding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FadeTransition>
                <div className="text-center py-8">
                  <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Complete seu perfil primeiro
                  </h3>
                  <p className="text-neutral-300 mb-6 max-w-md mx-auto">
                    Para criarmos uma trilha de implementação personalizada para seu negócio, 
                    precisamos conhecer melhor seu perfil e objetivos.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button 
                      onClick={handleGoToOnboarding}
                      className="bg-viverblue hover:bg-viverblue/90"
                    >
                      Completar Onboarding
                    </Button>
                    <Button 
                      onClick={handleRefresh}
                      variant="outline"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Verificar Novamente
                    </Button>
                  </div>
                </div>
              </FadeTransition>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    );
  }

  // Onboarding completo - mostrar trilha
  return (
    <PageTransition>
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Trilha de Implementação</CardTitle>
            <CardDescription>
              Sua trilha personalizada com base no seu perfil e objetivos de negócio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FadeTransition>
              <ImplementationTrailCreator />
            </FadeTransition>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default ImplementationTrailPage;
