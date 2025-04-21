
import React, { useState, useEffect, useCallback } from 'react';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { useProgress } from '@/hooks/onboarding/useProgress';
import { useLogging } from '@/hooks/useLogging';
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
  const { log, logError } = useLogging();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Estados para gerenciar o fluxo de geração da trilha
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [trailSolutions, setTrailSolutions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [autoGenerateTriggered, setAutoGenerateTriggered] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const autoGenerate = searchParams.get('autoGenerate') === 'true';

  // Número máximo de tentativas automáticas
  const MAX_RETRY_ATTEMPTS = 3;
  // Tempo limite de carregamento em milissegundos (20 segundos)
  const LOADING_TIMEOUT = 20000;

  // Função para carregar a trilha inicial
  const loadInitialTrail = useCallback(async () => {
    if (!progress) return;
    
    // Verificar se já temos soluções na trilha salvas
    if (progress.trail_solutions && progress.trail_solutions.length > 0) {
      try {
        setTrailSolutions(progress.trail_solutions);
        setGenerated(true);
        log('trail_loaded_from_storage', { count: progress.trail_solutions.length });
      } catch (e) {
        console.error("Erro ao carregar trilha do armazenamento:", e);
        // Se houver erro ao processar as soluções armazenadas, continuar com geração automática
        if (autoGenerate && !autoGenerateTriggered) {
          await startTrailGeneration();
        }
      }
    } else if (autoGenerate && !autoGenerateTriggered) {
      // Iniciar geração automática se solicitado
      await startTrailGeneration();
    }
  }, [progress, autoGenerate, autoGenerateTriggered]);

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
  }, [generating, generated, attemptCount]);

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
      
      // Simular a geração da trilha (isso deve ser substituído pela chamada real)
      // Aqui normalmente chamaríamos uma função externa como:
      // const result = await generateImplementationTrail(progress);
      
      // Para fins de demonstração, estamos criando uma trilha simulada
      // Em produção, esta seção seria substituída por sua implementação real
      const mockSolutions = [
        {
          id: 'mock-solution-1',
          title: 'Assistente Virtual para Atendimento',
          description: 'Implemente um assistente virtual baseado em IA para automatizar o atendimento ao cliente.',
          category: 'Aumento de Receita',
          difficulty: 'média',
          estimated_time: 2,
          thumbnail_url: 'https://via.placeholder.com/300x200/0ABAB5/FFFFFF?text=Assistente+Virtual'
        },
        {
          id: 'mock-solution-2',
          title: 'Automação de Emails Marketing',
          description: 'Configure um sistema de automação de emails para aumentar engajamento e conversões.',
          category: 'Otimização Operacional',
          difficulty: 'fácil',
          estimated_time: 1,
          thumbnail_url: 'https://via.placeholder.com/300x200/0ABAB5/FFFFFF?text=Email+Marketing'
        },
        {
          id: 'mock-solution-3',
          title: 'Dashboard de Métricas de Negócio',
          description: 'Crie um dashboard com as principais métricas do seu negócio para decisões estratégicas.',
          category: 'Gestão Estratégica',
          difficulty: 'avançada',
          estimated_time: 3,
          thumbnail_url: 'https://via.placeholder.com/300x200/0ABAB5/FFFFFF?text=Dashboard'
        }
      ];
      
      // Definir as soluções da trilha
      setTrailSolutions(mockSolutions);
      
      // Salvar as soluções no progresso do usuário
      await updateProgress({
        trail_solutions: mockSolutions,
        trail_generated_at: new Date().toISOString()
      });
      
      log('trail_generation_success', {});
      toast.success("Trilha personalizada gerada com sucesso!");
      
      // Marcar como gerado
      setGenerating(false);
      setGenerated(true);
    } catch (error) {
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
      
      // Limpar dados da trilha
      await updateProgress({
        trail_solutions: null,
        trail_generated_at: null
      });
      
      // Recarregar dados
      await refreshProgress();
      
      setAttemptCount(0);
      setLoadingTimeout(false);
      setError(null);
      setTrailSolutions([]);
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
          hasError={!!error}
        />
        
        {!error && !generated && !generating && (
          <MilagrinhoMessage
            message="Vamos gerar uma trilha personalizada de implementação baseada nas suas respostas. Esta trilha vai guiar você pelos primeiros passos no VIVER DE IA Club."
          />
        )}
        
        {generating && !error && (
          <TrailLoadingState attemptCount={attemptCount} />
        )}
        
        {error && (
          <TrailErrorState
            onRegenerate={startTrailGeneration}
            onForceRefresh={handleForceRefresh}
            onGoBack={handleGoBack}
            onResetData={handleResetData}
            errorDetails={error}
            loadingTimeout={loadingTimeout}
            attemptCount={attemptCount}
          />
        )}
        
        {generated && !generating && !error && (
          <TrailGenerationPanel 
            solutions={trailSolutions}
            loading={false}
            onLoadMore={() => console.log("Carregar mais soluções")}
            progress={progress}
          />
        )}
      </div>
    </OnboardingLayout>
  );
};

export default TrailGeneration;
