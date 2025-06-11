
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { OnboardingData } from '../types/onboardingTypes';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export const useAIMessageGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useErrorHandler();

  const generateMessage = async (onboardingData: OnboardingData, memberType: 'club' | 'formacao', currentStep?: number) => {
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

Que bom ter você aqui conosco! Vi que você está em ${onboardingData.city || 'sua cidade'} e isso me deixa empolgado - há muitas oportunidades incríveis de IA surgindo em todo o Brasil.

Agora vamos falar sobre seu negócio. Conte-me mais sobre sua empresa e como posso ajudar você a identificar as melhores oportunidades de transformação digital para seu setor! 🚀`
        : `Parabéns ${onboardingData.name || 'Membro'}! 

Ficamos muito felizes em tê-lo conosco nesta jornada de transformação digital. Seu onboarding foi concluído com sucesso e agora você tem acesso completo a todas as nossas soluções e recursos.

Com base no seu perfil, acreditamos que você está pronto para começar a implementar soluções de IA que farão a diferença no seu negócio.

Vamos juntos transformar o futuro com IA! 🚀`;
      
      setGeneratedMessage(fallbackMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearMessage = () => {
    setGeneratedMessage(null);
    setError(null);
  };

  return {
    generateMessage,
    clearMessage,
    isGenerating,
    generatedMessage,
    error
  };
};
