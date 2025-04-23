
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProgress } from "@/hooks/implementation/useProgress";
import { ImplementationTrailCreator } from "@/components/implementation-trail/ImplementationTrailCreator";
import { OnboardingIncompleteState } from "@/components/implementation-trail/OnboardingIncompleteState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const ImplementationTrailPage = () => {
  const navigate = useNavigate();
  const { progress, isLoading } = useProgress();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isLoading && progress) {
      setIsOnboardingComplete(progress.is_completed || false);
    }
  }, [progress, isLoading]);

  // Enquanto os dados estão carregando, exibir tela de carregamento
  if (isLoading) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="h-8 w-8 text-[#0ABAB5] animate-spin mb-4" />
            <p className="text-muted-foreground">Carregando dados...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se o onboarding não foi concluído, exibir mensagem orientando o usuário para o Perfil de Implementação
  if (isOnboardingComplete === false) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Trilha de Implementação</CardTitle>
            <CardDescription>
              Personalize sua experiência no VIVER DE IA Club com uma trilha exclusiva
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <h3 className="text-lg font-medium mb-2">Complete seu perfil para gerar sua trilha</h3>
              <p className="text-muted-foreground mb-6 max-w-lg">
                Para podermos criar uma trilha de implementação personalizada para você, 
                precisamos que você complete seu Perfil de Implementação.
              </p>
              <Button 
                onClick={() => navigate("/perfil-de-implementacao")} 
                className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
              >
                Completar Perfil de Implementação
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quando o onboarding estiver completo, exibir o criador de trilha
  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Trilha de Implementação</CardTitle>
          <CardDescription>
            Sua trilha personalizada com base no seu perfil e objetivos de negócio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImplementationTrailCreator />
        </CardContent>
      </Card>
    </div>
  );
};

export default ImplementationTrailPage;
