
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle, ArrowRight, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OnboardingData } from '../types/onboardingTypes';
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
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAIMessage, setShowAIMessage] = useState(false);

  useEffect(() => {
    // Disparar confetti após um pequeno delay
    const timer = setTimeout(() => {
      setShowConfetti(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 500);

    // Mostrar mensagem da IA após o confetti
    const aiTimer = setTimeout(() => {
      setShowAIMessage(true);
    }, 1500);

    return () => {
      clearTimeout(timer);
      clearTimeout(aiTimer);
    };
  }, []);

  const isClubMember = memberType === 'club';
  const nickname = data.nickname || data.name || 'Amigo';

  const generateAIMessage = () => {
    if (isClubMember) {
      return `Olá ${nickname}! 🚀 Analisei seu perfil e já estou preparando soluções personalizadas para seu ${data.businessArea || 'negócio'}. Com base nos seus objetivos, vou priorizar ferramentas que ajudem com ${data.primaryGoals?.[0] || 'seus principais desafios'}. Prepare-se para uma jornada incrível!`;
    } else {
      return `Oi ${nickname}! 🎓 Que empolgante conhecer alguém da área de ${data.studyArea || 'sua área'}! Já estou organizando um plano de estudos personalizado para você alcançar ${data.primaryGoals?.[0] || 'seus objetivos'}. Vamos juntos nessa jornada de aprendizado!`;
    }
  };

  return (
    <div className="space-y-8 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <div className="flex justify-center">
          <motion.div 
            className="bg-gradient-to-br from-viverblue/20 to-viverblue-light/20 p-6 rounded-full"
            animate={showConfetti ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            <CheckCircle className="w-16 h-16 text-viverblue" />
          </motion.div>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Parabéns, {nickname}! 🎉
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {isClubMember 
            ? 'Seu onboarding está completo! Agora vamos revolucionar seu negócio com IA!'
            : 'Sua jornada de formação começa agora! Prepare-se para dominar a IA!'
          }
        </p>
      </motion.div>

      {/* Resumo dos dados coletados */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-viverblue/10 to-viverblue-light/10 border border-viverblue/20 rounded-xl p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-viverblue" />
          Resumo do seu perfil
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {isClubMember ? (
            <>
              <div><strong>Negócio:</strong> {data.businessArea || 'Não informado'}</div>
              <div><strong>Estágio:</strong> {data.businessStage || 'Não informado'}</div>
              <div><strong>Equipe:</strong> {data.teamSize || 'Não informado'}</div>
              <div><strong>Experiência IA:</strong> {data.aiExperience || 'Não informado'}</div>
            </>
          ) : (
            <>
              <div><strong>Área:</strong> {data.studyArea || 'Não informada'}</div>
              <div><strong>Nível:</strong> {data.educationLevel || 'Não informado'}</div>
              <div><strong>Instituição:</strong> {data.institution || 'Não informada'}</div>
              <div><strong>Experiência IA:</strong> {data.aiExperience || 'Não informada'}</div>
            </>
          )}
        </div>
      </motion.div>

      {/* Mensagem da IA */}
      {showAIMessage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-l-4 border-viverblue rounded-lg p-6"
        >
          <div className="flex items-start gap-3">
            <div className="bg-viverblue/20 p-2 rounded-full">
              <Bot className="w-5 h-5 text-viverblue" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white mb-2">
                Sua IA Pessoal diz:
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                {generateAIMessage()}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="pt-6"
      >
        <Button 
          onClick={onComplete}
          disabled={isCompleting}
          className="bg-viverblue hover:bg-viverblue-dark text-white text-lg py-6 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          size="lg"
        >
          {isCompleting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Preparando sua experiência...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {isClubMember ? 'Ir para o Dashboard' : 'Começar a aprender'}
              <ArrowRight className="w-5 h-5" />
            </div>
          )}
        </Button>
      </motion.div>
    </div>
  );
};
