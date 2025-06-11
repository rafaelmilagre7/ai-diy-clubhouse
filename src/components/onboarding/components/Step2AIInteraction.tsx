
import React, { useEffect, useState } from 'react';
import { useAIMessageGeneration } from '../hooks/useAIMessageGeneration';
import { AIMessageDisplay } from './AIMessageDisplay';
import { TypingEffect } from './TypingEffect';
import { OnboardingData } from '../types/onboardingTypes';
import { motion } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';

interface Step2AIInteractionProps {
  data: OnboardingData;
  memberType: 'club' | 'formacao';
}

export const Step2AIInteraction: React.FC<Step2AIInteractionProps> = ({
  data,
  memberType
}) => {
  const {
    generateMessage,
    isGenerating,
    generatedMessage,
    error,
    progress
  } = useAIMessageGeneration();

  const [shouldShowMessage, setShouldShowMessage] = useState(false);
  const [typingComplete, setTypingComplete] = useState(false);

  // Gerar mensagem quando houver dados suficientes
  useEffect(() => {
    if (data.name && data.city && !isGenerating && !generatedMessage && !error) {
      console.log('[Step2AIInteraction] Gerando mensagem para:', data.name);
      generateMessage(data, memberType, 2);
    }
  }, [data.name, data.city, generateMessage, memberType, isGenerating, generatedMessage, error]);

  // Controlar quando mostrar a mensagem
  useEffect(() => {
    if (generatedMessage && !isGenerating) {
      console.log('[Step2AIInteraction] Mensagem recebida, iniciando exibição');
      setShouldShowMessage(true);
      setTypingComplete(false);
    }
  }, [generatedMessage, isGenerating]);

  const handleTypingComplete = () => {
    console.log('[Step2AIInteraction] Digitação completada');
    setTypingComplete(true);
  };

  // Mostrar loading enquanto gera
  if (isGenerating) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-viverblue/10 to-viverblue-light/10 border border-viverblue/30 rounded-xl p-6 mb-6"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="bg-viverblue/20 p-2 rounded-full">
            <Bot className="w-5 h-5 text-viverblue animate-pulse" />
          </div>
          <Sparkles className="w-4 h-4 text-viverblue animate-pulse" />
          <span className="text-sm font-semibold text-viverblue">IA VIVER DE IA</span>
        </div>
        
        <div className="space-y-3">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-slate-300/30 rounded w-full"></div>
            <div className="h-4 bg-slate-300/30 rounded w-5/6"></div>
            <div className="h-4 bg-slate-300/30 rounded w-4/6"></div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-viverblue rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-viverblue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-viverblue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="text-sm text-slate-400 text-center">
            Analisando seu perfil e gerando mensagem personalizada...
          </p>
        </div>
      </motion.div>
    );
  }

  // Mostrar mensagem com efeito de digitação
  if (shouldShowMessage && generatedMessage) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-viverblue/10 to-viverblue-light/10 border border-viverblue/30 rounded-xl p-6 mb-6"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="bg-viverblue/20 p-2 rounded-full">
            <Bot className="w-5 h-5 text-viverblue" />
          </div>
          <Sparkles className="w-4 h-4 text-viverblue" />
          <span className="text-sm font-semibold text-viverblue">IA VIVER DE IA</span>
        </div>
        
        <div className="prose prose-slate max-w-none">
          <div className="leading-relaxed text-slate-100">
            <TypingEffect
              text={generatedMessage}
              speed={25}
              onComplete={handleTypingComplete}
              startDelay={300}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  // Mostrar erro se houver
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/30 rounded-xl p-6 mb-6"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="bg-red-500/20 p-2 rounded-full">
            <Bot className="w-5 h-5 text-red-500" />
          </div>
          <span className="text-sm font-semibold text-red-500">ERRO NA IA</span>
        </div>
        
        <div className="prose prose-slate max-w-none">
          <p className="leading-relaxed text-slate-100">
            Houve um problema ao gerar sua mensagem personalizada. Mas não se preocupe, você pode continuar o onboarding normalmente.
          </p>
        </div>
      </motion.div>
    );
  }

  // Não mostrar nada se não houver dados suficientes
  return null;
};
