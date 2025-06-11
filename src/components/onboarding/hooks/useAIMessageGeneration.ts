
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { OnboardingData } from '../types/onboardingTypes';

export const useAIMessageGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateMessage = useCallback(async (
    onboardingData: OnboardingData, 
    memberType: 'club' | 'formacao', 
    currentStep?: number
  ) => {
    if (!onboardingData.name) {
      console.log('[AIMessageGeneration] Nome não fornecido, pulando geração');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedMessage(null);
    
    try {
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

      if (data?.success && data?.message) {
        const cleanMessage = data.message.trim();
        setGeneratedMessage(cleanMessage);
        console.log('[AIMessageGeneration] Mensagem gerada com sucesso');
      } else {
        throw new Error('Resposta inválida da API');
      }

    } catch (err) {
      console.error('[AIMessageGeneration] Erro ao gerar mensagem:', err);
      setError('Erro ao gerar mensagem personalizada');
      
      // Fallback message
      const fallbackMessage = getFallbackMessage(onboardingData, currentStep);
      setGeneratedMessage(fallbackMessage);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const getFallbackMessage = (onboardingData: OnboardingData, currentStep?: number) => {
    if (currentStep === 2) {
      return `Olá ${onboardingData.name || 'Membro'}! Que bom ter você aqui na Viver de IA! ${onboardingData.city ? `Vi que você está em ${onboardingData.city}` : ''} e fico empolgado em ver mais um apaixonado por IA se juntando à nossa comunidade. ${onboardingData.curiosity ? `Adorei saber que ${onboardingData.curiosity.toLowerCase()}.` : ''} Agora vamos descobrir como podemos acelerar sua jornada empresarial com IA! 🚀`;
    }
    return `Parabéns ${onboardingData.name || 'Membro'}! Seu onboarding foi concluído com sucesso. Bem-vindo à comunidade Viver de IA! 🚀`;
  };

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
