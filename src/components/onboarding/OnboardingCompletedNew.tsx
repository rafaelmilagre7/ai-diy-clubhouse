
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, Zap, Users, TrendingUp } from 'lucide-react';
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
            Seu onboarding foi concluído com sucesso! Agora você tem acesso completo à 
            <span className="text-viverblue font-semibold"> VIVER DE IA</span>
          </motion.p>
        </div>
      </motion.div>

      {/* Funcionalidades Liberadas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
      >
        <div className="glassmorphism border-green-500/20 rounded-xl p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Trilha de Implementação</h3>
              <p className="text-green-400 text-sm">✅ Liberada!</p>
            </div>
          </div>
          <p className="text-gray-300 text-sm">
            Sua trilha personalizada está pronta com soluções específicas baseadas no seu perfil e objetivos de negócio.
          </p>
        </div>

        <div className="glassmorphism border-blue-500/20 rounded-xl p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Networking Inteligente</h3>
              <p className="text-blue-400 text-sm">✅ Ativado!</p>
            </div>
          </div>
          <p className="text-gray-300 text-sm">
            Conecte-se com outros empreendedores com base em compatibilidade e objetivos similares.
          </p>
        </div>
      </motion.div>

      {/* Estatísticas de Progresso */}
      <ProgressStats />

      {/* Cards de Ação */}
      <ActionCards 
        onGoToTrail={goToImplementationTrail}
        onGoToDashboard={goToDashboard}
      />

      {/* Próximos Passos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="text-center space-y-4 pt-8 border-t border-gray-700/30"
      >
        <div className="flex items-center justify-center space-x-2 mb-4">
          <TrendingUp className="w-6 h-6 text-viverblue" />
          <h3 className="text-2xl font-semibold text-white">
            Sua Jornada de IA Começa Agora! 🚀
          </h3>
        </div>
        <p className="text-gray-400 max-w-3xl mx-auto">
          Você agora tem acesso a uma trilha personalizada, networking inteligente, comunidade ativa, ferramentas exclusivas 
          e todo o suporte necessário para implementar IA no seu negócio com sucesso.
        </p>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="bg-gradient-to-r from-viverblue/10 to-purple-600/10 border border-viverblue/30 rounded-lg p-4 mt-6"
        >
          <p className="text-viverblue-light font-medium">
            💡 <strong>Dica:</strong> Comece pela sua trilha de implementação para ver soluções específicas para seu negócio!
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
