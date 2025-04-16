
import { Loader2 } from "lucide-react";

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 text-viverblue animate-spin mb-4" />
      <h2 className="text-2xl font-semibold text-foreground">Carregando...</h2>
      <p className="text-muted-foreground mt-2">Por favor, aguarde um momento</p>
    </div>
  );
};

export default LoadingScreen;
