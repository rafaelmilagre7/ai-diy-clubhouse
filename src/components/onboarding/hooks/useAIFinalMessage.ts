
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { OnboardingData } from '../types/onboardingTypes';

interface AIFinalMessageResult {
  message: string;
  isLoading: boolean;
  error: string | null;
}

export const useAIFinalMessage = (data: OnboardingData): AIFinalMessageResult => {
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateFinalMessage = async () => {
      if (!data.name) {
        setMessage('Parabéns! Seu onboarding foi concluído com sucesso. Bem-vindo à comunidade Viver de IA! 🚀');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const { data: result, error: functionError } = await supabase.functions.invoke('generate-onboarding-message', {
          body: {
            onboardingData: data,
            memberType: data.memberType || 'club',
            currentStep: 'final'
          }
        });

        if (functionError) {
          throw new Error(functionError.message);
        }

        if (result?.message) {
          setMessage(result.message);
        } else {
          throw new Error('Resposta inválida da IA');
        }
      } catch (err) {
        console.error('Erro ao gerar mensagem final:', err);
        setError('Erro ao gerar mensagem personalizada');
        
        // Fallback para mensagem personalizada básica
        const fallbackMessage = `Parabéns ${data.name}! Seu onboarding foi concluído com sucesso. ${data.companyName ? `Estamos empolgados para ajudar a ${data.companyName} ` : 'Estamos empolgados para ajudar você '}a transformar ${data.areaToImpact || 'seu negócio'} com inteligência artificial. ${data.mainObjective ? `Vamos juntos alcançar seu objetivo de ${data.mainObjective.replace('-', ' ')}.` : ''} Bem-vindo à comunidade Viver de IA! 🚀`;
        
        setMessage(fallbackMessage);
      } finally {
        setIsLoading(false);
      }
    };

    generateFinalMessage();
  }, [data]);

  return { message, isLoading, error };
};
