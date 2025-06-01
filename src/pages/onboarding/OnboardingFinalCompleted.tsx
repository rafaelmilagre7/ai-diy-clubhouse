
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePostOnboarding } from '@/hooks/onboarding/usePostOnboarding';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const OnboardingFinalCompleted = () => {
  const navigate = useNavigate();
  const { goToImplementationTrail, goToDashboard, markFirstDashboardAccess } = usePostOnboarding();

  useEffect(() => {
    // Marcar como primeira visita ao completar o onboarding
    markFirstDashboardAccess();
    
    // Mostrar toast de boas-vindas
    toast.success('🎉 Onboarding concluído com sucesso!', {
      description: 'Agora você tem acesso a todas as funcionalidades da plataforma!'
    });
  }, [markFirstDashboardAccess]);

  const handleGoToTrail = () => {
    console.log('🎯 Usuário escolheu ir para trilha de implementação');
    goToImplementationTrail();
  };

  const handleGoToDashboard = () => {
    console.log('📊 Usuário escolheu ir para dashboard');
    goToDashboard();
  };

  const handleExploreNetworking = () => {
    console.log('🤝 Usuário escolheu explorar networking');
    toast.success('Redirecionando para o networking!');
    navigate('/networking');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-viverblue/20 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full"
      >
        {/* Header de sucesso */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            Parabéns! 🎉
          </h1>
          
          <p className="text-xl text-gray-300 mb-2">
            Seu onboarding foi concluído com sucesso
          </p>
          
          <div className="flex items-center justify-center gap-2 text-viverblue">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">Todas as funcionalidades desbloqueadas!</span>
            <Sparkles className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Cards de ações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Trilha de Implementação */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-viverblue to-blue-600 border-none text-white hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowRight className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Trilha de Implementação
                </h3>
                <p className="text-blue-100 text-sm mb-4">
                  Sua jornada personalizada de IA baseada no seu perfil
                </p>
                <Button
                  onClick={handleGoToTrail}
                  variant="secondary"
                  className="w-full bg-white text-viverblue hover:bg-gray-100"
                >
                  Começar Agora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Networking */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-purple-600 to-indigo-600 border-none text-white hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Networking Inteligente
                </h3>
                <p className="text-purple-100 text-sm mb-4">
                  Conecte-se com outros empreendedores da comunidade
                </p>
                <Button
                  onClick={handleExploreNetworking}
                  variant="secondary"
                  className="w-full bg-white text-purple-600 hover:bg-gray-100"
                >
                  Explorar Networking
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Botão alternativo para dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Button
            onClick={handleGoToDashboard}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Ir para Dashboard
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OnboardingFinalCompleted;
