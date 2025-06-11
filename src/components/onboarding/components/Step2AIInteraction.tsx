
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { TypingEffect } from './TypingEffect';
import { OnboardingData } from '../types/onboardingTypes';
import { supabase } from '@/lib/supabase';

interface Step2AIInteractionProps {
  data: OnboardingData;
  memberType: 'club' | 'formacao';
}

export const Step2AIInteraction: React.FC<Step2AIInteractionProps> = ({
  data,
  memberType
}) => {
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Gerar mensagem automaticamente quando o componente monta
  useEffect(() => {
    const generateMessage = async () => {
      // Se não tem nome, usar fallback estático imediatamente
      if (!data.name) {
        setMessage('Bem-vindo à Viver de IA! Estamos empolgados em ter você aqui na nossa comunidade. Agora vamos descobrir mais sobre seu perfil empresarial para personalizar sua experiência na plataforma. Vamos começar! 🚀');
        return;
      }

      setIsLoading(true);
      
      try {
        const { data: response, error } = await supabase.functions.invoke('generate-onboarding-message', {
          body: {
            onboardingData: data,
            memberType,
            currentStep: 2
          }
        });

        if (error) throw error;

        if (response?.success && response?.message) {
          setMessage(response.message);
        } else {
          throw new Error('Resposta inválida da API');
        }
      } catch (error) {
        console.warn('[Step2AI] Erro ao gerar mensagem, usando fallback:', error);
        
        // Fallback personalizado com dados do usuário
        const fallbackMessage = `Olá ${data.name}! Que bom ter você aqui na Viver de IA! ${data.city ? `Vi que você está em ${data.city}` : ''} e fico empolgado em ver mais um apaixonado por IA se juntando à nossa comunidade. ${data.curiosity ? `Adorei saber que ${data.curiosity.toLowerCase()}.` : ''} Agora vamos descobrir como podemos acelerar sua jornada empresarial com IA - vamos para seu perfil de negócios! 🚀`;
        
        setMessage(fallbackMessage);
      } finally {
        setIsLoading(false);
      }
    };

    generateMessage();
  }, []); // Executar apenas uma vez quando o componente montar

  return (
    <Card className="p-6 bg-gradient-to-r from-viverblue/10 to-purple-600/10 border-viverblue/20 mb-6">
      <div className="flex items-start space-x-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-12 h-12 bg-viverblue/20 rounded-full flex items-center justify-center flex-shrink-0"
        >
          <Bot className="w-6 h-6 text-viverblue" />
        </motion.div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-3">
            Assistente Viver de IA
          </h3>
          
          <div className="text-slate-300 leading-relaxed">
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-viverblue"></div>
                <span>Gerando mensagem personalizada...</span>
              </div>
            ) : message ? (
              <TypingEffect 
                text={message}
                speed={20}
                startDelay={300}
              />
            ) : (
              <span>Preparando sua mensagem personalizada...</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
