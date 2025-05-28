
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CheckCircle, Trophy, Target, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePostOnboarding } from '@/hooks/onboarding/usePostOnboarding';

export const OnboardingCompletedNew: React.FC = () => {
  const navigate = useNavigate();
  const {
    hasCompletedTrail,
    goToImplementationTrail,
    goToDashboard,
    checkTrailStatus
  } = usePostOnboarding();

  // Efeito de confetes na montagem
  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 500);

    // Verificar status da trilha
    checkTrailStatus();

    return () => clearTimeout(timer);
  }, [checkTrailStatus]);

  const achievements = [
    {
      icon: CheckCircle,
      title: 'Perfil Completo',
      description: 'Suas informações foram registradas com sucesso'
    },
    {
      icon: Target,
      title: 'Objetivos Definidos',
      description: 'Seus objetivos com IA foram mapeados'
    },
    {
      icon: Trophy,
      title: 'Trilha Pronta!',
      description: 'Sua trilha personalizada foi gerada'
    }
  ];

  const nextSteps = [
    {
      title: 'Explore sua trilha personalizada',
      description: 'Veja as soluções de IA recomendadas para seu negócio'
    },
    {
      title: 'Monitore seu progresso',
      description: 'Acompanhe sua evolução no dashboard'
    },
    {
      title: 'Conecte-se com a comunidade',
      description: 'Participe do fórum e networking'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F111A] to-[#161A2C] py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-8"
        >
          {/* Header */}
          <div className="space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-viverblue rounded-full mb-4"
            >
              <Trophy className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="text-4xl font-bold text-white mb-2">
              🎉 Parabéns!
            </h1>
            <p className="text-xl text-gray-300">
              Seu onboarding foi concluído com sucesso!
            </p>
            <p className="text-viverblue-light">
              Agora você faz parte da comunidade VIVER DE IA
            </p>
          </div>

          {/* Conquistas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card className="bg-gray-800/50 border-gray-700 text-center p-6">
                  <CardContent className="space-y-3">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-viverblue/20 rounded-full">
                      <achievement.icon className="w-6 h-6 text-viverblue" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {achievement.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Próximos Passos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-white">
              Próximos Passos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {nextSteps.map((step, index) => (
                <div
                  key={index}
                  className="bg-gray-800/30 rounded-lg p-4 text-left"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-viverblue rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">
                        {step.title}
                      </h4>
                      <p className="text-sm text-gray-400">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Botões de Ação */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
          >
            <Button
              onClick={goToImplementationTrail}
              className="bg-viverblue hover:bg-viverblue-dark text-white px-8 py-3 text-lg"
            >
              Ver Trilha de Implementação
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button
              onClick={goToDashboard}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white px-8 py-3 text-lg"
            >
              Ir para Dashboard
            </Button>
          </motion.div>

          {/* Status da Trilha */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-8 p-4 bg-green-500/10 rounded-lg border border-green-500/20"
          >
            <p className="text-green-400 font-medium">
              ✨ Trilha Pronta! Sua jornada personalizada de IA foi criada com base no seu perfil.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
