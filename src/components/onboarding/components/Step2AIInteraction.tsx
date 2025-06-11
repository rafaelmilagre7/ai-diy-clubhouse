
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, RefreshCw, Zap, MessageSquare } from 'lucide-react';
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
  const [shouldRender, setShouldRender] = useState(false);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const thinkingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Verificar se deve renderizar o componente
  useEffect(() => {
    const canRender = data.name && data.city && data.curiosity;
    console.log('[Step2AIInteraction] Verificando renderização:', { 
      name: data.name, 
      city: data.city, 
      curiosity: data.curiosity,
      canRender 
    });
    setShouldRender(!!canRender);
  }, [data.name, data.city, data.curiosity]);

  // Gerar mensagem inicial quando chega na etapa 2
  useEffect(() => {
    if (shouldRender && !hasInitialGeneration && !isGenerating && !generatedMessage) {
      console.log('[Step2AIInteraction] Iniciando geração automática da mensagem');
      generateMessage(data, memberType, 2);
      setHasInitialGeneration(true);
    }
  }, [shouldRender, hasInitialGeneration, isGenerating, generatedMessage, generateMessage, data, memberType]);

  // Efeito de digitação quando recebe nova mensagem
  useEffect(() => {
    if (generatedMessage && generatedMessage !== displayedMessage && !isTyping) {
      console.log('[Step2AIInteraction] Iniciando efeito de digitação');
      startTypingEffect(generatedMessage);
    }
  }, [generatedMessage, displayedMessage, isTyping]);

  // Animação de "pensando" durante geração
  useEffect(() => {
    if (isGenerating) {
      setShowThinkingDots(true);
      let dotCount = 0;
      thinkingIntervalRef.current = setInterval(() => {
        dotCount = (dotCount + 1) % 4;
        setShowThinkingDots(true);
      }, 600);
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
    }, 25); // Velocidade de digitação otimizada
  };

  const handleRegenerate = () => {
    console.log('[Step2AIInteraction] Regenerando mensagem');
    clearMessage();
    setDisplayedMessage('');
    setIsTyping(false);
    setHasInitialGeneration(false);
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    // Pequeno delay para melhor UX
    setTimeout(() => {
      generateMessage(data, memberType, 2);
      setHasInitialGeneration(true);
    }, 500);
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

  // Não renderizar se não atende aos critérios mínimos
  if (!shouldRender) {
    console.log('[Step2AIInteraction] Não renderizando - critérios não atendidos');
    return null;
  }

  // Estado de loading melhorado durante geração inicial
  if (isGenerating && !displayedMessage) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="bg-gradient-to-r from-viverblue/10 to-viverblue-light/10 border border-viverblue/30 rounded-xl p-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="bg-viverblue/20 p-3 rounded-full">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Bot className="w-6 h-6 text-viverblue" />
              </motion.div>
            </div>
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            >
              <Sparkles className="w-5 h-5 text-viverblue" />
            </motion.div>
            <span className="text-base font-semibold text-viverblue">IA VIVER DE IA</span>
          </div>
          
          {/* Barra de progresso melhorada */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-slate-300 mb-2">
              <span>Analisando seu perfil</span>
              <span>{progress}%</span>
            </div>
            <Progress 
              value={progress} 
              className="h-2 bg-slate-700"
              indicatorClassName="bg-gradient-to-r from-viverblue to-viverblue-light transition-all duration-500"
            />
          </div>
          
          {/* Skeleton animado mais realista */}
          <div className="space-y-4">
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {[95, 80, 65, 40].map((width, index) => (
                <motion.div
                  key={index}
                  className="h-4 bg-viverblue/20 rounded-md"
                  style={{ width: `${width}%` }}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    delay: index * 0.3 
                  }}
                />
              ))}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-3 mt-6"
            >
              <motion.div
                animate={{ rotate: [0, 180, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Zap className="w-5 h-5 text-viverblue" />
              </motion.div>
              <p className="text-sm text-slate-200 text-center">
                Criando mensagem personalizada especialmente para você
                {showThinkingDots && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
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

  // Não renderizar se não tem mensagem para exibir
  if (!displayedMessage && !isGenerating) {
    console.log('[Step2AIInteraction] Não renderizando - sem mensagem');
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-viverblue/20 p-3 rounded-full">
                <MessageSquare className="w-5 h-5 text-viverblue" />
              </div>
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="w-5 h-5 text-viverblue" />
              </motion.div>
              <span className="text-base font-semibold text-viverblue">IA VIVER DE IA</span>
            </div>
            
            <Button
              onClick={handleRegenerate}
              disabled={isGenerating}
              variant="ghost"
              size="sm"
              className="text-viverblue hover:bg-viverblue/10 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span className="ml-2 hidden sm:inline">Regenerar</span>
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
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.p>
          </div>
          
          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm mt-4 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg"
            >
              ⚠️ {error}
            </motion.p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
