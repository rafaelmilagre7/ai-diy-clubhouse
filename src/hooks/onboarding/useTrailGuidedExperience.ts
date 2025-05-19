
import { useState, useEffect, useCallback } from "react";
import { useProgress } from "./useProgress";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { showOnboardingSuccessToast } from "@/components/onboarding/OnboardingSuccessToast";

export const useTrailGuidedExperience = () => {
  const navigate = useNavigate();
  const { progress, isLoading } = useProgress();
  
  // Estados para controle da experiência
  const [started, setStarted] = useState(false);
  const [showMagicExperience, setShowMagicExperience] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [typingFinished, setTypingFinished] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [solutionsLoading, setSolutionsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<Error | null>(null);
  const [solutionsList, setSolutionsList] = useState<any[]>([]);
  
  // Simular carregamento das soluções
  useEffect(() => {
    if (!isLoading && progress) {
      // Simulação de obtenção de dados
      const loadSolutions = async () => {
        setSolutionsLoading(true);
        try {
          // Aqui você teria a lógica real de busca
          // Estamos apenas simulando para a demonstração
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Dados simulados
          const mockSolutions = [
            {
              id: 1,
              title: "Automação de Atendimento com IA",
              description: "Implemente um sistema de chatbot avançado para atendimento ao cliente",
              justification: "Com base no seu interesse em melhorar o atendimento ao cliente e reduzir custos operacionais, esta solução permitirá automatizar até 70% dos atendimentos com um assistente virtual inteligente.",
              difficulty: "medium",
              estimatedTime: "2-4 semanas",
              implementationSteps: ["Análise de requisitos", "Configuração da plataforma", "Treinamento do modelo", "Testes e ajustes"],
            },
            {
              id: 2,
              title: "Análise de Dados com Processamento de Linguagem Natural",
              description: "Utilize NLP para extrair insights de feedbacks de clientes",
              justification: "Analisando seu objetivo de melhorar a experiência do cliente, esta solução ajudará a identificar tendências, sentimentos e oportunidades de melhoria a partir dos comentários e feedbacks dos clientes.",
              difficulty: "medium",
              estimatedTime: "3-5 semanas",
              implementationSteps: ["Coleta de dados", "Pré-processamento", "Configuração do modelo", "Visualização de resultados"],
            },
            {
              id: 3,
              title: "Automação de Marketing com IA",
              description: "Personalize campanhas de marketing com base em comportamentos",
              justification: "Considerando seu objetivo de aumentar conversões, esta solução permitirá segmentar audiências e personalizar conteúdo automaticamente, aumentando a relevância das suas mensagens de marketing.",
              difficulty: "medium",
              estimatedTime: "4-6 semanas",
              implementationSteps: ["Configuração da plataforma", "Integração de dados", "Criação de segmentos", "Automação de campanhas"],
            }
          ];
          
          setSolutionsList(mockSolutions);
        } catch (error) {
          console.error("Erro ao carregar soluções:", error);
          setLoadingError(error instanceof Error ? error : new Error("Erro desconhecido"));
          toast.error("Falha ao carregar soluções recomendadas");
        } finally {
          setSolutionsLoading(false);
        }
      };
      
      loadSolutions();
    }
  }, [isLoading, progress]);
  
  // Obter solução atual baseada no índice
  const currentSolution = solutionsList[currentStepIdx];
  
  // Verificar se há conteúdo para mostrar
  const hasContent = !isLoading && progress?.is_completed && solutionsList.length > 0;
  
  // Iniciar geração da trilha
  const handleStartGeneration = useCallback((withMagic = true) => {
    if (withMagic) {
      setShowMagicExperience(true);
    } else {
      setStarted(true);
      
      // Mostrar toast de boas-vindas
      setTimeout(() => {
        showOnboardingSuccessToast({
          title: "Trilha de Implementação",
          message: "Bem-vindo à sua trilha personalizada VIVER DE IA!"
        });
      }, 1000);
    }
  }, []);
  
  // Finalizar experiência mágica
  const handleMagicFinish = useCallback(() => {
    setShowMagicExperience(false);
    setStarted(true);
    
    // Mostrar toast de boas-vindas após a experiência
    showOnboardingSuccessToast({
      title: "Trilha de Implementação",
      message: "Bem-vindo à sua trilha personalizada VIVER DE IA!"
    });
  }, []);
  
  // Navegar entre soluções
  const handleNext = useCallback(() => {
    if (currentStepIdx < solutionsList.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
      setTypingFinished(false);
    }
  }, [currentStepIdx, solutionsList.length]);
  
  const handlePrevious = useCallback(() => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
      setTypingFinished(false);
    }
  }, [currentStepIdx]);
  
  // Selecionar uma solução
  const handleSelectSolution = useCallback((solutionId: number) => {
    // Aqui você redirecionaria para uma página de detalhes da solução
    // Agora apenas exibimos um toast como demonstração
    toast.success("Solução selecionada", {
      description: "Em breve você será redirecionado para os detalhes da implementação."
    });
    
    // Exemplo de redirecionamento
    // navigate(`/solutions/${solutionId}`);
  }, []);
  
  // Atualização dos dados da trilha
  const refreshTrailData = useCallback(async () => {
    setRefreshing(true);
    try {
      // Aqui iria a lógica de atualização real
      await new Promise(resolve => setTimeout(resolve, 1500));
      setLoadingError(null);
    } catch (error) {
      setLoadingError(error instanceof Error ? error : new Error("Erro ao atualizar dados"));
      toast.error("Falha ao atualizar dados da trilha");
    } finally {
      setRefreshing(false);
    }
  }, []);
  
  // Completar animação de digitação
  const handleTypingComplete = useCallback(() => {
    setTypingFinished(true);
  }, []);

  return {
    isLoading,
    regenerating,
    solutionsLoading,
    refreshing,
    started,
    showMagicExperience,
    currentStepIdx,
    typingFinished,
    solutionsList,
    currentSolution,
    loadingError,
    hasContent,
    handleStartGeneration,
    handleMagicFinish,
    handleNext,
    handlePrevious,
    handleSelectSolution,
    handleTypingComplete,
    refreshTrailData,
  };
};
