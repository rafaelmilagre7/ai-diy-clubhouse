
import React from "react";

export const LoadingSpinner = ({ size = 8 }) => (
  <div className={`animate-spin rounded-full h-${size} w-${size} border-t-2 border-b-2 border-[#0ABAB5]`}></div>
);

// Componente para tela de carregamento completa
export const LoadingScreen = ({ message = "Carregando" }: { message?: string }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <LoadingSpinner size={12} />
      <h2 className="text-xl font-semibold text-foreground mt-4 mb-2">{message}</h2>
      <p className="text-sm text-muted-foreground">
        Estamos preparando sua experiência personalizada do VIVER DE IA Club...
      </p>
    </div>
  );
};

export default LoadingScreen;
