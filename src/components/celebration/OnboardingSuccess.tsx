import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, CheckCircle, Star, Award } from "lucide-react";
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
    console.log('[CONFETTI] Iniciando celebração de confetti...');
    
    // Sequência de confetes mais elaborada e vistosa
    const celebrateCompletion = () => {
      console.log('[CONFETTI] Primeira explosão central');
      // Primeira explosão central - maior e mais impactante
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#0ABAB5', '#E11D48', '#7C3AED', '#F59E0B', '#10B981']
      });

      // Segunda explosão lateral esquerda
      setTimeout(() => {
        console.log('[CONFETTI] Segunda explosão - lateral esquerda');
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 65,
          origin: { x: 0, y: 0.8 },
          colors: ['#0ABAB5', '#E11D48', '#F59E0B']
        });
      }, 300);

      // Terceira explosão lateral direita  
      setTimeout(() => {
        console.log('[CONFETTI] Terceira explosão - lateral direita');
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 65,
          origin: { x: 1, y: 0.8 },
          colors: ['#7C3AED', '#10B981', '#0ABAB5']
        });
      }, 600);

      // Chuva de confetes final - mais intensa
      setTimeout(() => {
        console.log('[CONFETTI] Chuva final de confetti');
        confetti({
          particleCount: 200,
          startVelocity: 35,
          spread: 360,
          ticks: 80,
          origin: {
            x: Math.random(),
            y: Math.random() - 0.2
          },
          colors: ['#0ABAB5', '#E11D48', '#7C3AED', '#F59E0B', '#10B981']
        });
      }, 900);

      // Explosão final do topo
      setTimeout(() => {
        console.log('[CONFETTI] Explosão final do topo');
        confetti({
          particleCount: 100,
          spread: 120,
          origin: { y: 0.2 },
          colors: ['#0ABAB5', '#E11D48', '#7C3AED']
        });
      }, 1200);
    };

    // Iniciar celebração imediatamente
    celebrateCompletion();
    
    // Auto complete após todas as animações terminarem
    const timer = setTimeout(() => {
      console.log('[CONFETTI] Finalizando celebração e chamando onComplete');
      onComplete();
    }, 2800);
    
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
    <div className="fixed inset-0 bg-gradient-to-br from-background via-background/95 to-primary/10 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.3, opacity: 0, rotateY: -180 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        transition={{ 
          type: "spring", 
          duration: 1.2,
          bounce: 0.4
        }}
        className="max-w-2xl w-full relative"
      >
        {/* Card principal de sucesso com design melhorado */}
        <motion.div
          className="bg-card border border-primary/30 rounded-2xl p-10 text-center space-y-8 shadow-2xl shadow-primary/20 backdrop-blur-sm"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          {/* Ícone principal com animação orbital */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              delay: 0.5,
              type: "spring",
              stiffness: 200,
              damping: 10
            }}
            className="mx-auto w-28 h-28 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center border-4 border-primary/40 shadow-lg shadow-primary/25 relative"
          >
            <Trophy className="w-16 h-16 text-primary animate-pulse" />
            
            {/* Anéis orbitais decorativos */}
            <motion.div
              className="absolute inset-0 border-2 border-primary/20 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 border border-accent/30 rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>

          {/* Título com gradiente */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="space-y-4"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {title}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto">
              {message}
            </p>
          </motion.div>

          {/* Indicador de progresso estilizado */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="pt-6 border-t border-primary/20"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <CheckCircle className="w-5 h-5 text-primary" />
              <p className="text-sm text-muted-foreground">
                Redirecionando para seu dashboard personalizado...
              </p>
            </div>
            
            {/* Loading dots melhorados */}
            <div className="flex justify-center space-x-2">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full"
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Partículas flutuantes melhoradas */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.2, 0],
                y: [0, -60, -120],
                x: [0, (Math.random() - 0.5) * 100],
                rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)]
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeOut"
              }}
            >
              {i % 4 === 0 && <Star className="h-6 w-6 text-primary/60" />}
              {i % 4 === 1 && <Award className="h-5 w-5 text-accent/60" />}
              {i % 4 === 2 && <Trophy className="h-6 w-6 text-primary/40" />}
              {i % 4 === 3 && <CheckCircle className="h-5 w-5 text-accent/50" />}
            </motion.div>
          ))}
        </div>

        {/* Brilho de fundo dinâmico */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 rounded-2xl blur-3xl -z-10"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
    </div>
  );
};