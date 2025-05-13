
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { ImplementationTrailCreator } from "@/components/implementation-trail/ImplementationTrailCreator";
import { OnboardingIncompleteState } from "@/components/implementation-trail/OnboardingIncompleteState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const ImplementationTrailPage = () => {
  const navigate = useNavigate();
  const { progress, isLoading, refreshProgress } = useProgress();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  const [showRefreshButton, setShowRefreshButton] = useState(false);

  useEffect(() => {
    // Carregar os dados do progresso e verificar se estão presentes
    const loadProgressData = async () => {
      try {
        await refreshProgress();
        
        // Aguardar um breve momento para dar tempo ao estado de ser atualizado
        setTimeout(() => {
          if (!isLoading && progress === null) {
            setShowRefreshButton(true);
          }
        }, 2000);
      } catch (error) {
        console.error("Erro ao atualizar dados de progresso:", error);
      }
    };
    
    loadProgressData();
  }, []);

  useEffect(() => {
    if (!isLoading && progress) {
      setIsOnboardingComplete(progress.is_completed || false);
    }
  }, [progress, isLoading]);

  // Função para recarregar dados após tentativas falhas
  const handleRefresh = async () => {
    try {
      setShowRefreshButton(false);
      toast.info("Recarregando seus dados...");
      await refreshProgress();
      
      // Verificar novamente após recarregar
      setTimeout(() => {
        if (!progress) {
          setShowRefreshButton(true);
          toast.error("Ainda não foi possível carregar seus dados. Tente novamente mais tarde.");
        } else {
          setIsOnboardingComplete(progress.is_completed || false);
        }
      }, 2000);
    } catch (error) {
      console.error("Erro ao recarregar dados:", error);
      setShowRefreshButton(true);
      toast.error("Erro ao carregar seus dados. Tente novamente.");
    }
  };

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
  
  // Se não conseguimos carregar os dados mesmo após tentativas
  if (progress === null && showRefreshButton) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Trilha de Implementação</CardTitle>
            <CardDescription>
              Tivemos um problema ao carregar seus dados
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-[250px]">
            <p className="text-muted-foreground mb-4">Não foi possível carregar seus dados. Verifique sua conexão e tente novamente.</p>
            <Button 
              onClick={handleRefresh} 
              className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
            >
              Recarregar dados
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se o onboarding não foi concluído, exibir mensagem orientando o usuário
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
            <OnboardingIncompleteState onNavigateToOnboarding={() => navigate("/onboarding")} />
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
