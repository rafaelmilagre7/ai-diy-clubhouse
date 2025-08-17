import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, CheckCircle, Star, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

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
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="max-w-lg w-full"
      >
        {/* Card principal de sucesso */}
        <motion.div
          className="surface-elevated rounded-xl p-8 text-center space-y-6 shadow-aurora-strong border border-primary/20"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Ícone principal */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              delay: 0.4,
              type: "spring",
              stiffness: 300
            }}
            className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/30"
          >
            <Trophy className="w-10 h-10 text-primary" />
          </motion.div>

          {/* Título */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-2"
          >
            <h1 className="text-heading-2 text-primary font-bold">
              {title}
            </h1>
            <p className="text-body text-muted-foreground leading-relaxed">
              {message}
            </p>
          </motion.div>

          {/* Indicador de progresso */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="pt-4 border-t border-border/50"
          >
            <p className="text-caption text-muted-foreground mb-3">
              Redirecionando para seu dashboard personalizado...
            </p>
            <div className="flex justify-center space-x-1">
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
          </motion.div>
        </motion.div>

        {/* Elementos decorativos flutuantes usando cores do sistema */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                rotate: [0, 360],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            >
              {i % 4 === 0 && <Star className="h-5 w-5 text-primary/40" />}
              {i % 4 === 1 && <Sparkles className="h-4 w-4 text-viverblue/40" />}
              {i % 4 === 2 && <Trophy className="h-5 w-5 text-accent-foreground/40" />}
              {i % 4 === 3 && <CheckCircle className="h-4 w-4 text-primary/60" />}
            </motion.div>
          ))}
        </div>

        {/* Efeito de brilho de fundo */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-viverblue/5 rounded-xl blur-3xl -z-10" />
      </motion.div>
    </div>
  );
};