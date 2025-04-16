
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const LoadingScreen = () => {
  const [showEmergencyButton, setShowEmergencyButton] = useState(false);

  // Mostrar botão de emergência após 3 segundos para evitar loop de carregamento
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowEmergencyButton(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleEmergencyRedirect = () => {
    window.location.href = '/auth';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 text-viverblue animate-spin mb-4" />
      <h2 className="text-2xl font-semibold text-foreground">Carregando...</h2>
      <p className="text-muted-foreground mt-2">Por favor, aguarde um momento</p>
      
      {showEmergencyButton && (
        <div className="mt-8">
          <Button 
            variant="outline" 
            onClick={handleEmergencyRedirect}
            className="text-red-500 border-red-300 hover:bg-red-50"
          >
            Problemas de carregamento? Clique aqui
          </Button>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Se a página não carregar, clique no botão acima para reiniciar.
          </p>
        </div>
      )}
    </div>
  );
};

export default LoadingScreen;
