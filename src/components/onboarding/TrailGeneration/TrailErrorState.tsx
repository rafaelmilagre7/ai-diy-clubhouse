
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, ArrowLeft, Home, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface TrailErrorStateProps {
  onRegenerate: () => void;
  onForceRefresh: () => void;
  onGoBack: () => void;
  errorDetails?: string;
  loadingTimeout?: boolean;
  attemptCount?: number;
  onResetData?: () => Promise<void>;
}

export const TrailErrorState: React.FC<TrailErrorStateProps> = ({
  onRegenerate,
  onForceRefresh,
  onGoBack,
  onResetData,
  errorDetails,
  loadingTimeout = false,
  attemptCount = 0,
}) => {
  const navigate = useNavigate();

  const handleDashboardNavigation = () => {
    toast.info("Redirecionando para dashboard...");
    navigate("/dashboard");
  };
  
  // Mensagem personalizada com base no tipo de erro
  const errorMessage = loadingTimeout 
    ? "Tempo limite excedido ao carregar a trilha" 
    : "Erro ao carregar trilha";
  
  // Descrição detalhada do problema
  const errorDescription = loadingTimeout
    ? "O servidor demorou muito para responder. Isso pode acontecer devido a sobrecarga momentânea ou problemas de conexão."
    : "Não foi possível carregar sua trilha personalizada. Você pode tentar novamente ou acessar o dashboard para continuar.";

  return (
    <div className="max-w-xl mx-auto my-8 p-6 bg-amber-50 rounded-lg border border-amber-200 flex flex-col items-center">
      <AlertCircle className="text-amber-500 h-12 w-12 mb-4" />
      
      <h3 className="text-xl font-medium text-gray-800 mb-2">
        {errorMessage}
      </h3>
      
      <p className="text-gray-700 mb-4 text-center">
        {errorDescription}
      </p>
      
      {errorDetails && (
        <div className="bg-white p-3 rounded mb-4 w-full text-sm text-gray-600 overflow-auto max-h-32 border border-amber-200">
          <p className="text-xs text-amber-700 mb-1 font-medium">Detalhes do erro:</p>
          <code>{errorDetails}</code>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row justify-center gap-3 w-full mt-2">
        <Button
          variant="outline"
          onClick={onForceRefresh}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Tentar Novamente
        </Button>
        
        <Button
          className="bg-[#0ABAB5] text-white hover:bg-[#0ABAB5]/90"
          onClick={handleDashboardNavigation}
          size="lg"
        >
          Acessar Dashboard
        </Button>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-2 w-full justify-between">
        <Button
          variant="ghost"
          onClick={onGoBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Onboarding
        </Button>
        
        {attemptCount > 2 && onResetData && (
          <Button
            variant="outline"
            onClick={onResetData}
            className="text-amber-700 border-amber-300 hover:bg-amber-100"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reiniciar Dados
          </Button>
        )}
      </div>
    </div>
  );
};
