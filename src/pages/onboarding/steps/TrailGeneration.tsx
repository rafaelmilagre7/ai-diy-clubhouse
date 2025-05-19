
import React, { useState, useEffect, useCallback } from 'react';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { useProgress } from '@/hooks/onboarding/useProgress';
import { useLogging } from '@/hooks/useLogging';
import { useImplementationTrail } from '@/hooks/implementation/useImplementationTrail';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, RefreshCw, ThumbsUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';

const TrailGeneration = () => {
  const { progress, refreshProgress, updateProgress } = useProgress();
  const { user } = useAuth();
  const { generateImplementationTrail, regenerating } = useImplementationTrail();
  const { log, logError } = useLogging();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Estados para gerenciar o fluxo de geração da trilha
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoGenerateTriggered, setAutoGenerateTriggered] = useState(false);
  const autoGenerate = searchParams.get('autoGenerate') === 'true';

  // Verificar se a trilha já existe
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        // Forçar refresh dos dados para garantir informações atualizadas
        await refreshProgress();
        
        // Se não tiver progresso ou autoGenerate não estiver habilitado, redirecionar
        if (!progress && !autoGenerate) {
          console.log("Dados de onboarding não encontrados, redirecionando para onboarding...");
          navigate('/onboarding');
          return;
        }
        
        // Iniciar geração automática se solicitado
        if (autoGenerate && !autoGenerateTriggered) {
          await startTrailGeneration();
        }
      } catch (error) {
        console.error("Erro ao verificar status do onboarding:", error);
        setError("Ocorreu um erro ao verificar seu progresso de onboarding.");
      }
    };

    checkOnboardingStatus();
  }, [navigate, progress, autoGenerate, autoGenerateTriggered, refreshProgress]);

  // Garantir que o progresso de onboarding esteja marcado como completo
  const ensureOnboardingComplete = useCallback(async () => {
    if (progress && !progress.is_completed) {
      try {
        console.log("Atualizando status do onboarding para completo...");
        await updateProgress({
          is_completed: true,
          updated_at: new Date().toISOString()
        });
        await refreshProgress();
      } catch (error) {
        console.error("Erro ao atualizar status do onboarding:", error);
      }
    }
  }, [progress, updateProgress, refreshProgress]);

  // Função para iniciar a geração da trilha
  const startTrailGeneration = async () => {
    if (!progress || !user) {
      toast.error("Dados de usuário ou onboarding não disponíveis");
      return;
    }
    
    try {
      setGenerating(true);
      setGenerated(false);
      setError(null);
      setAutoGenerateTriggered(true);
      
      log('trail_generation_started', {});
      
      // Primeiro garante que o onboarding está marcado como completo
      await ensureOnboardingComplete();
      
      // Gerar a trilha de implementação
      const generatedTrail = await generateImplementationTrail(progress);
      
      if (generatedTrail) {
        log('trail_generation_success', {});
        toast.success("Trilha personalizada gerada com sucesso!");
        
        // Marcar como gerado
        setGenerating(false);
        setGenerated(true);
        
        // Redirecionar após um pequeno delay
        setTimeout(() => {
          navigate('/implementation-trail');
        }, 1500);
      } else {
        throw new Error("Não foi possível gerar a trilha");
      }
    } catch (error: any) {
      console.error("Erro ao gerar trilha de implementação:", error);
      
      logError("trail_generation_error", {
        message: error instanceof Error ? error.message : "Erro desconhecido",
      });
      
      setGenerating(false);
      setError(error instanceof Error ? error.message : "Erro desconhecido ao gerar a trilha");
      toast.error("Não foi possível gerar sua trilha personalizada. Tente novamente.");
    }
  };

  // Função para voltar à revisão do onboarding
  const handleGoBack = () => {
    navigate('/onboarding/review');
  };

  // Função para tentar novamente
  const handleRetry = () => {
    startTrailGeneration();
  };

  return (
    <OnboardingLayout
      currentStep={9} 
      title="Gerando Sua Trilha Personalizada"
      backUrl="/onboarding/review"
      hideProgress
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">
            {generating ? "Gerando Sua Trilha..." : 
             generated ? "Trilha Gerada com Sucesso!" : 
             error ? "Erro ao Gerar Trilha" : 
             "Vamos Criar Sua Trilha Personalizada"}
          </h2>
          
          <p className="text-viverblue-light mt-2 max-w-md mx-auto">
            {generating ? 
              "Estamos analisando seus dados e identificando as melhores soluções e aulas para você." : 
             generated ? 
              "Sua trilha foi criada com sucesso e está pronta para você começar sua jornada!" : 
             error ? 
              "Ocorreu um problema ao tentar gerar sua trilha personalizada." : 
              "Vamos usar seus dados de onboarding para criar uma trilha personalizada."}
          </p>
        </div>
        
        {/* Estado de carregamento */}
        {generating && (
          <div className="bg-[#151823] p-8 rounded-xl border border-neutral-700/50 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-viverblue/20 absolute animate-ping opacity-75"></div>
                <div className="w-20 h-20 rounded-full bg-[#151823] border-2 border-dashed border-viverblue flex items-center justify-center relative animate-spin-slow">
                  <Loader2 className="h-10 w-10 text-viverblue animate-spin" />
                </div>
              </div>
              
              <div className="mt-8 space-y-2">
                <h3 className="text-lg font-medium text-white">Gerando sua trilha personalizada</h3>
                <p className="text-sm text-neutral-400">
                  Isso pode levar alguns instantes. Estamos personalizando sua trilha de implementação
                  com base em suas respostas.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Estado de sucesso */}
        {generated && (
          <div className="bg-[#151823] p-8 rounded-xl border border-green-500/20 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                <ThumbsUp className="h-10 w-10 text-green-500" />
              </div>
              
              <div className="mt-4 space-y-2">
                <h3 className="text-lg font-medium text-white">Trilha gerada com sucesso!</h3>
                <p className="text-sm text-neutral-400">
                  Estamos te redirecionando para sua trilha personalizada...
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Estado de erro */}
        {error && !generating && !generated && (
          <div className="bg-[#151823] p-8 rounded-xl border border-red-500/20 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="h-10 w-10 text-red-500" />
              </div>
              
              <div className="mt-4 space-y-2">
                <h3 className="text-lg font-medium text-white">Erro ao gerar trilha</h3>
                <p className="text-sm text-neutral-400">
                  {error}
                </p>
                
                <div className="pt-4 flex justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={handleGoBack}
                  >
                    Voltar para Revisão
                  </Button>
                  
                  <Button
                    onClick={handleRetry}
                    className="bg-viverblue hover:bg-viverblue-dark text-black"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Tentar Novamente
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Estado inicial */}
        {!generating && !generated && !error && (
          <div className="flex justify-center">
            <Button
              onClick={startTrailGeneration}
              disabled={generating || !progress}
              className="bg-viverblue hover:bg-viverblue-dark text-black py-6 px-8 text-lg"
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Gerando...
                </>
              ) : (
                "Gerar Minha Trilha Personalizada"
              )}
            </Button>
          </div>
        )}
      </div>
    </OnboardingLayout>
  );
};

export default TrailGeneration;
