
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useAIMessageGeneration } from '../hooks/useAIMessageGeneration';
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
    clearMessage
  } = useAIMessageGeneration();

  const [messageKey, setMessageKey] = useState(0);
  const [hasRequestedGeneration, setHasRequestedGeneration] = useState(false);
  
  // Usar refs para detectar mudanças reais nos dados
  const previousDataRef = useRef<{ name?: string; city?: string }>({});

  // Verificar se temos dados suficientes
  const hasMinimumData = useMemo(() => {
    const hasData = !!(data.name && data.city);
    console.log('[Step2AIInteraction] Verificando dados mínimos:', { 
      name: data.name, 
      city: data.city, 
      hasData 
    });
    return hasData;
  }, [data.name, data.city]);

  // Detectar se os dados importantes mudaram realmente
  const dataChanged = useMemo(() => {
    const current = { name: data.name, city: data.city };
    const previous = previousDataRef.current;
    const changed = current.name !== previous.name || current.city !== previous.city;
    
    console.log('[Step2AIInteraction] Verificando mudança de dados:', {
      current,
      previous,
      changed
    });
    
    return changed;
  }, [data.name, data.city]);

  // Gerar mensagem uma única vez quando houver dados suficientes
  useEffect(() => {
    if (hasMinimumData && !hasRequestedGeneration && !isGenerating && !generatedMessage && !error) {
      console.log('[Step2AIInteraction] Solicitando geração de mensagem para:', data.name);
      setHasRequestedGeneration(true);
      generateMessage(data, memberType, 2);
    }
  }, [hasMinimumData, hasRequestedGeneration, isGenerating, generatedMessage, error]);

  // Reset apenas quando dados importantes mudarem de fato
  useEffect(() => {
    if (dataChanged && hasMinimumData) {
      console.log('[Step2AIInteraction] Dados importantes mudaram, resetando estado');
      
      // Atualizar ref com novos dados
      previousDataRef.current = { name: data.name, city: data.city };
      
      // Reset do estado
      setHasRequestedGeneration(false);
      setMessageKey(prev => prev + 1);
      clearMessage();
    }
  }, [dataChanged, hasMinimumData, clearMessage, data.name, data.city]);

  const handleTypingComplete = () => {
    console.log('[Step2AIInteraction] Digitação completada');
  };

  // Debug: mostrar estado atual
  console.log('[Step2AIInteraction] Estado atual:', {
    hasMinimumData,
    hasRequestedGeneration,
    isGenerating,
    hasGeneratedMessage: !!generatedMessage,
    hasError: !!error,
    messageKey
  });

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
  if (generatedMessage && !isGenerating) {
    return (
      <motion.div
        key={`message-${messageKey}`}
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
              key={`typing-${messageKey}-${generatedMessage.length}`}
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

  // Mostrar estado de aguardo se temos dados mas ainda não solicitamos geração
  if (hasMinimumData && !hasRequestedGeneration) {
    console.log('[Step2AIInteraction] Dados disponíveis, aguardando solicitação de geração');
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-viverblue/5 to-viverblue-light/5 border border-viverblue/20 rounded-xl p-6 mb-6"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="bg-viverblue/10 p-2 rounded-full">
            <Bot className="w-5 h-5 text-viverblue/70" />
          </div>
          <span className="text-sm font-semibold text-viverblue/70">IA VIVER DE IA</span>
        </div>
        
        <div className="prose prose-slate max-w-none">
          <p className="leading-relaxed text-slate-300 text-center">
            Preparando sua mensagem personalizada...
          </p>
        </div>
      </motion.div>
    );
  }

  // Não mostrar nada se não houver dados suficientes
  console.log('[Step2AIInteraction] Dados insuficientes para exibir mensagem');
  return null;
};
