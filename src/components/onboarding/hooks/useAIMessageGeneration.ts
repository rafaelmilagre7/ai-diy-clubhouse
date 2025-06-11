
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { OnboardingData } from '../types/onboardingTypes';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export const useAIMessageGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const { handleError } = useErrorHandler();

  const generateMessage = useCallback(async (onboardingData: OnboardingData, memberType: 'club' | 'formacao', currentStep?: number) => {
    // Evitar gerar novamente se já está gerando ou se não tem dados mínimos
    if (isGenerating || !onboardingData.name) {
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProgress(0);
    setGeneratedMessage(null);
    
    try {
      console.log('[AIMessageGeneration] Iniciando geração de mensagem para:', onboardingData.name, 'Etapa:', currentStep);
      
      // Simular progresso para melhor UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const { data, error: functionError } = await supabase.functions.invoke('generate-onboarding-message', {
        body: {
          onboardingData,
          memberType,
          currentStep
        }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (functionError) {
        throw functionError;
      }

      if (data?.success && data?.message) {
        // Sanitizar e limpar a mensagem recebida
        let cleanMessage = data.message;
        if (typeof cleanMessage === 'string') {
          cleanMessage = cleanMessage
            .trim()
            .replace(/undefined/g, '')
            .replace(/null/g, '')
            .replace(/\s+/g, ' ')
            .replace(/\n\s*\n/g, '\n\n');
        }
        
        setGeneratedMessage(cleanMessage);
        console.log('[AIMessageGeneration] Mensagem gerada com sucesso');
      } else {
        // Usar mensagem de fallback se houve erro mas ainda retornou uma mensagem
        const fallbackMessage = data?.message || getFallbackMessage(onboardingData, currentStep);
        setGeneratedMessage(fallbackMessage);
        console.warn('[AIMessageGeneration] Usando mensagem de fallback:', data?.error);
      }

    } catch (err) {
      console.error('[AIMessageGeneration] Erro ao gerar mensagem:', err);
      handleError(err, 'AIMessageGeneration', { showToast: false });
      setError('Erro ao gerar mensagem personalizada');
      
      // Fallback local em caso de erro total
      const fallbackMessage = getFallbackMessage(onboardingData, currentStep);
      setGeneratedMessage(fallbackMessage);
    } finally {
      setIsGenerating(false);
      setProgress(100);
      
      // Reset progress após um delay
      setTimeout(() => setProgress(0), 1000);
    }
  }, [isGenerating, handleError]);

  const getFallbackMessage = (onboardingData: OnboardingData, currentStep?: number) => {
    if (currentStep === 2) {
      return `Olá ${onboardingData.name || 'Membro'}! Que incrível ter você aqui conosco! Vi que você está em ${onboardingData.city || 'sua cidade'} e isso me deixa empolgado com as possibilidades. ${onboardingData.curiosity ? `Adorei saber que ${onboardingData.curiosity.toLowerCase()}.` : ''} Agora vamos falar sobre seu negócio e como posso ajudar você a identificar as melhores oportunidades de IA! 🚀`;
    }
    return `Parabéns ${onboardingData.name || 'Membro'}! Seu onboarding foi concluído com sucesso. Vamos transformar o futuro com IA! 🚀`;
  };

  const clearMessage = useCallback(() => {
    setGeneratedMessage(null);
    setError(null);
    setProgress(0);
  }, []);

  return {
    generateMessage,
    clearMessage,
    isGenerating,
    generatedMessage,
    error,
    progress
  };
};
