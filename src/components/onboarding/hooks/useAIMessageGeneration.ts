
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
        // Sanitização melhorada que preserva todos os caracteres válidos
        let cleanMessage = data.message;
        if (typeof cleanMessage === 'string') {
          cleanMessage = cleanMessage
            .trim()
            .replace(/\bundefined\b/gi, '')
            .replace(/\bnull\b/gi, '')
            .replace(/\[object Object\]/gi, '')
            .replace(/\s+/g, ' ')
            .replace(/\n\s*\n/g, '\n\n')
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
            .trim();
          
          if (cleanMessage.length < 10) {
            console.warn('[AIMessageGeneration] Mensagem muito pequena após sanitização, usando fallback');
            cleanMessage = getFallbackMessage(onboardingData, currentStep);
          }
          
          console.log('[AIMessageGeneration] Primeiro caractere:', cleanMessage.charAt(0));
          console.log('[AIMessageGeneration] Mensagem sanitizada (50 chars):', cleanMessage.substring(0, 50));
        }
        
        setGeneratedMessage(cleanMessage);
        console.log('[AIMessageGeneration] Mensagem definida com sucesso');
      } else {
        const fallbackMessage = data?.message || getFallbackMessage(onboardingData, currentStep);
        console.warn('[AIMessageGeneration] Usando mensagem de fallback:', data?.error);
        setGeneratedMessage(fallbackMessage);
      }

    } catch (err) {
      console.error('[AIMessageGeneration] Erro ao gerar mensagem:', err);
      handleError(err, 'AIMessageGeneration', { showToast: false });
      setError('Erro ao gerar mensagem personalizada');
      
      const fallbackMessage = getFallbackMessage(onboardingData, currentStep);
      setGeneratedMessage(fallbackMessage);
      console.log('[AIMessageGeneration] Fallback aplicado devido a erro');
    } finally {
      setIsGenerating(false);
      setProgress(100);
      
      setTimeout(() => setProgress(0), 1500);
    }
  }, [isGenerating, handleError]);

  const getFallbackMessage = (onboardingData: OnboardingData, currentStep?: number) => {
    if (currentStep === 2) {
      return `Olá ${onboardingData.name || 'Membro'}! Que bom ter você aqui na Viver de IA! Vi que você está em ${onboardingData.city || 'sua cidade'} e fico empolgado em ver mais um apaixonado por IA se juntando à nossa comunidade. ${onboardingData.curiosity ? `Adorei saber que ${onboardingData.curiosity.toLowerCase()}.` : ''} Agora vamos descobrir como podemos acelerar sua jornada empresarial com IA - vamos para seu perfil de negócios! 🚀`;
    }
    return `Parabéns ${onboardingData.name || 'Membro'}! Seu onboarding foi concluído com sucesso. Bem-vindo à comunidade Viver de IA - agora vamos transformar o futuro dos negócios juntos! 🚀`;
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
