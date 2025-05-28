
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Zap, 
  Users, 
  ArrowRight, 
  BookOpen, 
  Target,
  Sparkles,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePostOnboarding } from '@/hooks/onboarding/usePostOnboarding';

export const ModernCompletedPage: React.FC = () => {
  const {
    goToImplementationTrail,
    goToDashboard,
    checkTrailStatus
  } = usePostOnboarding();

  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#0ABAB5', '#6366F1', '#8B5CF6']
      });
    }, 300);

    checkTrailStatus();
    return () => clearTimeout(timer);
  }, [checkTrailStatus]);

  const handleNetworkingRedirect = () => {
    window.location.href = '/networking';
  };

  const handleCommunityRedirect = () => {
    window.location.href = '/comunidade';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-viverblue to-purple-600 mb-4 relative"
        >
          <CheckCircle className="w-10 h-10 text-white" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </motion.div>
        </motion.div>

        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-viverblue-light to-viverblue bg-clip-text text-transparent"
          >
            Bem-vindo à sua jornada de IA! 🚀
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            Sua trilha personalizada está pronta! Agora você tem acesso a soluções 
            específicas para seu negócio e uma rede de empreendedores com objetivos similares.
          </motion.p>
        </div>
      </motion.div>

      {/* Main Action Cards */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
      >
        {/* Trilha Card */}
        <Card className="group glassmorphism border-viverblue/30 hover:border-viverblue/60 transition-all duration-300 hover:scale-105">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="w-16 h-16 bg-gradient-to-r from-viverblue to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div className="bg-green-500/20 px-3 py-1 rounded-full">
                  <span className="text-green-400 text-sm font-semibold">✓ Liberada</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-white">
                  Trilha de Implementação
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Sua trilha personalizada com soluções específicas baseadas no seu perfil, 
                  setor e objetivos de negócio. Comece implementando IA hoje mesmo.
                </p>
              </div>

              <Button
                onClick={goToImplementationTrail}
                className="w-full bg-viverblue hover:bg-viverblue-dark text-white font-semibold py-3 group"
              >
                Começar Implementação
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Networking Card */}
        <Card className="group glassmorphism border-purple-500/30 hover:border-purple-500/60 transition-all duration-300 hover:scale-105">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="bg-blue-500/20 px-3 py-1 rounded-full">
                  <span className="text-blue-400 text-sm font-semibold">✓ Ativado</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-white">
                  Networking Inteligente
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Conecte-se com empreendedores compatíveis baseado em setor, objetivos 
                  e estágio de implementação de IA.
                </p>
              </div>

              <Button
                onClick={handleNetworkingRedirect}
                variant="secondary"
                className="w-full font-semibold py-3 group"
              >
                Explorar Networking
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Secondary Actions */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
      >
        <Card className="glassmorphism border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6 text-orange-400" />
            </div>
            <h4 className="text-lg font-semibold text-white">Dashboard</h4>
            <p className="text-gray-400 text-sm">Monitore seu progresso e acesse todas as funcionalidades</p>
            <Button
              onClick={goToDashboard}
              variant="ghost"
              size="sm"
              className="text-orange-400 hover:text-orange-300"
            >
              Acessar Dashboard
            </Button>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <Users className="w-6 h-6 text-green-400" />
            </div>
            <h4 className="text-lg font-semibold text-white">Comunidade</h4>
            <p className="text-gray-400 text-sm">Participe de discussões e troque experiências</p>
            <Button
              onClick={handleCommunityRedirect}
              variant="ghost"
              size="sm"
              className="text-green-400 hover:text-green-300"
            >
              Entrar na Comunidade
            </Button>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-viverblue/20 rounded-full flex items-center justify-center mx-auto">
              <Target className="w-6 h-6 text-viverblue" />
            </div>
            <h4 className="text-lg font-semibold text-white">Soluções</h4>
            <p className="text-gray-400 text-sm">Explore nosso catálogo completo de soluções</p>
            <Button
              onClick={() => window.location.href = '/solutions'}
              variant="ghost"
              size="sm"
              className="text-viverblue hover:text-viverblue-light"
            >
              Ver Catálogo
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Success Message */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="text-center space-y-6 pt-8 border-t border-gray-700/30"
      >
        <div className="flex items-center justify-center space-x-2">
          <TrendingUp className="w-6 h-6 text-viverblue" />
          <h3 className="text-2xl font-semibold text-white">
            Sua jornada de transformação digital começou! 
          </h3>
        </div>

        <p className="text-gray-400 max-w-3xl mx-auto leading-relaxed">
          Com sua trilha personalizada, networking ativo e acesso à comunidade, você tem tudo 
          que precisa para implementar IA no seu negócio de forma estratégica e eficiente.
        </p>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="bg-gradient-to-r from-viverblue/10 to-purple-600/10 border border-viverblue/30 rounded-xl p-6 max-w-2xl mx-auto"
        >
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-viverblue/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <Sparkles className="w-5 h-5 text-viverblue" />
            </div>
            <div className="text-left">
              <p className="text-viverblue-light font-semibold mb-2">Próximo passo recomendado:</p>
              <p className="text-gray-300">
                Acesse sua <strong>Trilha de Implementação</strong> para ver as soluções específicas 
                recomendadas para seu perfil e comece sua primeira implementação hoje mesmo!
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
