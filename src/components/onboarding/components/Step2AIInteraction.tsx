
import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TypingEffect } from './TypingEffect';
import { useAIMessageGeneration } from '../hooks/useAIMessageGeneration';
import { OnboardingData } from '../types/onboardingTypes';

interface Step2AIInteractionProps {
  data: OnboardingData;
  memberType: 'club' | 'formacao';
}

export const Step2AIInteraction: React.FC<Step2AIInteractionProps> = ({ 
  data, 
  memberType 
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  
  const { 
    generateMessage, 
    clearMessage, 
    isGenerating, 
    generatedMessage, 
    error, 
    progress 
  } = useAIMessageGeneration();

  // Log detalhado dos dados recebidos
  console.log('[Step2AIInteraction] Props recebidas:', {
    hasData: !!data,
    dataKeys: Object.keys(data || {}),
    name: data?.name,
    city: data?.city,
    state: data?.state,
    phone: data?.phone,
    email: data?.email,
    curiosity: data?.curiosity,
    memberType
  });

  // Log do estado do hook
  console.log('[Step2AIInteraction] Estado do hook:', {
    isGenerating,
    hasGeneratedMessage: !!generatedMessage,
    messageLength: generatedMessage?.length || 0,
    error,
    progress,
    isInitialized,
    showMessage
  });

  // Verificar se temos dados mínimos necessários
  const hasMinimumData = data?.name && (data?.city || data?.state);
  
  console.log('[Step2AIInteraction] Verificação de dados:', {
    hasMinimumData,
    hasName: !!data?.name,
    hasCity: !!data?.city,
    hasState: !!data?.state,
    namValue: data?.name,
    cityValue: data?.city,
    stateValue: data?.state
  });

  // Gerar mensagem automaticamente quando componente carrega
  useEffect(() => {
    console.log('[Step2AIInteraction] useEffect - Verificando se deve gerar mensagem');
    
    if (!isInitialized && hasMinimumData && !isGenerating && !generatedMessage) {
      console.log('[Step2AIInteraction] Iniciando geração automática da mensagem');
      setIsInitialized(true);
      generateMessage(data, memberType, 2);
    } else {
      console.log('[Step2AIInteraction] Não vai gerar mensagem:', {
        isInitialized,
        hasMinimumData,
        isGenerating,
        hasGeneratedMessage: !!generatedMessage
      });
    }
  }, [data, memberType, isInitialized, hasMinimumData, isGenerating, generatedMessage, generateMessage]);

  // Mostrar mensagem quando ela estiver pronta
  useEffect(() => {
    if (generatedMessage && !isGenerating && !showMessage) {
      console.log('[Step2AIInteraction] Mensagem pronta, vai mostrar');
      setShowMessage(true);
    }
  }, [generatedMessage, isGenerating, showMessage]);

  const handleRegenerateMessage = useCallback(() => {
    console.log('[Step2AIInteraction] Regenerando mensagem');
    setShowMessage(false);
    clearMessage();
    generateMessage(data, memberType, 2);
  }, [data, memberType, clearMessage, generateMessage]);

  // Se não temos dados mínimos, mostrar fallback
  if (!hasMinimumData) {
    console.log('[Step2AIInteraction] Renderizando fallback por falta de dados');
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Card className="p-6 bg-gradient-to-r from-viverblue/10 to-purple-500/10 border-viverblue/20">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-viverblue/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-viverblue" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                Bem-vindo à Viver de IA! 🚀
              </h3>
              <div className="text-slate-300 leading-relaxed">
                Que bom ter você aqui! Vamos descobrir como podemos acelerar sua jornada empresarial com IA. 
                Agora vamos para seu perfil de negócios!
              </div>
              
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-amber-200 text-sm">
                  💡 Complete seus dados na etapa anterior para receber uma mensagem personalizada
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Se está carregando
  if (isGenerating) {
    console.log('[Step2AIInteraction] Renderizando estado de carregamento');
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Card className="p-6 bg-gradient-to-r from-viverblue/10 to-purple-500/10 border-viverblue/20">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-viverblue/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-viverblue animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                Criando sua mensagem personalizada...
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-viverblue"></div>
                  <span>Analisando seu perfil...</span>
                </div>
                {progress > 0 && (
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-viverblue h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Se tem erro
  if (error) {
    console.log('[Step2AIInteraction] Renderizando estado de erro');
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Card className="p-6 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/20">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                Ops! Algo deu errado
              </h3>
              <p className="text-slate-300 mb-4">
                Não conseguimos gerar sua mensagem personalizada, mas você pode continuar com o onboarding.
              </p>
              <Button
                onClick={handleRegenerateMessage}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Tentar novamente
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Se tem mensagem para mostrar
  if (generatedMessage && showMessage) {
    console.log('[Step2AIInteraction] Renderizando mensagem gerada');
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Card className="p-6 bg-gradient-to-r from-viverblue/10 to-purple-500/10 border-viverblue/20">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-viverblue/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-viverblue" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                Mensagem personalizada para você ✨
              </h3>
              <div className="text-slate-300 leading-relaxed">
                <TypingEffect
                  text={generatedMessage}
                  speed={30}
                  startDelay={500}
                />
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={handleRegenerateMessage}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Nova mensagem
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Estado de debug - mostrar o que está acontecendo
  console.log('[Step2AIInteraction] Renderizando estado de debug/fallback');
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="p-6 bg-gradient-to-r from-viverblue/10 to-purple-500/10 border-viverblue/20">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-viverblue/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-viverblue" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              Preparando sua experiência...
            </h3>
            <div className="text-slate-300 leading-relaxed mb-4">
              Olá {data?.name || 'Membro'}! Vamos descobrir como podemos acelerar sua jornada empresarial com IA.
            </div>
            
            <div className="mt-4 p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-xs">
              <p className="text-slate-400 mb-2">Debug info:</p>
              <ul className="text-slate-500 space-y-1">
                <li>• Dados: {hasMinimumData ? '✅ OK' : '❌ Incompletos'}</li>
                <li>• Mensagem: {generatedMessage ? '✅ Gerada' : '❌ Não gerada'}</li>
                <li>• Carregando: {isGenerating ? '✅ Sim' : '❌ Não'}</li>
                <li>• Mostrar: {showMessage ? '✅ Sim' : '❌ Não'}</li>
                <li>• Inicializado: {isInitialized ? '✅ Sim' : '❌ Não'}</li>
              </ul>
            </div>
            
            <Button
              onClick={handleRegenerateMessage}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 mt-3"
            >
              <RefreshCw className="w-4 h-4" />
              Gerar mensagem
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
