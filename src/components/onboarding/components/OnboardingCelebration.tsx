import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Sparkles, Rocket, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { EnhancedButton } from './EnhancedButton';

interface OnboardingCelebrationProps {
  isVisible: boolean;
  onComplete: () => void;
  userName?: string;
}

export const OnboardingCelebration: React.FC<OnboardingCelebrationProps> = ({
  isVisible,
  onComplete,
  userName = 'Aventureiro'
}) => {
  const [showStep, setShowStep] = useState(0);

  useEffect(() => {
    if (isVisible) {
      // Confetti inicial
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
        });
      }, 500);

      // Sequência de passos da celebração
      const timer1 = setTimeout(() => setShowStep(1), 800);
      const timer2 = setTimeout(() => setShowStep(2), 1500);
      const timer3 = setTimeout(() => setShowStep(3), 2500);

      // Confetti final
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.4 },
          colors: ['#3B82F6', '#10B981', '#F59E0B']
        });
      }, 3000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
          className="max-w-2xl w-full text-center space-y-8"
        >
          {/* Ícone principal animado */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 1, delay: 0.5 }}
            className="relative mx-auto w-24 h-24"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-viverblue to-viverblue-light rounded-full animate-pulse" />
            <div className="relative w-full h-full bg-gradient-to-br from-viverblue to-viverblue-light rounded-full flex items-center justify-center">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            
            {/* Estrelas animadas ao redor */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1 + i * 0.1 }}
                  className="absolute w-4 h-4 text-yellow-400"
                  style={{
                    transform: `rotate(${i * 60}deg) translateY(-40px) rotate(-${i * 60}deg)`
                  }}
                >
                  <Star className="w-4 h-4 fill-current" />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Mensagem principal */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Parabéns, {userName}!
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Você completou seu perfil e está oficialmente pronto para 
              <span className="text-viverblue font-semibold"> transformar seu negócio com IA!</span>
            </p>
          </motion.div>

          {/* Cards de conquistas */}
          <AnimatePresence>
            {showStep >= 1 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="grid md:grid-cols-3 gap-4"
              >
                <div className="bg-gradient-to-br from-green-500/20 to-green-400/10 border border-green-500/30 rounded-xl p-4">
                  <Sparkles className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <h3 className="text-white font-semibold">Perfil Completo</h3>
                  <p className="text-sm text-slate-300">Sua jornada personalizada foi criada</p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-400/10 border border-blue-500/30 rounded-xl p-4">
                  <Rocket className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <h3 className="text-white font-semibold">Pronto para Decolar</h3>
                  <p className="text-sm text-slate-300">Acesso total à plataforma liberado</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-400/10 border border-purple-500/30 rounded-xl p-4">
                  <Heart className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <h3 className="text-white font-semibold">Bem-vindo!</h3>
                  <p className="text-sm text-slate-300">Você faz parte da comunidade IA</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Próximos passos */}
          <AnimatePresence>
            {showStep >= 2 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-gradient-to-r from-viverblue/10 to-viverblue-light/10 rounded-xl p-6 border border-viverblue/20"
              >
                <h3 className="text-white font-semibold mb-4 text-lg">O que acontece agora?</h3>
                <div className="grid md:grid-cols-2 gap-4 text-left">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-viverblue rounded-full" />
                      <span className="text-slate-300 text-sm">Explore soluções personalizadas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-viverblue rounded-full" />
                      <span className="text-slate-300 text-sm">Acesse cursos exclusivos</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-viverblue rounded-full" />
                      <span className="text-slate-300 text-sm">Conecte-se com a comunidade</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-viverblue rounded-full" />
                      <span className="text-slate-300 text-sm">Implemente sua primeira IA</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botão para continuar */}
          <AnimatePresence>
            {showStep >= 3 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="pt-4"
              >
                <EnhancedButton
                  onClick={onComplete}
                  size="lg"
                  variant="primary"
                  className="px-16 py-4 text-lg font-semibold animate-pulse-glow"
                >
                  Começar Minha Jornada IA
                </EnhancedButton>
                
                <p className="text-slate-400 text-sm mt-3">
                  Você será redirecionado para seu dashboard personalizado
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};