
import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen = ({ message = "Carregando..." }: LoadingScreenProps) => {
  return (
    <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-viverblue mx-auto" />
        <p className="text-neutral-300 text-sm">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
