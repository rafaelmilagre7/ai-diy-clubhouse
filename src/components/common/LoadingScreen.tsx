
import React from "react";
import { LoadingState } from "./LoadingState";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Carregando" 
}) => {
  return (
    <div className="min-h-screen bg-background">
      <LoadingState
        variant="spinner"
        size="lg"
        message={`${message} - Estamos preparando sua experiência personalizada do VIVER DE IA Club...`}
        fullScreen
      />
    </div>
  );
};

export default LoadingScreen;
