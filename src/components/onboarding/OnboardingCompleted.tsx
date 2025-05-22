
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Check, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { MoticonAnimation } from "./MoticonAnimation";

export const OnboardingCompleted: React.FC = () => {
  const navigate = useNavigate();
  const { progress, isLoading, refreshProgress } = useProgress();
  const [retryCount, setRetryCount] = useState(0);
  const [showError, setShowError] = useState(false);
  
  // Log para debugging
  useEffect(() => {
    console.log("[OnboardingCompleted] Iniciando carregamento de dados, tentativa:", retryCount + 1);
  }, [retryCount]);
  
  // Efeito para tentar recarregar o progresso se não tiver carregado
  useEffect(() => {
    // Se já temos dados válidos, não precisamos fazer nada
    if (progress?.is_completed) {
      return;
    }
    
    // Tentar atualizar os dados
    const loadData = async () => {
      if (retryCount >= 3) {
        // Limite de tentativas atingido, mostrar erro
        setShowError(true);
        return;
      }
      
      try {
        console.log("[OnboardingCompleted] Dados não encontrados, planejando nova tentativa");
        
        // Esperar um pouco antes da próxima tentativa (500ms * número da tentativa)
        setTimeout(async () => {
          await refreshProgress();
          
          // Incrementar o contador de tentativas
          setRetryCount(prev => prev + 1);
        }, 500 * (retryCount + 1));
      } catch (error) {
        console.error("[OnboardingCompleted] Erro ao buscar dados:", error);
        setShowError(true);
      }
    };
    
    loadData();
  }, [progress, retryCount, refreshProgress]);
  
  // Função para tentar novamente manualmente
  const handleRetry = async () => {
    setShowError(false);
    setRetryCount(0);
    
    try {
      toast.info("Tentando recarregar seus dados...");
      await refreshProgress();
    } catch (error) {
      console.error("[OnboardingCompleted] Erro ao recarregar dados:", error);
      setShowError(true);
      toast.error("Erro ao carregar dados. Tente novamente mais tarde.");
    }
  };
  
  // Tela de carregamento
  if (isLoading || (!progress && !showError && retryCount < 3)) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-lg mx-auto bg-[#0F111A]/80 border-neutral-800">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-viverblue animate-spin mb-4" />
            <p className="text-lg text-neutral-300">Carregando seus dados...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Tela de erro
  if (showError || (!progress && retryCount >= 3)) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-lg mx-auto bg-[#0F111A]/80 border-neutral-800">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="text-amber-500 bg-amber-950/30 p-3 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-alert-triangle"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <h3 className="text-lg font-semibold text-amber-200 mb-2">Erro ao carregar dados</h3>
            <p className="text-neutral-300 text-center mb-6">
              Não conseguimos carregar seus dados de onboarding. Verifique sua conexão ou tente novamente mais tarde.
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                className="border-neutral-700 hover:bg-neutral-800"
                onClick={() => navigate("/dashboard")}
              >
                Voltar ao Dashboard
              </Button>
              <Button 
                onClick={handleRetry}
                className="bg-viverblue hover:bg-viverblue-dark"
              >
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Tela de sucesso
  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-lg mx-auto bg-[#0F111A]/80 border-neutral-800">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="flex justify-center mb-6">
            <MoticonAnimation />
          </div>
          
          <div className="bg-green-900/20 p-3 rounded-full border border-green-600/30 mb-6">
            <Check className="h-6 w-6 text-green-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Onboarding Concluído!</h2>
          <p className="text-neutral-300 text-center mb-8">
            Parabéns! Você completou o onboarding do VIVER DE IA Club. 
            Agora você pode acessar todos os recursos da plataforma.
          </p>
          
          <div className="space-y-4 w-full">
            <Button 
              className="w-full bg-viverblue hover:bg-viverblue-dark"
              onClick={() => navigate("/dashboard")}
            >
              Ir para o Dashboard
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
            
            <Button 
              className="w-full bg-viverblue/10 hover:bg-viverblue/20 text-viverblue"
              onClick={() => navigate("/implementation-trail")}
              variant="outline"
            >
              Ver minha trilha personalizada
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
