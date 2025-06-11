
import { useState } from 'react';
import { OnboardingData } from '../types/onboardingTypes';

/**
 * Hook simplificado para geração de mensagens de IA no onboarding
 * Mantém compatibilidade com componentes existentes
 */
export const useAIMessageGeneration = () => {
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMessage = async (data: OnboardingData, memberType: 'club' | 'formacao') => {
    setIsGenerating(true);
    
    try {
      // Gerar mensagem personalizada baseada nos dados
      let message = '';
      
      if (data.name) {
        message = `Olá ${data.name}! Fico feliz em ver seu progresso no onboarding da Viver de IA. `;
        
        if (data.city) {
          message += `Vi que você está em ${data.city} e `;
        }
        
        message += `estou empolgado para ajudar você a descobrir como a IA pode transformar seu negócio. Vamos continuar sua jornada! 🚀`;
      } else {
        message = 'Continuando sua jornada na Viver de IA! Estamos aqui para ajudar você a descobrir como a inteligência artificial pode transformar seu negócio. Vamos para o próximo passo! 🚀';
      }
      
      setGeneratedMessage(message);
    } catch (error) {
      console.warn('Erro ao gerar mensagem, usando fallback:', error);
      setGeneratedMessage('Bem-vindo à Viver de IA! Vamos continuar sua jornada de transformação digital. 🚀');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetMessage = () => {
    setGeneratedMessage('');
    setIsGenerating(false);
  };

  return {
    generateMessage,
    isGenerating,
    generatedMessage,
    resetMessage
  };
};
