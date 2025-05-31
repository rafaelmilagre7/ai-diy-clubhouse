
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CheckCircle, Zap, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useOnboardingFinalData } from '@/hooks/onboarding/useOnboardingFinalData';

export const CompletionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: onboardingData } = useOnboardingFinalData();
  const [personalizedMessage, setPersonalizedMessage] = useState<string>('');
  const [isLoadingMessage, setIsLoadingMessage] = useState(true);

  useEffect(() => {
    // Trigger confetti effect
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: randomInRange(0.1, 0.3),
          y: Math.random() - 0.2
        }
      });
      
      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: randomInRange(0.7, 0.9),
          y: Math.random() - 0.2
        }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    generatePersonalizedMessage();
  }, [onboardingData]);

  const generatePersonalizedMessage = async () => {
    if (!onboardingData || !user) {
      setPersonalizedMessage('Parabéns por concluir seu onboarding! Sua jornada de implementação de IA está prestes a começar.');
      setIsLoadingMessage(false);
      return;
    }

    try {
      setIsLoadingMessage(true);
      
      const { data, error } = await supabase.functions.invoke('generate-completion-message', {
        body: { onboarding_data: onboardingData }
      });

      if (error) {
        console.error('Erro ao gerar mensagem personalizada:', error);
        setPersonalizedMessage('Parabéns por concluir seu onboarding! Sua jornada de implementação de IA está prestes a começar.');
      } else {
        setPersonalizedMessage(data.message || 'Parabéns por concluir seu onboarding! Sua jornada de implementação de IA está prestes a começar.');
      }
    } catch (error) {
      console.error('Erro ao chamar função de mensagem:', error);
      setPersonalizedMessage('Parabéns por concluir seu onboarding! Sua jornada de implementação de IA está prestes a começar.');
    } finally {
      setIsLoadingMessage(false);
    }
  };

  const actionCards = [
    {
      title: 'Dashboard',
      description: 'Acompanhe seu progresso e explore todas as funcionalidades',
      icon: BarChart3,
      action: () => navigate('/dashboard'),
      gradient: 'from-blue-500 to-blue-700',
      delay: 0.2
    },
    {
      title: 'Trilha de Implementação',
      description: 'Acesse sua trilha personalizada e comece a implementar IA',
      icon: Zap,
      action: () => navigate('/implementation-trail'),
      gradient: 'from-viverblue to-blue-600',
      delay: 0.4
    },
    {
      title: 'Networking',
      description: 'Conecte-se com outros empresários e expanda sua rede',
      icon: Users,
      action: () => navigate('/networking'),
      gradient: 'from-purple-500 to-purple-700',
      delay: 0.6
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <div className="absolute inset-0 w-24 h-24 bg-green-500 rounded-full animate-ping opacity-25"></div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            🎉 Onboarding Concluído!
          </h1>
        </motion.div>

        {/* Personalized Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-8">
              {isLoadingMessage ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-viverblue border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-300">Gerando mensagem personalizada...</p>
                </div>
              ) : (
                <p className="text-xl text-gray-200 leading-relaxed">
                  {personalizedMessage}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {actionCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + card.delay }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:border-viverblue/50 transition-all duration-300 cursor-pointer h-full">
                <CardContent className="p-6 text-center h-full flex flex-col justify-between">
                  <div>
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${card.gradient} mb-4`}>
                      <card.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {card.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-6">
                      {card.description}
                    </p>
                  </div>
                  <Button
                    onClick={card.action}
                    className="w-full bg-viverblue hover:bg-viverblue/90"
                  >
                    Acessar
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center"
        >
          <p className="text-gray-400 text-sm">
            Agora você tem acesso completo a todas as funcionalidades do Viver de IA Club! 🚀
          </p>
        </motion.div>
      </div>
    </div>
  );
};
