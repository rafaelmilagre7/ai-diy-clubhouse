
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { ImplementationTrailCreator } from "@/components/implementation-trail/ImplementationTrailCreator";
import { OnboardingIncompleteState } from "@/components/implementation-trail/OnboardingIncompleteState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { PageTransition } from "@/components/transitions/PageTransition";
import { FadeTransition } from "@/components/transitions/FadeTransition";

const ImplementationTrailPage = () => {
  const navigate = useNavigate();
  const { progress, isLoading, refreshProgress, updateProgress } = useProgress();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  const [showRefreshButton, setShowRefreshButton] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Carregar os dados do progresso com sistema de retry
    const loadProgressData = async () => {
      try {
        await refreshProgress();
        
        // Aguardar um breve momento para dar tempo ao estado de ser atualizado
        setTimeout(() => {
          if (!isLoading && progress === null) {
            setShowRefreshButton(true);
            
            // Tentar recarregar automaticamente até 2 vezes
            if (retryCount < 2) {
              console.log(`Tentativa automática de recarregar dados: ${retryCount + 1}`);
              setRetryCount(prev => prev + 1);
              refreshProgress();
            }
          }
        }, 1500);
      } catch (error) {
        console.error("Erro ao atualizar dados de progresso:", error);
        
        // Tentar recarregar automaticamente até 2 vezes
        if (retryCount < 2) {
          console.log(`Tentativa automática após erro: ${retryCount + 1}`);
          setRetryCount(prev => prev + 1);
          setTimeout(() => refreshProgress(), 2000); // Esperar 2 segundos antes de tentar novamente
        } else {
          setShowRefreshButton(true);
        }
      }
    };
    
    loadProgressData();
  }, [retryCount]);

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
      }, 1500);
    } catch (error) {
      console.error("Erro ao recarregar dados:", error);
      setShowRefreshButton(true);
      toast.error("Erro ao carregar seus dados. Tente novamente.");
    }
  };

  // Função para concluir o onboarding caso o usuário esteja na página da trilha
  // mas o onboarding não esteja marcado como concluído
  const handleCompleteOnboarding = async () => {
    if (!progress || isUpdatingStatus) return;
    
    try {
      setIsUpdatingStatus(true);
      console.log("Atualizando status do onboarding para completo...");
      
      // Atualiza o status do onboarding para completo
      await updateProgress({
        is_completed: true
      });
      
      // Atualizar dados locais
      await refreshProgress();
      
      setIsOnboardingComplete(true);
      toast.success("Onboarding marcado como concluído");
      
    } catch (error) {
      console.error("Erro ao atualizar status do onboarding:", error);
      toast.error("Erro ao atualizar seu progresso. Tente novamente mais tarde.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Enquanto os dados estão carregando, exibir tela de carregamento com animação
  if (isLoading) {
    return (
      <PageTransition>
        <div className="container py-8">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[300px]">
              <FadeTransition>
                <Loader2 className="h-8 w-8 text-[#0ABAB5] animate-spin mb-4" />
                <p className="text-neutral-300">Carregando dados...</p>
              </FadeTransition>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    );
  }
  
  // Se não conseguimos carregar os dados mesmo após tentativas
  if (progress === null && showRefreshButton) {
    return (
      <PageTransition>
        <div className="container py-8">
          <Card>
            <CardHeader>
              <CardTitle>Trilha de Implementação</CardTitle>
              <CardDescription>
                Tivemos um problema ao carregar seus dados
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center min-h-[250px]">
              <FadeTransition>
                <p className="text-neutral-300 mb-4">Não foi possível carregar seus dados. Verifique sua conexão e tente novamente.</p>
                <Button 
                  onClick={handleRefresh} 
                  className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Recarregar dados
                </Button>
              </FadeTransition>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    );
  }

  // Se o onboarding não foi concluído, exibir mensagem orientando o usuário
  if (isOnboardingComplete === false) {
    return (
      <PageTransition>
        <div className="container py-8">
          <Card>
            <CardHeader>
              <CardTitle>Trilha de Implementação</CardTitle>
              <CardDescription>
                Personalize sua experiência no VIVER DE IA Club com uma trilha exclusiva
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FadeTransition>
                <OnboardingIncompleteState 
                  onNavigateToOnboarding={() => navigate("/onboarding")} 
                  onForceComplete={handleCompleteOnboarding}
                  isForceCompleting={isUpdatingStatus}
                />
              </FadeTransition>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    );
  }

  // Quando o onboarding estiver completo, exibir o criador de trilha
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
