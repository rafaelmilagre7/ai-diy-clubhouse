
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles } from 'lucide-react';
import { usePostOnboarding } from '@/hooks/onboarding/usePostOnboarding';
import { ProgressStats } from './completion/ProgressStats';
import { ActionCards } from './completion/ActionCards';

export const OnboardingCompletedNew: React.FC = () => {
  const {
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

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-6"
      >
        {/* Trophy Icon com animação */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-viverblue to-blue-600 mb-6 relative"
        >
          <Trophy className="w-12 h-12 text-white" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </motion.div>
        </motion.div>
        
        {/* Título principal */}
        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-viverblue-light to-viverblue bg-clip-text text-transparent"
          >
            🎉 Parabéns!
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Seu onboarding foi concluído com sucesso! Agora você faz parte da comunidade 
            <span className="text-viverblue font-semibold"> VIVER DE IA</span>
          </motion.p>
        </div>
      </motion.div>

      {/* Estatísticas de Progresso */}
      <ProgressStats />

      {/* Cards de Ação */}
      <ActionCards 
        onGoToTrail={goToImplementationTrail}
        onGoToDashboard={goToDashboard}
      />

      {/* Status da Trilha */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="glassmorphism border-green-500/20 rounded-xl p-6 text-center"
      >
        <div className="flex items-center justify-center space-x-3">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <p className="text-green-400 font-medium">
            ✨ Trilha Personalizada Pronta! Sua jornada de IA foi criada com base no seu perfil.
          </p>
        </div>
      </motion.div>

      {/* Mensagem de Boas-vindas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="text-center space-y-4 pt-8 border-t border-gray-700/30"
      >
        <h3 className="text-2xl font-semibold text-white">
          Bem-vindo à Transformação Digital com IA! 🚀
        </h3>
        <p className="text-gray-400 max-w-3xl mx-auto">
          Você agora tem acesso a uma trilha personalizada, comunidade ativa, ferramentas exclusivas 
          e todo o suporte necessário para implementar IA no seu negócio com sucesso.
        </p>
      </motion.div>
    </div>
  );
};
