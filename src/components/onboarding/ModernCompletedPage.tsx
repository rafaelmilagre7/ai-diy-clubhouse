
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Sparkles, ArrowRight, Target, Users, BookOpen } from 'lucide-react';
import { usePostOnboarding } from '@/hooks/onboarding/usePostOnboarding';
import { ProgressStats } from './completion/ProgressStats';
import { ActionCards } from './completion/ActionCards';
import { useAuth } from '@/contexts/auth';

export const ModernCompletedPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [showContent, setShowContent] = useState(false);
  const {
    goToImplementationTrail,
    goToDashboard,
    markFirstDashboardAccess
  } = usePostOnboarding();

  const firstName = profile?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuário';

  useEffect(() => {
    // Marcar como primeiro acesso concluído
    markFirstDashboardAccess();
    
    // Animação de entrada
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [markFirstDashboardAccess]);

  const handleGoToTrail = () => {
    console.log('🎯 Usuário escolheu ir para trilha de implementação');
    goToImplementationTrail();
  };

  const handleGoToDashboard = () => {
    console.log('📊 Usuário escolheu ir para dashboard');
    goToDashboard();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="relative mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-viverblue to-blue-600 rounded-full mb-4"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
            </motion.div>
          </div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Parabéns, {firstName}! 🎉
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Seu onboarding foi concluído com sucesso! Agora você tem acesso completo 
            à plataforma VIVER DE IA e sua trilha personalizada está pronta.
          </motion.p>
        </motion.div>

        {/* Progress Stats */}
        {showContent && <ProgressStats />}

        {/* Action Cards */}
        {showContent && (
          <ActionCards 
            onGoToTrail={handleGoToTrail}
            onGoToDashboard={handleGoToDashboard}
          />
        )}

        {/* Quick Access Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
          transition={{ delay: 1.2 }}
        >
          <Card className="glassmorphism border-gray-700/50">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-white mb-4">
                Próximos Passos Recomendados
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-2">
                  <Target className="w-6 h-6 text-viverblue mx-auto" />
                  <p className="text-gray-300">Explore sua trilha personalizada</p>
                </div>
                <div className="space-y-2">
                  <Users className="w-6 h-6 text-green-400 mx-auto" />
                  <p className="text-gray-300">Conecte-se com a comunidade</p>
                </div>
                <div className="space-y-2">
                  <BookOpen className="w-6 h-6 text-purple-400 mx-auto" />
                  <p className="text-gray-300">Acesse cursos e materiais</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showContent ? 1 : 0 }}
          transition={{ delay: 1.4 }}
          className="text-center mt-8"
        >
          <p className="text-gray-400 text-sm mb-4">
            Você pode acessar todas essas funcionalidades a qualquer momento pelo menu principal
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleGoToTrail}
              className="bg-viverblue hover:bg-viverblue-dark text-white px-8 py-3"
              size="lg"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Começar Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
