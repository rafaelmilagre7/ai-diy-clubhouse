
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Rocket, WandSparkles } from "lucide-react";
import { MagicScene } from "./three/MagicScene";
import { ErrorBoundary } from "react-error-boundary";

interface TrailMagicExperienceProps {
  onFinish: () => void;
  onStep?: (step: number) => void; // chamará quando avançar a etapa (para efeitos, etc)
}

const steps = [
  {
    title: "Preparando sua trilha personalizada...",
    description: "Analisando suas respostas de onboarding e combinando com soluções de IA do nosso ecossistema.",
    icon: <Sparkles className="mx-auto text-amber-500" size={44} />,
  },
  {
    title: "Encontrando as melhores soluções...",
    description: "Trabalhando para selecionar o que trará mais resultados para seu negócio.",
    icon: <Rocket className="mx-auto text-[#0ABAB5]" size={44} />,
  },
  {
    title: "Quase lá!",
    description: "Montando sua jornada perfeita de implementação de IA. Prepare-se!",
    icon: <WandSparkles className="mx-auto text-purple-500" size={44} />,
  },
  {
    title: "Sua trilha está pronta! 🚀",
    description: "Confira abaixo as soluções, justificativas e ação recomendada para seu perfil.",
    icon: <Sparkles className="mx-auto text-green-500 animate-bounce" size={44} />,
  },
];

// Componente fallback para erros na cena 3D
const FallbackScene = () => (
  <div className="w-64 h-64 rounded-full bg-gradient-to-br from-[#0ABAB5]/30 to-purple-300/30 flex items-center justify-center">
    <div className="text-[#0ABAB5] rotate-12 transform scale-150">
      <Sparkles size={64} />
    </div>
  </div>
);

export function TrailMagicExperience({ onFinish, onStep }: TrailMagicExperienceProps) {
  const [currStep, setCurrStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [canvasLoaded, setCanvasLoaded] = useState(false);
  const [render3D, setRender3D] = useState(true);

  // Efeito para iniciar animação ao montar o componente
  useEffect(() => {
    console.log("TrailMagicExperience montado");
    // Dar tempo para o componente montar antes de mostrar
    const timer = setTimeout(() => {
      setIsVisible(true);
      console.log("TrailMagicExperience agora é visível");
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Modificado: avança automaticamente após um tempo em cada etapa
  useEffect(() => {
    if (!isVisible || currStep >= steps.length - 1) return;
    
    // Avançar automaticamente após 2.5 segundos em cada passo
    const autoAdvanceTimer = setTimeout(() => {
      setCurrStep(s => {
        const next = s + 1;
        onStep && onStep(next);
        return next;
      });
    }, 2500);
    
    return () => clearTimeout(autoAdvanceTimer);
  }, [currStep, isVisible, onStep]);

  // Adicionado: finaliza a experiência automaticamente 2.5s após o último passo
  useEffect(() => {
    if (currStep === steps.length - 1) {
      const finishTimer = setTimeout(() => {
        onFinish();
      }, 2500);
      
      return () => clearTimeout(finishTimer);
    }
  }, [currStep, onFinish]);

  // Manipulador manual para finalizar
  const handleFinish = useCallback(() => {
    if (currStep === steps.length - 1) {
      onFinish();
    } else {
      // Se clicar antes de completar, avança para o último passo
      setCurrStep(steps.length - 1);
    }
  }, [currStep, onFinish]);

  // Handler para erros de renderização 3D
  const handleRenderError = useCallback((error: Error) => {
    console.error("Erro na renderização 3D:", error);
    setRender3D(false);
  }, []);

  // Adicionar manipulador para Canvas carregada
  const handleCanvasCreated = useCallback(() => {
    console.log("Canvas React Three Fiber carregada com sucesso");
    setCanvasLoaded(true);
  }, []);

  if (!isVisible) {
    console.log("TrailMagicExperience não visível ainda");
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 animate-fade-in">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-2xl p-8 relative flex flex-col items-center animate-scale-in border-2 border-[#0ABAB5]/40">
        <div className="absolute top-2 right-3">
          {/* Permitir pular a animação */}
          <Button variant="ghost" size="sm" onClick={handleFinish} className="text-[#0ABAB5] font-medium">
            {currStep === steps.length - 1 ? "Ver Minha Trilha" : "Pular"}
          </Button>
        </div>
        <div className="w-full flex flex-col items-center">
          <div className="w-64 h-64 flex items-center justify-center mb-8 drop-shadow-lg">
            <ErrorBoundary FallbackComponent={() => <FallbackScene />} onError={handleRenderError}>
              {render3D ? (
                <MagicScene 
                  stage={currStep} 
                  onCanvasCreated={handleCanvasCreated}
                />
              ) : (
                <FallbackScene />
              )}
            </ErrorBoundary>
          </div>
          <div className="w-full text-center mt-2 px-3">
            <div>{steps[currStep].icon}</div>
            <h2 className="text-2xl font-bold mt-2 text-[#0ABAB5]">{steps[currStep].title}</h2>
            <p className="mt-2 text-base text-gray-700">{steps[currStep].description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
