
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface TrailLoadingStateProps {
  attemptCount: number;
  onForceRefresh?: () => void;
}

export const TrailLoadingState: React.FC<TrailLoadingStateProps> = ({ attemptCount, onForceRefresh }) => {
  const [showRefresh, setShowRefresh] = useState(false);
  const [loadingText, setLoadingText] = useState("Gerando sua trilha personalizada...");
  const loadingTexts = [
    "Analisando seu perfil de negócio...",
    "Identificando oportunidades de IA para seu caso...",
    "Priorizando soluções mais impactantes...",
    "Personalizando recomendações para você...",
    "Preparando sua trilha de implementação...",
    "Finalizando as recomendações de IA...",
  ];

  // Mostrar opção de atualização após tempo limite
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowRefresh(true);
    }, 15000);
    return () => clearTimeout(timer);
  }, []);

  // Alternar entre diferentes textos de carregamento
  useEffect(() => {
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      setLoadingText(loadingTexts[currentIndex % loadingTexts.length]);
      currentIndex++;
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-gradient-to-br from-[#151823] to-[#1A1E2E] p-8 rounded-2xl border border-[#0ABAB5]/20 shadow-lg animate-pulse flex flex-col items-center justify-center min-h-[300px]">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-[#0ABAB5]/20 blur-xl animate-pulse"></div>
          <div className="relative">
            <Loader2 className="h-14 w-14 text-[#0ABAB5] animate-spin" />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-white">{loadingText}</p>
          <p className="text-sm text-neutral-400">
            {attemptCount > 1 ? `Tentativa ${attemptCount} em andamento...` : "Isso pode levar alguns momentos..."}
          </p>
        </div>
        
        {showRefresh && onForceRefresh && (
          <div className="mt-8">
            <Button 
              variant="outline" 
              onClick={onForceRefresh}
              className="hover:border-[#0ABAB5]/60 hover:text-[#0ABAB5]"
            >
              Está demorando muito? Tentar novamente
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
