
import React from "react";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
}

// Componente vazio que não exibe mais a barra de progresso
const ProgressIndicator: React.FC<ProgressIndicatorProps> = () => {
  return null;
};

export default ProgressIndicator;
