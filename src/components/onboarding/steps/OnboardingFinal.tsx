
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { OnboardingData } from '../types/onboardingTypes';
import { useAIFinalMessage } from '../hooks/useAIFinalMessage';

interface OnboardingFinalProps {
  data: OnboardingData;
  onComplete: () => Promise<void>;
  isCompleting: boolean;
  memberType: 'club' | 'formacao';
}

export const OnboardingFinal: React.FC<OnboardingFinalProps> = ({
  data,
  onComplete,
  isCompleting,
  memberType
}) => {
  const { message: aiMessage, isLoading: isGeneratingMessage, error: messageError } = useAIFinalMessage(data);

  const handleComplete = async () => {
    try {
      await onComplete();
    } catch (error) {
      console.error('[OnboardingFinal] Erro ao completar:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="w-20 h-20 mx-auto bg-viverblue/20 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-viverblue" />
        </div>
        
        <h1 className="text-3xl font-bold text-white">
          Onboarding Concluído! 🎉
        </h1>
        
        <p className="text-xl text-slate-300">
          Bem-vindo(a) à transformação digital do seu negócio
        </p>
      </motion.div>

      {/* Mensagem Personalizada de IA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-viverblue/10 to-viverblue-light/10 border border-viverblue/30 rounded-xl p-6"
      >
        {isGeneratingMessage ? (
          <div className="flex items-center justify-center space-x-3 py-4">
            <Loader2 className="w-5 h-5 animate-spin text-viverblue" />
            <p className="text-slate-300">Gerando sua mensagem personalizada...</p>
          </div>
        ) : messageError ? (
          <div className="prose prose-slate max-w-none">
            <p className="leading-relaxed text-slate-100 text-lg text-center">
              {data.name 
                ? `Parabéns ${data.name}! Seu onboarding foi concluído com sucesso. Agora você está pronto(a) para explorar todas as funcionalidades da Viver de IA e começar sua jornada de transformação digital. Seja bem-vindo(a) à nossa comunidade! 🚀`
                : `Parabéns! Seu onboarding foi concluído com sucesso. Agora você está pronto(a) para explorar todas as funcionalidades da Viver de IA e começar sua jornada de transformação digital. Seja bem-vindo(a) à nossa comunidade! 🚀`
              }
            </p>
          </div>
        ) : (
          <div className="prose prose-slate max-w-none">
            <p className="leading-relaxed text-slate-100 text-lg text-center whitespace-pre-line">
              {aiMessage}
            </p>
          </div>
        )}
      </motion.div>

      {/* Próximos Passos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-[#1A1E2E] rounded-xl p-6 border border-white/10"
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-viverblue" />
          <h3 className="text-lg font-semibold text-white">Seus próximos passos</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-viverblue/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-viverblue font-semibold text-sm">1</span>
              </div>
              <div>
                <h4 className="font-medium text-white mb-1">Explore o Dashboard</h4>
                <p className="text-sm text-slate-400">
                  Acesse suas soluções personalizadas e trilha de implementação
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-viverblue/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-viverblue font-semibold text-sm">2</span>
              </div>
              <div>
                <h4 className="font-medium text-white mb-1">Comece sua primeira solução</h4>
                <p className="text-sm text-slate-400">
                  Implemente sua primeira solução de IA baseada no seu perfil
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-viverblue/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-viverblue font-semibold text-sm">3</span>
              </div>
              <div>
                <h4 className="font-medium text-white mb-1">Conecte-se à comunidade</h4>
                <p className="text-sm text-slate-400">
                  Participe das discussões e aprenda com outros membros
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-viverblue/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-viverblue font-semibold text-sm">4</span>
              </div>
              <div>
                <h4 className="font-medium text-white mb-1">Acompanhe seu progresso</h4>
                <p className="text-sm text-slate-400">
                  Monitore suas implementações e conquistas
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Botão de Finalização */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="text-center"
      >
        <Button
          onClick={handleComplete}
          disabled={isCompleting || isGeneratingMessage}
          size="lg"
          className="bg-viverblue hover:bg-viverblue/80 text-white px-8 py-4 text-lg gap-3"
        >
          {isCompleting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Finalizando...
            </>
          ) : (
            <>
              Acessar Dashboard
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>
        
        <p className="text-sm text-slate-400 mt-3">
          Você será redirecionado para o dashboard em instantes
        </p>
      </motion.div>
    </div>
  );
};
