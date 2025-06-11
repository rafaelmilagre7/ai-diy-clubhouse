
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
      console.log('[AIMessageGeneration] Não é possível gerar - faltam dados ou já está gerando');
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
        setProgress(prev => {
          const next = Math.min(prev + 15, 85);
          return next;
        });
      }, 300);

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
        console.error('[AIMessageGeneration] Erro da função:', functionError);
        throw functionError;
      }

      console.log('[AIMessageGeneration] Dados recebidos:', data);

      if (data?.success && data?.message) {
        // Sanitização mais robusta da mensagem recebida
        let cleanMessage = data.message;
        if (typeof cleanMessage === 'string') {
          cleanMessage = cleanMessage
            .trim()
            // Remove undefined, null e outros valores inválidos
            .replace(/undefined/gi, '')
            .replace(/null/gi, '')
            .replace(/\[object Object\]/gi, '')
            // Remove espaços extras e quebras de linha desnecessárias
            .replace(/\s+/g, ' ')
            .replace(/\n\s*\n/g, '\n\n')
            // Remove caracteres de controle
            .replace(/[\x00-\x1F\x7F]/g, '')
            // Remove espaços no início e fim
            .trim();
          
          // Validação adicional - se a mensagem ficou muito pequena, usar fallback
          if (cleanMessage.length < 20) {
            console.warn('[AIMessageGeneration] Mensagem muito pequena após sanitização, usando fallback');
            cleanMessage = getFallbackMessage(onboardingData, currentStep);
          }
        }
        
        setGeneratedMessage(cleanMessage);
        console.log('[AIMessageGeneration] Mensagem sanitizada e definida:', cleanMessage.substring(0, 100) + '...');
      } else {
        // Usar mensagem de fallback se houve erro mas ainda retornou uma mensagem
        const fallbackMessage = data?.message || getFallbackMessage(onboardingData, currentStep);
        console.warn('[AIMessageGeneration] Usando mensagem de fallback:', data?.error);
        setGeneratedMessage(fallbackMessage);
      }

    } catch (err) {
      console.error('[AIMessageGeneration] Erro ao gerar mensagem:', err);
      handleError(err, 'AIMessageGeneration', { showToast: false });
      setError('Erro ao gerar mensagem personalizada');
      
      // Fallback local em caso de erro total
      const fallbackMessage = getFallbackMessage(onboardingData, currentStep);
      setGeneratedMessage(fallbackMessage);
      console.log('[AIMessageGeneration] Fallback aplicado devido a erro');
    } finally {
      setIsGenerating(false);
      setProgress(100);
      
      // Reset progress após um delay
      setTimeout(() => setProgress(0), 1500);
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
