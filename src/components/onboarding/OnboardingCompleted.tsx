import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Edit, Map, Loader2, Home, Award, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useImplementationTrail } from "@/hooks/implementation/useImplementationTrail";
import { toast } from "sonner";
import { ReviewStep } from "@/components/onboarding/steps/ReviewStep";
import { motion } from "framer-motion";

const LOADING_TIMEOUT_MS = 8000; // 8 segundos para evitar tela de loading infinita

export const OnboardingCompleted = () => {
  const navigate = useNavigate();
  const { progress, isLoading: progressLoading, refreshProgress } = useProgress();
  const { generateImplementationTrail, regenerating, hasContent: trailExists } = useImplementationTrail();
  
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasShownConfetti, setHasShownConfetti] = useState(false);
  const [isGeneratingTrail, setIsGeneratingTrail] = useState(false);
  const [trailGenerated, setTrailGenerated] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [loadingRetries, setLoadingRetries] = useState(0);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingHandledRef = useRef(false);
  
  // Efeito para controlar timeout de carregamento
  useEffect(() => {
    // Definir timeout para evitar tela de loading infinita
    loadingTimeoutRef.current = setTimeout(() => {
      if (isInitialLoad && !isLoadingHandledRef.current) {
        console.log("[OnboardingCompleted] Timeout de carregamento atingido, forçando transição de estado");
        setIsInitialLoad(false);
        isLoadingHandledRef.current = true;
        
        // Tentar carregar dados novamente se ainda não temos progresso
        if (!progress) {
          console.log("[OnboardingCompleted] Dados de progresso não encontrados após timeout, tentando novamente");
          refreshProgress().catch(err => 
            console.error("[OnboardingCompleted] Erro ao recarregar após timeout:", err)
          );
        }
      }
    }, LOADING_TIMEOUT_MS);
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);
  
  // Efeito para carregar dados atualizados
  useEffect(() => {
    // Função para carregar dados com sistema de retry
    const loadProgressData = async () => {
      try {
        console.log("[OnboardingCompleted] Iniciando carregamento de dados, tentativa:", loadingRetries + 1);
        const refreshedProgress = await refreshProgress();
        
        // Se chegamos aqui, o carregamento foi bem-sucedido
        isLoadingHandledRef.current = true;
        
        if (refreshedProgress) {
          console.log("[OnboardingCompleted] Dados carregados com sucesso:", refreshedProgress.id);
          setIsInitialLoad(false);
        } else if (loadingRetries < 2) {
          // Tentar novamente em caso de falha (max 3 tentativas)
          console.log("[OnboardingCompleted] Dados não encontrados, planejando nova tentativa");
          setTimeout(() => {
            setLoadingRetries(prev => prev + 1);
          }, 2000); // Esperar 2 segundos antes de tentar novamente
        } else {
          // Desistir após 3 tentativas
          console.log("[OnboardingCompleted] Máximo de tentativas atingido, desistindo");
          setIsInitialLoad(false);
        }
      } catch (error) {
        console.error("[OnboardingCompleted] Erro ao carregar progresso:", error);
        
        // Tentar novamente em caso de erro (max 3 tentativas)
        if (loadingRetries < 2) {
          setTimeout(() => {
            setLoadingRetries(prev => prev + 1);
          }, 2000); // Esperar 2 segundos antes de tentar novamente
        } else {
          // Desistir após 3 tentativas
          setIsInitialLoad(false);
        }
      }
    };
    
    // Só carregar se ainda estamos no estado inicial e não ultrapassamos tentativas
    if (isInitialLoad && loadingRetries <= 2 && !isLoadingHandledRef.current) {
      loadProgressData();
    }
  }, [loadingRetries, refreshProgress]);
  
  // Efeito para disparar confetti quando completado com sucesso
  useEffect(() => {
    if (!isInitialLoad && progress?.is_completed && !hasShownConfetti) {
      // Disparar efeito de confete quando os dados estiverem carregados
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0ABAB5', '#6de2de', '#9EECEA']
        });
        
        setHasShownConfetti(true);
      } catch (error) {
        console.error("[OnboardingCompleted] Erro ao disparar confetti:", error);
      }
    }
  }, [isInitialLoad, progress, hasShownConfetti]);

  // Efeito para verificar se a trilha já existe e definir estado
  useEffect(() => {
    if (trailExists) {
      setTrailGenerated(true);
    }
  }, [trailExists]);

  // Função para navegar para uma etapa específica para edição
  const handleNavigateToStep = useCallback((stepId: string) => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    console.log("[OnboardingCompleted] Navegando para editar etapa:", stepId);
    navigate(`/onboarding/${stepId}`);
  }, [navigate, isNavigating]);

  // Função para gerar a trilha de implementação
  const handleGenerateTrail = useCallback(async () => {
    if (!progress || isGeneratingTrail || isNavigating || regenerating) {
      return;
    }

    try {
      setIsGeneratingTrail(true);
      
      if (trailGenerated) {
        toast.info("Atualizando sua trilha personalizada...");
      } else {
        toast.info("Iniciando geração da sua trilha personalizada...");
      }
      
      const generatedTrail = await generateImplementationTrail(progress, true);
      
      if (generatedTrail) {
        if (trailGenerated) {
          toast.success("Trilha de implementação atualizada com sucesso!");
        } else {
          toast.success("Trilha de implementação gerada com sucesso!");
          setTrailGenerated(true);
        }
        
        setTimeout(() => {
          if (!isNavigating) {
            setIsNavigating(true);
            navigate("/implementation-trail");
          }
        }, 800);
      } else {
        toast.error("Não foi possível gerar sua trilha. Tentando novamente em 3 segundos...");
        
        setTimeout(async () => {
          toast.info("Tentando gerar trilha novamente...");
          const retryTrail = await generateImplementationTrail(progress, true);
          
          if (retryTrail) {
            toast.success("Trilha de implementação gerada com sucesso na segunda tentativa!");
            setTrailGenerated(true);
            
            setTimeout(() => {
              if (!isNavigating) {
                setIsNavigating(true);
                navigate("/implementation-trail");
              }
            }, 800);
          } else {
            toast.error("Não foi possível gerar sua trilha. Por favor, tente novamente mais tarde.");
          }
          
          setIsGeneratingTrail(false);
        }, 3000);
        return;
      }
    } catch (error) {
      console.error("[OnboardingCompleted] Erro ao gerar trilha:", error);
      toast.error("Ocorreu um erro ao gerar sua trilha personalizada. Por favor, tente novamente mais tarde.");
    } finally {
      setIsGeneratingTrail(false);
    }
  }, [progress, isGeneratingTrail, trailGenerated, isNavigating, regenerating, generateImplementationTrail, navigate]);

  // Navegar para a trilha se já foi gerada
  const handleViewTrail = useCallback(() => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    navigate("/implementation-trail");
  }, [navigate, isNavigating]);

  // Navegar para o dashboard
  const handleGoToDashboard = useCallback(() => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    navigate("/dashboard");
  }, [navigate, isNavigating]);

  // Função para forçar recarregamento de dados
  const handleForceRefresh = useCallback(async () => {
    try {
      toast.info("Tentando recarregar seus dados...");
      isLoadingHandledRef.current = false;
      setIsInitialLoad(true);
      const refreshedProgress = await refreshProgress();
      
      if (refreshedProgress) {
        toast.success("Dados recarregados com sucesso!");
        setIsInitialLoad(false);
      } else {
        toast.error("Ainda não conseguimos carregar seus dados. Tente novamente.");
        setIsInitialLoad(false);
      }
    } catch (error) {
      console.error("[OnboardingCompleted] Erro ao forçar recarregamento:", error);
      toast.error("Erro ao recarregar dados. Tente novamente.");
      setIsInitialLoad(false);
    }
  }, [refreshProgress]);

  if (isInitialLoad || progressLoading) {
    return (
      <div className="max-w-4xl mx-auto bg-[#151823] border border-neutral-700/50 rounded-lg shadow-lg p-8 text-center">
        <Loader2 className="animate-spin h-10 w-10 text-[#0ABAB5] mx-auto" />
        <p className="mt-4 text-neutral-300">Carregando seus dados...</p>
        
        {loadingRetries >= 2 && (
          <Button 
            onClick={handleForceRefresh} 
            variant="outline" 
            size="sm"
            className="mt-4 text-[#0ABAB5] border-[#0ABAB5]/30"
          >
            Tentar novamente
          </Button>
        )}
      </div>
    );
  }

  if (!progress?.is_completed) {
    return (
      <div className="max-w-4xl mx-auto bg-[#151823] border border-neutral-700/50 rounded-lg shadow-lg p-8 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-amber-600/20 flex items-center justify-center mx-auto">
          <Edit className="h-10 w-10 text-amber-500" />
        </div>
        
        <h3 className="text-2xl font-bold text-white">Onboarding Incompleto</h3>
        
        <p className="text-neutral-200 max-w-md mx-auto">
          Parece que você ainda não completou todas as etapas do onboarding. Complete todas as etapas para personalizar sua experiência.
        </p>
        
        <div className="pt-4">
          <Button
            onClick={() => {
              if (!isNavigating) {
                setIsNavigating(true);
                navigate("/onboarding");
              }
            }}
            className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90 text-black font-medium"
          >
            Continuar Onboarding
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Cabeçalho de Sucesso */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 400, damping: 15 }}
          className="w-24 h-24 rounded-full bg-[#0ABAB5]/20 flex items-center justify-center mx-auto mb-6 relative"
        >
          <div className="absolute inset-0 bg-[#0ABAB5]/30 rounded-full animate-ping opacity-30"></div>
          <CheckCircle2 className="h-12 w-12 text-[#0ABAB5] relative z-10" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-4xl font-bold text-white mb-4"
        >
          Parabéns! 🎉
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-xl text-neutral-200 max-w-2xl mx-auto"
        >
          Seu onboarding foi concluído com sucesso! Agora você pode começar sua jornada de transformação com IA.
        </motion.p>
      </motion.div>

      {/* Cards de Conquistas */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          { icon: CheckCircle2, title: "Perfil Completo", description: "Todas as informações foram coletadas", color: "text-green-400" },
          { icon: Award, title: "Pronto para IA", description: "Seu perfil está configurado para IA", color: "text-[#0ABAB5]" },
          { icon: Map, title: "Trilha Personalizada", description: "Trilha customizada para seus objetivos", color: "text-purple-400" }
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + index * 0.1 }}
            className="bg-[#151823] border border-neutral-700/50 rounded-xl p-6 text-center hover:border-[#0ABAB5]/30 transition-colors"
          >
            <item.icon className={`h-8 w-8 mx-auto mb-3 ${item.color}`} />
            <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
            <p className="text-sm text-neutral-400">{item.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Resumo dos Dados */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="bg-[#151823] border border-neutral-700/50 rounded-xl p-8"
      >
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Resumo do Seu Perfil</h2>
        {progress && (
          <ReviewStep 
            progress={progress}
            onComplete={handleGenerateTrail}
            isSubmitting={isGeneratingTrail || regenerating}
            navigateToStep={handleNavigateToStep}
          />
        )}
      </motion.div>

      {/* Botões de Ação */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="flex flex-col md:flex-row justify-center gap-4 pt-8"
      >
        <Button
          onClick={handleViewTrail}
          disabled={isNavigating || isGeneratingTrail}
          size="lg"
          className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90 text-black font-medium flex items-center gap-3 px-8 py-4 text-lg"
        >
          {isGeneratingTrail ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Gerando trilha...
            </>
          ) : (
            <>
              <Map className="h-5 w-5" />
              Ir para Trilha de Implementação
            </>
          )}
        </Button>
        
        <Button
          onClick={handleGoToDashboard}
          disabled={isNavigating}
          variant="outline"
          size="lg"
          className="border-[#0ABAB5]/30 text-[#0ABAB5] hover:bg-[#0ABAB5]/10 flex items-center gap-3 px-8 py-4 text-lg"
        >
          <Home className="h-5 w-5" />
          Voltar ao Dashboard
        </Button>
      </motion.div>

      {/* Próximos Passos */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="bg-gradient-to-r from-[#0ABAB5]/10 to-purple-500/10 border border-[#0ABAB5]/20 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <ArrowRight className="h-5 w-5 text-[#0ABAB5]" />
          Próximos Passos
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-[#0ABAB5]/20 p-2 rounded-lg">
              <Map className="h-4 w-4 text-[#0ABAB5]" />
            </div>
            <div>
              <h4 className="font-medium text-white">Explore sua trilha personalizada</h4>
              <p className="text-sm text-neutral-400">Siga os passos customizados para implementar IA no seu negócio</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-purple-500/20 p-2 rounded-lg">
              <Award className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <h4 className="font-medium text-white">Ganhe conquistas</h4>
              <p className="text-sm text-neutral-400">Complete implementações e desbloqueie novos benefícios</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
