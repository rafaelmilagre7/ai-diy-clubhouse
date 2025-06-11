
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { TypingEffect } from './TypingEffect';

interface Step2AIInteractionProps {
  message?: string;
  isLoading?: boolean;
  onGenerateMessage?: () => void;
}

export const Step2AIInteraction: React.FC<Step2AIInteractionProps> = ({
  message,
  isLoading = false,
  onGenerateMessage
}) => {
  // Tentar gerar mensagem quando o componente monta
  useEffect(() => {
    if (!message && !isLoading && onGenerateMessage) {
      console.log('[Step2AI] Solicitando geração de mensagem');
      onGenerateMessage();
    }
  }, [message, isLoading, onGenerateMessage]);

  console.log('[Step2AI] Renderizando com:', {
    hasMessage: !!message,
    isLoading,
    messageLength: message?.length || 0
  });

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
