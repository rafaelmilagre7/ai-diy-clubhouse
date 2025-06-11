
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { OnboardingData } from '../types/onboardingTypes';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export const useAIMessageGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useErrorHandler();

  const generateMessage = useCallback(async (onboardingData: OnboardingData, memberType: 'club' | 'formacao', currentStep?: number) => {
    // Evitar gerar novamente se já está gerando ou se não tem dados mínimos
    if (isGenerating || !onboardingData.name) {
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      console.log('[AIMessageGeneration] Iniciando geração de mensagem para:', onboardingData.name, 'Etapa:', currentStep);
      
      const { data, error: functionError } = await supabase.functions.invoke('generate-onboarding-message', {
        body: {
          onboardingData,
          memberType,
          currentStep
        }
      });

      if (functionError) {
        throw functionError;
      }

      if (data?.success) {
        setGeneratedMessage(data.message);
        console.log('[AIMessageGeneration] Mensagem gerada com sucesso');
      } else {
        // Usar mensagem de fallback se houve erro mas ainda retornou uma mensagem
        setGeneratedMessage(data.message);
        console.warn('[AIMessageGeneration] Usando mensagem de fallback:', data.error);
      }

    } catch (err) {
      console.error('[AIMessageGeneration] Erro ao gerar mensagem:', err);
      handleError(err, 'AIMessageGeneration', { showToast: false });
      setError('Erro ao gerar mensagem personalizada');
      
      // Fallback local em caso de erro total
      const fallbackMessage = currentStep === 2 
        ? `Olá ${onboardingData.name || 'Membro'}! 

Que incrível ter você aqui conosco! Vi que você está em ${onboardingData.city || 'sua cidade'} e isso me deixa empolgado com as possibilidades. ${onboardingData.curiosity ? `Adorei saber que ${onboardingData.curiosity.toLowerCase()}.` : ''} Agora vamos falar sobre seu negócio e como posso ajudar você a identificar as melhores oportunidades de IA! 🚀`
        : `Parabéns ${onboardingData.name || 'Membro'}! Seu onboarding foi concluído com sucesso. Vamos transformar o futuro com IA! 🚀`;
      
      setGeneratedMessage(fallbackMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, handleError]);

  const clearMessage = useCallback(() => {
    setGeneratedMessage(null);
    setError(null);
  }, []);

  return {
    generateMessage,
    clearMessage,
    isGenerating,
    generatedMessage,
    error
  };
};
