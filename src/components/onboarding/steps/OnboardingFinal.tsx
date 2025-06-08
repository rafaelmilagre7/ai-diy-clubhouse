
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OnboardingData } from '../types/onboardingTypes';
import { AIMessageDisplay } from '../components/AIMessageDisplay';
import confetti from 'canvas-confetti';

interface OnboardingFinalProps {
  data: OnboardingData;
  onComplete: () => void;
  isCompleting: boolean;
  memberType: 'club' | 'formacao';
}

export const OnboardingFinal = ({ 
  data, 
  onComplete, 
  isCompleting, 
  memberType 
}: OnboardingFinalProps) => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [finalAIMessage, setFinalAIMessage] = useState('');

  useEffect(() => {
    // Simular processamento com IA
    const timer = setTimeout(() => {
      // Gerar mensagem final personalizada usando TODAS as respostas
      const firstName = data.name?.split(' ')[0] || 'Amigo';
      const companyName = data.companyName || 'sua empresa';
      const businessSector = data.businessSector || '';
      const mainObjective = data.mainObjective || '';
      const city = data.city || '';
      const state = data.state || '';
      
      let objectiveText = '';
      switch (mainObjective) {
        case 'reduce-costs':
          objectiveText = 'reduzir custos';
          break;
        case 'increase-sales':
          objectiveText = 'aumentar vendas';
          break;
        case 'automate-processes':
          objectiveText = 'automatizar processos';
          break;
        case 'innovate-products':
          objectiveText = 'inovar produtos';
          break;
      }

      const aiMessage = `🎉 ${firstName}, QUE JORNADA INCRÍVEL acabamos de fazer juntos! 

Agora tenho uma visão completa de quem você é e do potencial GIGANTESCO da ${companyName}! Uma empresa de ${businessSector.toLowerCase()} em ${city}/${state} com foco em ${objectiveText} - isso é uma combinação PERFEITA para transformação com IA!

Nossa plataforma já está personalizando soluções específicas para seu perfil. Você terá acesso a:

🚀 **Soluções de IA curadas** especialmente para ${businessSector.toLowerCase()}
💼 **Planos de implementação** focados em ${objectiveText}
🎯 **Conteúdo personalizado** baseado no seu nível de conhecimento
📈 **Métricas de sucesso** alinhadas com seus objetivos de 90 dias

${data.curiosity ? `E não esqueci da sua curiosidade sobre ${data.curiosity.toLowerCase()} - vamos usar isso para tornar nossos encontros ainda mais especiais! ` : ''}

Bem-vindo oficialmente ao VIVER DE IA Club, ${firstName}! Sua jornada de transformação começa AGORA! 🔥`;

      setFinalAIMessage(aiMessage);
      setIsProcessing(false);
      setShowSuccess(true);
      
      // Disparar confete
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Confete adicional após um tempo
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [data]);

  const handleComplete = async () => {
    await onComplete();
  };

  if (isProcessing) {
    return (
      <div className="space-y-8 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-viverblue/20 to-viverblue-light/20 p-6 rounded-full">
              <Loader2 className="w-12 h-12 text-viverblue animate-spin" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Processando suas informações com IA... 🤖
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Nossa Inteligência Artificial está analisando seu perfil e criando 
            uma experiência totalmente personalizada para você!
          </p>

          <div className="bg-gradient-to-r from-viverblue/10 to-viverblue-light/10 rounded-2xl p-8 space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-viverblue animate-pulse" />
              <span className="text-viverblue font-semibold">IA trabalhando...</span>
            </div>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <p>✨ Analisando seu perfil empresarial...</p>
              <p>🎯 Personalizando soluções de IA...</p>
              <p>📊 Criando métricas de sucesso...</p>
              <p>🚀 Preparando sua jornada...</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-center">
      {/* Mensagem final da IA */}
      {finalAIMessage && (
        <AIMessageDisplay message={finalAIMessage} />
      )}

      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <div className="flex justify-center">
          <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-6 rounded-full">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          ONBOARDING CONCLUÍDO! 🎉
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Sua experiência está 100% personalizada e você está pronto para 
          transformar seu negócio com Inteligência Artificial!
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="pt-6"
      >
        <Button 
          onClick={handleComplete}
          disabled={isCompleting}
          className="bg-viverblue hover:bg-viverblue-dark text-white text-xl py-8 px-16 rounded-xl text-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
          size="lg"
        >
          {isCompleting ? (
            <>
              <Loader2 className="animate-spin mr-2 h-6 w-6" />
              Finalizando...
            </>
          ) : (
            <>
              ACESSAR MEU DASHBOARD! 🚀
            </>
          )}
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6"
      >
        <p className="text-lg font-semibold text-gray-800 mb-2">
          🏆 Sua transformação com IA começa AGORA!
        </p>
        <p className="text-gray-600">
          Prepare-se para descobrir soluções incríveis, implementar IA no seu negócio 
          e fazer parte de uma comunidade de empresários visionários!
        </p>
      </motion.div>
    </div>
  );
};
