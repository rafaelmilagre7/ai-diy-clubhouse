
import React, { useState, useEffect, useCallback } from 'react';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { useProgress } from '@/hooks/onboarding/useProgress';
import { useLogging } from '@/hooks/useLogging';
import { useImplementationTrail } from '@/hooks/implementation/useImplementationTrail';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { TrailGenerationHeader } from '@/components/onboarding/TrailGeneration/TrailGenerationHeader';
import { TrailLoadingState } from '@/components/onboarding/TrailGeneration/TrailLoadingState';
import { TrailErrorState } from '@/components/onboarding/TrailGeneration/TrailErrorState';
import { TrailGenerationPanel } from '@/components/onboarding/TrailGenerationPanel';
import { MilagrinhoMessage } from '@/components/onboarding/MilagrinhoMessage';
import { toast } from 'sonner';

// Componente principal para geração de trilha
const TrailGeneration = () => {
  const { progress, refreshProgress, updateProgress } = useProgress();
  const { trail, isLoading: trailLoading, error: trailError, generateImplementationTrail } = useImplementationTrail();
  const { log, logError } = useLogging();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Estados para gerenciar o fluxo de geração da trilha
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoGenerateTriggered, setAutoGenerateTriggered] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const autoGenerate = searchParams.get('autoGenerate') === 'true';

  // Número máximo de tentativas automáticas
  const MAX_RETRY_ATTEMPTS = 3;
  // Tempo limite de carregamento em milissegundos (20 segundos)
  const LOADING_TIMEOUT = 20000;

  // Verificar se a trilha já existe
  useEffect(() => {
    if (trail && !generating) {
      setGenerated(true);
    }
  }, [trail, generating]);

  // Função para carregar a trilha inicial
  const loadInitialTrail = useCallback(async () => {
    if (!progress) return;
    
    // Se já temos uma trilha, marcar como gerada
    if (trail) {
      setGenerated(true);
      log('trail_loaded_from_storage', { success: true });
      return;
    }
    
    // Iniciar geração automática se solicitado
    if (autoGenerate && !autoGenerateTriggered && !generated) {
      await startTrailGeneration();
    }
  }, [progress, trail, autoGenerate, autoGenerateTriggered, generated]);

  // Efeito para inicializar a trilha quando os dados estiverem disponíveis
  useEffect(() => {
    loadInitialTrail();
  }, [loadInitialTrail]);

  // Configurar temporizador para timeout
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;
    
    if (generating && !generated) {
      timeoutId = setTimeout(() => {
        if (generating && !generated) {
          setLoadingTimeout(true);
          setGenerating(false);
          setError("Tempo limite excedido ao gerar a trilha. O servidor pode estar sobrecarregado.");
          logError("trail_generation_timeout", {
            attempt: attemptCount,
            duration: LOADING_TIMEOUT
          });
        }
      }, LOADING_TIMEOUT);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [generating, generated, attemptCount, logError]);

  // Função para iniciar a geração da trilha
  const startTrailGeneration = async () => {
    if (!progress) return;
    
    try {
      setGenerating(true);
      setGenerated(false);
      setError(null);
      setAutoGenerateTriggered(true);
      setAttemptCount(prev => prev + 1);
      
      log('trail_generation_started', { attempt: attemptCount + 1 });
      
      // Gerar a trilha de implementação
      await generateImplementationTrail(progress);
      
      log('trail_generation_success', {});
      toast.success("Trilha personalizada gerada com sucesso!");
      
      // Marcar como gerado
      setGenerating(false);
      setGenerated(true);
    } catch (error: any) {
      console.error("Erro ao gerar trilha de implementação:", error);
      
      logError("trail_generation_error", {
        message: error instanceof Error ? error.message : "Erro desconhecido",
        details: error instanceof Error ? error.stack : String(error),
        hint: error instanceof Error && 'hint' in error ? (error as any).hint : "",
        code: error instanceof Error && 'code' in error ? (error as any).code : "",
      });
      
      setGenerating(false);
      setError(error instanceof Error ? error.message : "Erro desconhecido ao gerar a trilha");
      
      // Tentar novamente automaticamente se estiver dentro do limite de tentativas
      if (attemptCount < MAX_RETRY_ATTEMPTS) {
        console.log(`Tentativa ${attemptCount + 1} falhou. Tentando novamente...`);
        setTimeout(() => {
          startTrailGeneration();
        }, 2000); // Esperar 2 segundos antes de tentar novamente
      } else {
        toast.error("Não foi possível gerar sua trilha personalizada. Tente novamente mais tarde.");
      }
    }
  };

  // Função para voltar à revisão do onboarding
  const handleGoBack = () => {
    navigate('/onboarding/review');
  };

  // Função para forçar uma atualização/tentativa
  const handleForceRefresh = useCallback(() => {
    setAttemptCount(0); // Reiniciar contador de tentativas
    setLoadingTimeout(false);
    startTrailGeneration();
  }, []);

  // Função para limpar dados e reiniciar
  const handleResetData = async () => {
    try {
      if (!progress?.id) return;
      
      // Recarregar dados
      await refreshProgress();
      
      setAttemptCount(0);
      setLoadingTimeout(false);
      setError(null);
      setGenerated(false);
      
      toast.success("Dados limpos com sucesso. Iniciando geração...");
      setTimeout(() => {
        startTrailGeneration();
      }, 1000);
    } catch (e) {
      console.error("Erro ao limpar dados:", e);
      toast.error("Erro ao limpar dados. Tente novamente.");
    }
  };

  // Renderização do componente com base no estado
  return (
    <OnboardingLayout
      currentStep={9} // Etapa após a revisão
      title="Trilha Personalizada VIVER DE IA"
      backUrl="/onboarding/review"
      hideProgress
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <TrailGenerationHeader 
          isGenerating={generating} 
          isGenerated={generated} 
          hasError={!!error || !!trailError}
        />
        
        {!error && !generated && !generating && !trailLoading && (
          <MilagrinhoMessage
            message="Vamos gerar uma trilha personalizada de implementação baseada nas suas respostas. Esta trilha vai guiar você pelos primeiros passos no VIVER DE IA Club."
          />
        )}
        
        {(generating || trailLoading) && !error && !trailError && (
          <TrailLoadingState 
            attemptCount={attemptCount}
            onForceRefresh={handleForceRefresh}
          />
        )}
        
        {(error || trailError) && (
          <TrailErrorState
            onRegenerate={startTrailGeneration}
            onForceRefresh={handleForceRefresh}
            onGoBack={handleGoBack}
            onResetData={handleResetData}
            errorDetails={error || trailError || "Erro desconhecido ao gerar trilha"}
            loadingTimeout={loadingTimeout}
            attemptCount={attemptCount}
          />
        )}
        
        {generated && !generating && !error && !trailError && (
          <TrailGenerationPanel 
            onboardingData={progress}
            onClose={() => navigate('/dashboard')}
          />
        )}
      </div>
    </OnboardingLayout>
  );
};

export default TrailGeneration;
