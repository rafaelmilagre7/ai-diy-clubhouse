
import React from "react";
import { LoadingState } from "./LoadingState";

interface LoadingScreenProps {
  message?: string;
  showProgress?: boolean;
}

const LoadingScreen = ({ 
  message = "Carregando...", 
  showProgress = false 
}: LoadingScreenProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        {/* Logo animado */}
        <div className="relative mb-4">
          <div className="w-16 h-16 border-4 border-viverblue/30 border-t-viverblue rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-viverblue/50 rounded-full animate-spin animate-reverse"></div>
        </div>
        
        {/* Mensagem principal */}
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            VIVER DE IA Hub
          </h2>
          <p className="text-muted-foreground animate-pulse">
            {message}
          </p>
        </div>

        {/* Barra de progresso simulada se solicitada */}
        {showProgress && (
          <div className="w-64 bg-muted rounded-full h-2 overflow-hidden">
            <div className="bg-viverblue h-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        )}
      </div>
      
      {/* Indicadores de status */}
      <div className="absolute bottom-8 text-center text-xs text-muted-foreground">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Sistema operacional</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
