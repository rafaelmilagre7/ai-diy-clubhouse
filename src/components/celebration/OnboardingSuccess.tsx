import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, CheckCircle, Star, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { SuccessCard } from "./SuccessCard";

interface OnboardingSuccessProps {
  userName: string;
  userType: 'entrepreneur' | 'learner';
  onComplete: () => void;
}

export const OnboardingSuccess: React.FC<OnboardingSuccessProps> = ({
  userName,
  userType,
  onComplete
}) => {

  useEffect(() => {
    // Sequência de confetes mais elaborada
    const celebrateCompletion = () => {
      // Primeira explosão central
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Segunda explosão lateral esquerda
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
      }, 250);

      // Terceira explosão lateral direita
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 500);

      // Chuva de confetes final
      setTimeout(() => {
        confetti({
          particleCount: 150,
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          origin: {
            x: Math.random(),
            y: Math.random() - 0.2
          }
        });
      }, 750);
    };

    celebrateCompletion();
    
    // Auto complete após animações
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const getSuccessMessage = () => {
    if (userType === 'entrepreneur') {
      return {
        title: '🎉 Onboarding Completo!',
        message: `Parabéns, ${userName}! Sua jornada empresarial com IA está configurada. Acesse agora ferramentas e estratégias personalizadas para transformar seu negócio!`
      };
    } else {
      return {
        title: '🎓 Pronto para Aprender!',
        message: `Fantástico, ${userName}! Sua trilha de aprendizado personalizada está pronta. Comece agora sua jornada para dominar a Inteligência Artificial!`
      };
    }
  };

  const { title, message } = getSuccessMessage();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="max-w-md w-full"
      >
        <SuccessCard
          title={title}
          message={message}
          type="implementation"
          showConfetti={false} // Não usar confetes internos
          className="border-primary/30 shadow-2xl shadow-primary/20"
        />

        {/* Elementos decorativos flutuantes */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            >
              {i % 4 === 0 && <Star className="h-6 w-6 text-yellow-400" />}
              {i % 4 === 1 && <Sparkles className="h-5 w-5 text-blue-400" />}
              {i % 4 === 2 && <Trophy className="h-6 w-6 text-orange-400" />}
              {i % 4 === 3 && <CheckCircle className="h-5 w-5 text-green-400" />}
            </motion.div>
          ))}
        </div>

        {/* Texto de progresso */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="text-center mt-6"
        >
          <p className="text-sm text-muted-foreground">
            Redirecionando para seu dashboard personalizado...
          </p>
          <div className="flex justify-center mt-2">
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-primary rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};