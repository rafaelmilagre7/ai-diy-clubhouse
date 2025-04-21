
import React, { useState, useEffect, useCallback } from 'react';
import { MagicScene } from './three/MagicScene';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from 'react-error-boundary';

interface TrailMagicExperienceProps {
  onFinish: () => void;
}

// Componente de fallback para erros
const MagicFallback = ({ onFinish }: { onFinish: () => void }) => (
  <div className="w-full h-80 flex flex-col items-center justify-center bg-gradient-to-br from-[#0ABAB5]/10 to-white rounded-2xl p-8">
    <div className="text-center space-y-4">
      <h3 className="text-xl font-semibold text-[#0ABAB5]">Milagrinho está gerando sua trilha personalizada</h3>
      <p className="text-gray-600">Estamos analisando seus dados e construindo uma trilha perfeita para o seu negócio!</p>
      <div className="flex justify-center mt-4">
        <Loader2 className="animate-spin h-8 w-8 text-[#0ABAB5]" />
      </div>
      <Button 
        className="mt-4 bg-[#0ABAB5] text-white"
        onClick={onFinish}
      >
        Continuar para ver minha trilha
      </Button>
    </div>
  </div>
);

export const TrailMagicExperience: React.FC<TrailMagicExperienceProps> = ({ onFinish }) => {
  const [stage, setStage] = useState<'intro' | 'analysis' | 'completion'>('intro');
  const [animCompleted, setAnimCompleted] = useState(false);
  
  // Usar useCallback para otimizar a performance
  const handleAnalysisComplete = useCallback(() => {
    setAnimCompleted(true);
    setStage('completion');
  }, []);
  
  // Usar useCallback para otimizar a performance
  const handleStartAnalysis = useCallback(() => {
    setStage('analysis');
    
    // Simular tempo de análise (5 segundos)
    setTimeout(() => {
      handleAnalysisComplete();
    }, 5000);
  }, [handleAnalysisComplete]);
  
  // Iniciar automaticamente 
  useEffect(() => {
    const timer = setTimeout(() => {
      handleStartAnalysis();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [handleStartAnalysis]);
  
  // Para ter certeza que o usuário não fica preso, timer de segurança
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      if (!animCompleted) {
        console.log("Timer de segurança acionado para TrailMagicExperience");
        handleAnalysisComplete();
      }
    }, 10000);
    
    return () => clearTimeout(safetyTimer);
  }, [animCompleted, handleAnalysisComplete]);

  const messages = {
    intro: "Milagrinho está analisando seus dados para gerar sua trilha personalizada...",
    analysis: "Identificando as melhores soluções para o momento do seu negócio...",
    completion: "Trilha personalizada gerada com sucesso! Clique para continuar."
  };

  return (
    <ErrorBoundary fallbackRender={({error}) => {
      console.error("Erro na experiência mágica:", error);
      return <MagicFallback onFinish={onFinish} />;
    }}>
      <div className="relative w-full h-80 flex items-center justify-center mb-4 rounded-2xl overflow-hidden">
        {/* Cena 3D */}
        <div className="absolute inset-0 z-0">
          <MagicScene 
            stage={1} 
            isAnimating={stage === 'analysis'} 
          />
        </div>
        
        {/* Overlay com mensagens */}
        <div className="relative z-10 text-center p-4 bg-white/30 backdrop-blur-sm rounded-xl flex flex-col items-center space-y-4">
          <h3 className="text-xl font-bold text-[#0ABAB5]">{messages[stage]}</h3>
          
          {stage === 'intro' && (
            <Button 
              className="mt-4 bg-[#0ABAB5] text-white"
              onClick={handleStartAnalysis}
            >
              Iniciar Análise
            </Button>
          )}
          
          {stage === 'analysis' && (
            <Loader2 className="animate-spin h-8 w-8 text-[#0ABAB5]" />
          )}
          
          {stage === 'completion' && (
            <Button 
              className="mt-4 bg-[#0ABAB5] text-white"
              onClick={onFinish}
              autoFocus
            >
              Ver Minha Trilha Personalizada
            </Button>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};
