import React from 'react';

const EmergencyFallback: React.FC = () => {
  console.log("🚨 [EMERGENCY_FALLBACK] Renderizando componente de emergência");
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Sistema Iniciando</h1>
        <p className="text-muted-foreground">Por favor, aguarde...</p>
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
        <button 
          onClick={() => window.location.href = '/login'}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Ir para Login
        </button>
      </div>
    </div>
  );
};

export default EmergencyFallback;