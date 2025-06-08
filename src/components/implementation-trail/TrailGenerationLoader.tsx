
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Sparkles, Target, Lightbulb, GraduationCap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface TrailGenerationLoaderProps {
  message?: string;
}

export const TrailGenerationLoader = ({ message = "Gerando sua trilha personalizada" }: TrailGenerationLoaderProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { icon: Brain, text: "Analisando seu perfil", color: "text-viverblue" },
    { icon: Target, text: "Identificando objetivos", color: "text-green-400" },
    { icon: Lightbulb, text: "Selecionando soluções", color: "text-yellow-400" },
    { icon: GraduationCap, text: "Recomendando aulas", color: "text-purple-400" },
    { icon: Sparkles, text: "Finalizando trilha", color: "text-viverblue" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 20;
        if (newProgress >= 100) {
          return 100;
        }
        return newProgress;
      });
    }, 800);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 1500);

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="glass-dark border-viverblue/20 max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="relative mx-auto w-20 h-20 mb-4">
              <div className="absolute inset-0 bg-viverblue/20 rounded-full animate-ping"></div>
              <div className="relative w-20 h-20 bg-viverblue/10 rounded-full flex items-center justify-center">
                <Brain className="h-10 w-10 text-viverblue animate-pulse" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-high-contrast mb-2">
              {message}
            </h2>
            <p className="text-medium-contrast text-sm">
              Nossa IA está criando o melhor caminho para seus objetivos
            </p>
          </div>

          <div className="space-y-4">
            <Progress value={progress} className="h-2" />
            
            <div className="flex items-center justify-center gap-3 min-h-[24px]">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div
                    key={index}
                    className={`transition-all duration-300 ${
                      index === currentStep 
                        ? `${step.color} scale-110` 
                        : 'text-medium-contrast/50 scale-90'
                    }`}
                  >
                    <StepIcon className="h-5 w-5" />
                  </div>
                );
              })}
            </div>
            
            <p className="text-sm text-medium-contrast animate-fade-in">
              {steps[currentStep]?.text}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
