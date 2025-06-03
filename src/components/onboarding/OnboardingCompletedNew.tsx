
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, Trophy, ArrowRight, BarChart3, Users, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

const OnboardingCompletedNew: React.FC = () => {
  const navigate = useNavigate();
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    setShowCelebration(true);
    
    // Dispara confetes
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 500);
  }, []);

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  const handleGoToImplementationTrail = () => {
    navigate("/implementation-trail");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1121] via-[#1A1E2E] to-[#0B1121] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="bg-[#1A1E2E] border-white/10 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="relative w-20 h-20 mx-auto mb-6"
            >
              <div className="absolute inset-0 bg-[#0ABAB5]/20 rounded-full animate-ping opacity-30"></div>
              <div className="relative flex items-center justify-center bg-[#0ABAB5]/20 w-20 h-20 rounded-full">
                <CheckCircle className="h-10 w-10 text-[#0ABAB5]" />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CardTitle className="text-3xl font-bold text-white mb-3">
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

          <CardContent className="space-y-8">
            {/* Cards de conquistas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { 
                  icon: <Trophy className="h-6 w-6 text-yellow-500" />, 
                  title: "Perfil Completo", 
                  description: "Informações registradas",
                  delay: 0.4 
                },
                { 
                  icon: <BarChart3 className="h-6 w-6 text-[#0ABAB5]" />, 
                  title: "Objetivos Definidos", 
                  description: "Metas estabelecidas",
                  delay: 0.5 
                },
                { 
                  icon: <Sparkles className="h-6 w-6 text-purple-500" />, 
                  title: "Trilha Personalizada", 
                  description: "Pronto para começar",
                  delay: 0.6 
                }
              ].map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: achievement.delay }}
                  className="bg-[#151823] p-4 rounded-lg border border-white/5 text-center hover:border-[#0ABAB5]/20 transition-all"
                >
                  <div className="flex justify-center mb-2">
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

            {/* Próximos passos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-[#151823] p-6 rounded-lg border border-white/5"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-[#0ABAB5]" />
                Próximos Passos
              </h3>
              <div className="space-y-3 text-sm text-neutral-300">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#0ABAB5] rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <span className="font-medium">Explore sua trilha personalizada</span> - Comece implementando soluções de IA específicas para seu negócio
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#0ABAB5] rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <span className="font-medium">Monitore seu progresso</span> - Acompanhe suas conquistas no dashboard
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#0ABAB5] rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <span className="font-medium">Conecte-se com a comunidade</span> - Compartilhe experiências e aprenda com outros membros
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Botões de ação */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button 
                onClick={handleGoToImplementationTrail}
                className="flex-1 bg-[#0ABAB5] hover:bg-[#0ABAB5]/90 text-white font-semibold py-3 gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                Ver Trilha de Implementação
              </Button>
              
              <Button 
                onClick={handleGoToDashboard}
                variant="outline"
                className="flex-1 border-[#0ABAB5]/20 text-[#0ABAB5] hover:bg-[#0ABAB5]/10 font-semibold py-3 gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Ir para Dashboard
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { OnboardingCompletedNew };
