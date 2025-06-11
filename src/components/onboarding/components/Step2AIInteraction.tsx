
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles, RefreshCw } from 'lucide-react';
import { OnboardingData } from '../types/onboardingTypes';
import { useAIMessageGeneration } from '../hooks/useAIMessageGeneration';
import { Button } from '@/components/ui/button';

interface Step2AIInteractionProps {
  data: OnboardingData;
  memberType: 'club' | 'formacao';
}

export const Step2AIInteraction: React.FC<Step2AIInteractionProps> = ({
  data,
  memberType
}) => {
  const { generateMessage, isGenerating, generatedMessage, error, clearMessage } = useAIMessageGeneration();
  const [hasGeneratedInitial, setHasGeneratedInitial] = useState(false);
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Gerar mensagem inicial quando chega na etapa 2
  useEffect(() => {
    if (!hasGeneratedInitial && data.name) {
      console.log('[Step2AIInteraction] Gerando mensagem inicial para etapa 2');
      generateMessage(data, memberType, 2);
      setHasGeneratedInitial(true);
    }
  }, [data.name, hasGeneratedInitial, generateMessage, memberType]);

  // Re-gerar quando dados empresariais importantes são preenchidos
  useEffect(() => {
    if (hasGeneratedInitial && (data.companyName || data.businessSector || data.position)) {
      console.log('[Step2AIInteraction] Dados empresariais detectados, re-gerando mensagem');
      const timer = setTimeout(() => {
        generateMessage(data, memberType, 2);
      }, 1000); // Debounce de 1 segundo

      return () => clearTimeout(timer);
    }
  }, [data.companyName, data.businessSector, data.position, hasGeneratedInitial, generateMessage, memberType]);

  // Efeito de digitação quando recebe nova mensagem
  useEffect(() => {
    if (generatedMessage && generatedMessage !== displayedMessage) {
      setTypingMessage(generatedMessage);
    }
  }, [generatedMessage]);

  const setTypingMessage = (message: string) => {
    setIsTyping(true);
    setDisplayedMessage('');
    
    let index = 0;
    const timer = setInterval(() => {
      if (index < message.length) {
        setDisplayedMessage(prev => prev + message[index]);
        index++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, 30); // Velocidade de digitação
  };

  const handleRegenerate = () => {
    clearMessage();
    generateMessage(data, memberType, 2);
  };

  if (isGenerating && !displayedMessage) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-r from-viverblue/10 to-viverblue-light/10 border border-viverblue/30 rounded-xl p-6">
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
            <p className="text-sm text-slate-400 text-center">
              Analisando seu perfil e criando insights personalizados...
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!displayedMessage && !isGenerating) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="bg-gradient-to-r from-viverblue/10 to-viverblue-light/10 border border-viverblue/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-viverblue/20 p-2 rounded-full">
              <Bot className="w-5 h-5 text-viverblue" />
            </div>
            <Sparkles className="w-4 h-4 text-viverblue" />
            <span className="text-sm font-semibold text-viverblue">IA VIVER DE IA</span>
          </div>
          
          <Button
            onClick={handleRegenerate}
            disabled={isGenerating}
            variant="ghost"
            size="sm"
            className="text-viverblue hover:bg-viverblue/10"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <div className="prose prose-slate max-w-none">
          {displayedMessage.split('\n\n').map((paragraph, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="leading-relaxed text-slate-100 mb-4 last:mb-0"
            >
              {paragraph}
              {isTyping && index === displayedMessage.split('\n\n').length - 1 && (
                <span className="inline-block w-2 h-5 bg-viverblue ml-1 animate-pulse" />
              )}
            </motion.p>
          ))}
        </div>
        
        {error && (
          <p className="text-red-400 text-sm mt-3">
            {error}
          </p>
        )}
      </div>
    </motion.div>
  );
};
