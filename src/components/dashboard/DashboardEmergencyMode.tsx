
import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardEmergencyModeProps {
  error?: string;
  onRetry?: () => void;
}

export const DashboardEmergencyMode: FC<DashboardEmergencyModeProps> = ({ 
  error = "Erro ao carregar dashboard", 
  onRetry 
}) => {
  const navigate = useNavigate();
  
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#1A1D2E] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-white/10 bg-[#181A2A]/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <CardTitle className="text-white">Dashboard Temporariamente Indisponível</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-neutral-400">
            {error}. Estamos trabalhando para resolver este problema.
          </p>
          
          <div className="flex flex-col space-y-2">
            <Button 
              onClick={handleRetry} 
              className="w-full bg-viverblue hover:bg-viverblue/80"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="w-full border-white/10 text-white hover:bg-white/5"
            >
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <p className="text-sm text-blue-300">
              💡 <strong>Dica:</strong> Se o problema persistir, tente limpar o cache do navegador ou entre em contato com o suporte.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
