
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, Trophy, ArrowRight, BarChart3, Users, Sparkles, Star, Target, Zap } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { usePostOnboarding } from "@/hooks/onboarding/usePostOnboarding";

const OnboardingCompletedNew: React.FC = () => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const {
    isFirstAccess,
    hasCompletedTrail,
    goToImplementationTrail,
    goToDashboard,
    startWelcomeTour,
    checkTrailStatus
  } = usePostOnboarding();

  useEffect(() => {
    setShowCelebration(true);
    checkTrailStatus();
    
    // Dispara confetes em sequência
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 500);

    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7, x: 0.3 }
      });
    }, 1000);

    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7, x: 0.7 }
      });
    }, 1500);
  }, [checkTrailStatus]);

  const achievements = [
    { 
      icon: <Trophy className="h-6 w-6 text-yellow-500" />, 
      title: "Perfil Completo", 
      description: "Informações registradas",
      delay: 0.4 
    },
    { 
      icon: <Target className="h-6 w-6 text-green-500" />, 
      title: "Objetivos Definidos", 
      description: "Metas estabelecidas",
      delay: 0.5 
    },
    { 
      icon: <Sparkles className="h-6 w-6 text-purple-500" />, 
      title: "Trilha Personalizada", 
      description: "Pronto para começar",
      delay: 0.6 
    },
    { 
      icon: <Star className="h-6 w-6 text-blue-500" />, 
      title: "Membro Oficial", 
      description: "Bem-vindo à comunidade",
      delay: 0.7 
    }
  ];

  const nextSteps = [
    {
      icon: <Zap className="h-5 w-5 text-[#0ABAB5]" />,
      title: "Explore sua trilha personalizada",
      description: "Comece implementando soluções de IA específicas para seu negócio"
    },
    {
      icon: <BarChart3 className="h-5 w-5 text-[#0ABAB5]" />,
      title: "Monitore seu progresso",
      description: "Acompanhe suas conquistas no dashboard"
    },
    {
      icon: <Users className="h-5 w-5 text-[#0ABAB5]" />,
      title: "Conecte-se com a comunidade",
      description: "Compartilhe experiências e aprenda com outros membros"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1121] via-[#1A1E2E] to-[#0B1121] flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <Card className="bg-[#1A1E2E] border-white/10 shadow-2xl overflow-hidden">
          <CardHeader className="text-center pb-6 bg-gradient-to-r from-[#0ABAB5]/10 to-purple-500/10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="relative w-24 h-24 mx-auto mb-6"
            >
              <div className="absolute inset-0 bg-[#0ABAB5]/20 rounded-full animate-ping opacity-30"></div>
              <div className="relative flex items-center justify-center bg-gradient-to-r from-[#0ABAB5] to-green-500 w-24 h-24 rounded-full shadow-lg">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CardTitle className="text-4xl font-bold text-white mb-4">
                🎉 Parabéns!
              </CardTitle>
              <p className="text-xl text-neutral-200 mb-2">
                Seu onboarding foi concluído com sucesso
              </p>
              <p className="text-neutral-400">
                Agora você está pronto para transformar seu negócio com IA
              </p>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-8 p-8">
            {/* Cards de conquistas em grade 2x2 */}
            <div className="grid grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: achievement.delay }}
                  className="bg-[#151823] p-4 rounded-lg border border-white/5 text-center hover:border-[#0ABAB5]/20 transition-all group"
                >
                  <div className="flex justify-center mb-3 group-hover:scale-110 transition-transform">
                    {achievement.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">
                    {achievement.title}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {achievement.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Status da trilha */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-r from-[#0ABAB5]/10 to-purple-500/10 p-6 rounded-lg border border-[#0ABAB5]/20"
            >
              <div className="flex items-center gap-3 mb-3">
                {hasCompletedTrail ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <Loader2 className="h-6 w-6 text-[#0ABAB5] animate-spin" />
                )}
                <h3 className="text-lg font-semibold text-white">
                  {hasCompletedTrail ? "Trilha Pronta!" : "Preparando sua Trilha..."}
                </h3>
              </div>
              <p className="text-neutral-300 text-sm">
                {hasCompletedTrail 
                  ? "Sua trilha personalizada de implementação foi gerada com base no seu perfil."
                  : "Estamos finalizando os últimos detalhes da sua trilha personalizada."
                }
              </p>
            </motion.div>

            {/* Próximos passos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-[#151823] p-6 rounded-lg border border-white/5"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-[#0ABAB5]" />
                Próximos Passos
              </h3>
              <div className="space-y-4">
                {nextSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#0ABAB5]/20 rounded-full flex items-center justify-center">
                      {step.icon}
                    </div>
                    <div>
                      <span className="font-medium text-white block">{step.title}</span>
                      <span className="text-sm text-neutral-400">{step.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Botões de ação */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button 
                onClick={goToImplementationTrail}
                className="flex-1 bg-gradient-to-r from-[#0ABAB5] to-green-500 hover:from-[#0ABAB5]/90 hover:to-green-500/90 text-white font-semibold py-3 gap-2 text-base"
                disabled={!hasCompletedTrail}
              >
                {hasCompletedTrail ? (
                  <>
                    <ArrowRight className="h-5 w-5" />
                    Ver Trilha de Implementação
                  </>
                ) : (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Preparando Trilha...
                  </>
                )}
              </Button>
              
              <Button 
                onClick={isFirstAccess ? startWelcomeTour : goToDashboard}
                variant="outline"
                className="flex-1 border-[#0ABAB5]/30 text-[#0ABAB5] hover:bg-[#0ABAB5]/10 font-semibold py-3 gap-2 text-base"
              >
                <BarChart3 className="h-5 w-5" />
                {isFirstAccess ? "Fazer Tour do Dashboard" : "Ir para Dashboard"}
              </Button>
            </motion.div>

            {/* Footer com dica */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-center pt-4 border-t border-white/5"
            >
              <p className="text-xs text-neutral-500">
                💡 Dica: Você pode sempre voltar aqui através do menu "Ajuda" no dashboard
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { OnboardingCompletedNew };
