
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface TrailMagicExperienceProps {
  onFinish: () => void;
}

export const TrailMagicExperience: React.FC<TrailMagicExperienceProps> = ({ onFinish }) => {
  const [step, setStep] = useState(0);
  const [showFinishButton, setShowFinishButton] = useState(false);
  
  const messages = [
    "Analisando seu perfil e objetivos...",
    "Combinando com soluções de IA de alto impacto...",
    "Personalizando recomendações específicas...",
    "Organizando sua trilha ideal...",
    "Trilha personalizada pronta!"
  ];
  
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    // Avançar pelos passos com temporizadores
    for (let i = 1; i < messages.length; i++) {
      const timer = setTimeout(() => {
        setStep(i);
        if (i === messages.length - 1) {
          setTimeout(() => setShowFinishButton(true), 1000);
        }
      }, i * 2000);
      timers.push(timer);
    }
    
    return () => timers.forEach(timer => clearTimeout(timer));
  }, [messages.length]);
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-[#151823] to-[#1A1E2E] p-8 rounded-2xl border border-[#0ABAB5]/20 shadow-lg flex flex-col items-center justify-center min-h-[350px]">
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-full bg-[#0ABAB5]/20 blur-xl animate-pulse"></div>
          <div className="relative">
            <Sparkles className="h-16 w-16 text-[#0ABAB5] animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-6 w-full max-w-md">
          {messages.map((message, idx) => (
            <div 
              key={idx} 
              className={`flex items-center gap-3 transition-all duration-500 ${
                idx <= step ? 'opacity-100' : 'opacity-30'
              }`}
            >
              <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                idx < step 
                  ? 'bg-[#0ABAB5] text-white' 
                  : idx === step 
                    ? 'bg-white/10 border-2 border-[#0ABAB5] animate-pulse' 
                    : 'bg-white/5 border border-white/10'
              }`}>
                {idx < step ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <span className="h-2 w-2 rounded-full bg-white/70"></span>
                )}
              </div>
              <span className={`text-${idx <= step ? 'white' : 'neutral-500'} ${idx === step ? 'font-medium' : ''}`}>
                {message}
              </span>
            </div>
          ))}
        </div>
        
        {showFinishButton && (
          <div className="mt-8 animate-fade-in">
            <Button
              onClick={onFinish}
              className="bg-gradient-to-r from-[#0ABAB5] to-[#34D399] hover:from-[#0ABAB5]/90 hover:to-[#34D399]/90 px-6 py-2 text-base"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Ver Minha Trilha
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
