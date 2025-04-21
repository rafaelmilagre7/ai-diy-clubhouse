
import React from "react";

interface TrailGenerationHeaderProps {
  isGenerating?: boolean;
  isGenerated?: boolean;
  hasError?: boolean;
  backUrl?: string;
  children?: React.ReactNode;
}

export const TrailGenerationHeader: React.FC<TrailGenerationHeaderProps> = ({ 
  isGenerating, 
  isGenerated, 
  hasError, 
  backUrl = "/onboarding", 
  children 
}) => (
  <div className="mb-6">
    <h2 className="text-2xl font-bold text-gray-800 mb-2">
      {hasError ? "Ops! Encontramos um problema..." :
       isGenerating ? "Gerando sua trilha personalizada..." :
       isGenerated ? "Sua trilha personalizada está pronta!" :
       "Vamos preparar sua trilha de implementação"}
    </h2>
    <p className="text-gray-600">
      {hasError ? "Não conseguimos gerar sua trilha personalizada. Tente novamente em instantes." :
       isGenerating ? "Estamos analisando seus dados para criar a melhor experiência. Isso pode levar alguns segundos..." :
       isGenerated ? "Com base nas suas respostas, criamos uma trilha personalizada para você começar a implementar IA no seu negócio." :
       "Baseado nas suas respostas, vamos criar uma trilha específica para o seu negócio."}
    </p>
    {children}
  </div>
);
