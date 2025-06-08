
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles, Loader2, Zap, Trophy, Star } from 'lucide-react';
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
      <div className="space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="flex justify-center">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-viverblue/20 to-viverblue-light/20 flex items-center justify-center"
            >
              <Loader2 className="w-10 h-10 text-viverblue animate-spin" />
            </motion.div>
          </div>
          
          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-heading font-bold text-white"
            >
              Processando suas informações{' '}
              <span className="bg-gradient-to-r from-viverblue to-viverblue-light bg-clip-text text-transparent">
                com IA... 🤖
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed"
            >
              Nossa Inteligência Artificial está analisando seu perfil e criando 
              uma experiência totalmente personalizada para você!
            </motion.p>
          </div>
        </motion.div>

        {/* Cartão de processamento */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-[#151823] border border-white/10 rounded-2xl p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Zap className="w-6 h-6 text-viverblue animate-pulse" />
                <span className="text-xl font-semibold text-viverblue">IA trabalhando...</span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm text-neutral-300">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                  className="flex items-center gap-3 p-3 bg-[#181A2A] rounded-lg"
                >
                  <div className="w-2 h-2 bg-viverblue rounded-full animate-pulse"></div>
                  <span>✨ Analisando seu perfil empresarial...</span>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                  className="flex items-center gap-3 p-3 bg-[#181A2A] rounded-lg"
                >
                  <div className="w-2 h-2 bg-viverblue rounded-full animate-pulse"></div>
                  <span>🎯 Personalizando soluções de IA...</span>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4 }}
                  className="flex items-center gap-3 p-3 bg-[#181A2A] rounded-lg"
                >
                  <div className="w-2 h-2 bg-viverblue rounded-full animate-pulse"></div>
                  <span>📊 Criando métricas de sucesso...</span>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.6 }}
                  className="flex items-center gap-3 p-3 bg-[#181A2A] rounded-lg"
                >
                  <div className="w-2 h-2 bg-viverblue rounded-full animate-pulse"></div>
                  <span>🚀 Preparando sua jornada...</span>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Dica */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="bg-viverblue/5 border border-viverblue/20 rounded-xl p-4 text-center max-w-2xl mx-auto"
        >
          <p className="text-sm text-neutral-300">
            💡 <strong className="text-white">Quase pronto:</strong> Estamos criando sua experiência personalizada! 🎯
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Mensagem final da IA */}
      {finalAIMessage && (
        <AIMessageDisplay message={finalAIMessage} />
      )}

      {/* Header de sucesso */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div className="flex justify-center">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center"
          >
            <Trophy className="w-10 h-10 text-green-500" />
          </motion.div>
        </div>
        
        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-heading font-bold text-white"
          >
            ONBOARDING{' '}
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              CONCLUÍDO! 🎉
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed"
          >
            Sua experiência está 100% personalizada e você está pronto para 
            transformar seu negócio com Inteligência Artificial!
          </motion.p>
        </div>
      </motion.div>

      {/* Botão de ação */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        className="flex justify-center pt-6"
      >
        <Button 
          onClick={handleComplete}
          disabled={isCompleting}
          size="lg"
          className="h-16 px-12 bg-viverblue hover:bg-viverblue-dark text-[#0F111A] text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          {isCompleting ? (
            <>
              <Loader2 className="animate-spin mr-3 h-6 w-6" />
              Finalizando...
            </>
          ) : (
            <>
              <Star className="mr-3 h-6 w-6" />
              ACESSAR MEU DASHBOARD! 🚀
            </>
          )}
        </Button>
      </motion.div>

      {/* Card de boas-vindas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="max-w-3xl mx-auto"
      >
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6">
          <div className="text-center space-y-3">
            <h3 className="text-xl font-heading font-semibold text-white flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-green-400" />
              Sua transformação com IA começa AGORA!
            </h3>
            <p className="text-neutral-300 leading-relaxed">
              Prepare-se para descobrir soluções incríveis, implementar IA no seu negócio 
              e fazer parte de uma comunidade de empresários visionários!
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
