
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, RefreshCw, Zap } from 'lucide-react';
import { OnboardingData } from '../types/onboardingTypes';
import { useAIMessageGeneration } from '../hooks/useAIMessageGeneration';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Step2AIInteractionProps {
  data: OnboardingData;
  memberType: 'club' | 'formacao';
}

export const Step2AIInteraction: React.FC<Step2AIInteractionProps> = ({
  data,
  memberType
}) => {
  const { generateMessage, isGenerating, generatedMessage, error, clearMessage, progress } = useAIMessageGeneration();
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasInitialGeneration, setHasInitialGeneration] = useState(false);
  const [showThinkingDots, setShowThinkingDots] = useState(false);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const thinkingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Gerar mensagem inicial quando chega na etapa 2
  useEffect(() => {
    if (!hasInitialGeneration && data.name && data.city) {
      console.log('[Step2AIInteraction] Gerando mensagem inicial para etapa 2');
      generateMessage(data, memberType, 2);
      setHasInitialGeneration(true);
    }
  }, [data.name, data.city, hasInitialGeneration, generateMessage, memberType]);

  // Efeito de digitação quando recebe nova mensagem
  useEffect(() => {
    if (generatedMessage && generatedMessage !== displayedMessage) {
      startTypingEffect(generatedMessage);
    }
  }, [generatedMessage, displayedMessage]);

  // Animação de "pensando" durante geração
  useEffect(() => {
    if (isGenerating) {
      setShowThinkingDots(true);
      let dotCount = 0;
      thinkingIntervalRef.current = setInterval(() => {
        dotCount = (dotCount + 1) % 4;
        setShowThinkingDots(true);
      }, 500);
    } else {
      setShowThinkingDots(false);
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current);
      }
    }

    return () => {
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current);
      }
    };
  }, [isGenerating]);

  const startTypingEffect = (message: string) => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    
    setIsTyping(true);
    setDisplayedMessage('');
    
    let index = 0;
    typingIntervalRef.current = setInterval(() => {
      if (index < message.length) {
        setDisplayedMessage(prev => prev + message[index]);
        index++;
      } else {
        clearInterval(typingIntervalRef.current!);
        setIsTyping(false);
      }
    }, 20); // Digitação mais rápida
  };

  const handleRegenerate = () => {
    clearMessage();
    setDisplayedMessage('');
    setIsTyping(false);
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    generateMessage(data, memberType, 2);
  };

  // Cleanup dos intervals
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current);
      }
    };
  }, []);

  // Estado de loading melhorado durante geração inicial
  if (isGenerating && !displayedMessage) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="bg-gradient-to-r from-viverblue/10 to-viverblue-light/10 border border-viverblue/30 rounded-xl p-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-viverblue/20 p-2 rounded-full">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Bot className="w-5 h-5 text-viverblue" />
              </motion.div>
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4 text-viverblue" />
            </motion.div>
            <span className="text-sm font-semibold text-viverblue">IA VIVER DE IA</span>
          </div>
          
          {/* Barra de progresso */}
          <div className="mb-4">
            <Progress 
              value={progress} 
              className="h-2 bg-slate-700"
              indicatorClassName="bg-gradient-to-r from-viverblue to-viverblue-light transition-all duration-300"
            />
          </div>
          
          {/* Skeleton animado mais realista */}
          <div className="space-y-3">
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {[100, 85, 70, 45].map((width, index) => (
                <motion.div
                  key={index}
                  className="h-4 bg-viverblue/20 rounded"
                  style={{ width: `${width}%` }}
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    delay: index * 0.2 
                  }}
                />
              ))}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-2 mt-4"
            >
              <Zap className="w-4 h-4 text-viverblue animate-pulse" />
              <p className="text-sm text-slate-300 text-center">
                Analisando seu perfil e criando mensagem personalizada
                {showThinkingDots && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    ...
                  </motion.span>
                )}
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Não renderizar se não tem mensagem
  if (!displayedMessage && !isGenerating) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-6"
      >
        <div className="bg-gradient-to-r from-viverblue/10 to-viverblue-light/10 border border-viverblue/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-viverblue/20 p-2 rounded-full">
                <Bot className="w-5 h-5 text-viverblue" />
              </div>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-viverblue" />
              </motion.div>
              <span className="text-sm font-semibold text-viverblue">IA VIVER DE IA</span>
            </div>
            
            <Button
              onClick={handleRegenerate}
              disabled={isGenerating}
              variant="ghost"
              size="sm"
              className="text-viverblue hover:bg-viverblue/10 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          <div className="prose prose-slate max-w-none">
            <motion.p
              className="leading-relaxed text-slate-100 mb-0 text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {displayedMessage}
              {isTyping && (
                <motion.span 
                  className="inline-block w-2 h-5 bg-viverblue ml-1 rounded-sm"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
            </motion.p>
          </div>
          
          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm mt-3"
            >
              {error}
            </motion.p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
