
import { Loader2 } from "lucide-react";

const LoadingScreen = ({ message = "Carregando" }: { message?: string }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 text-viverblue animate-spin mb-2" />
      <h2 className="text-xl font-semibold text-foreground">{message}</h2>
    </div>
  );
};

export default LoadingScreen;
