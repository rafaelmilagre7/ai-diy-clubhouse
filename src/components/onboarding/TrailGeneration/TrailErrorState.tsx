
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TrailErrorStateProps {
  loadingTimeout: boolean;
  onRegenerate: () => void;
  onForceRefresh: () => void;
  onGoBack: () => void;
  attemptCount?: number;
  errorDetails?: string;
}

export const TrailErrorState: React.FC<TrailErrorStateProps> = ({
  loadingTimeout,
  onRegenerate,
  onForceRefresh,
  onGoBack,
  attemptCount = 0,
  errorDetails,
}) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-amber-50 rounded-lg border border-amber-200 flex flex-col items-center">
      <AlertCircle className="text-amber-500 h-12 w-12 mb-4" />
      <h3 className="text-xl font-medium text-gray-800 mb-2">
        {loadingTimeout
          ? "Tempo limite excedido"
          : "Erro ao carregar trilha"}
      </h3>
      <p className="text-gray-700 mb-4 text-center">
        {loadingTimeout
          ? "O carregamento da trilha excedeu o tempo limite. Por favor, tente novamente."
          : "Ocorreu um erro ao carregar sua trilha personalizada. Por favor, tente novamente."}
      </p>
      
      {errorDetails && (
        <div className="bg-white/80 p-3 rounded mb-4 w-full text-sm text-gray-600 overflow-auto max-h-32">
          <code>{errorDetails}</code>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row justify-center gap-3 w-full">
        <Button
          className="bg-[#0ABAB5] text-white hover:bg-[#0ABAB5]/90"
          onClick={onRegenerate}
          size="lg"
        >
          Gerar Nova Trilha
        </Button>
        
        <Button
          variant="outline"
          onClick={onForceRefresh}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Tentar Novamente
        </Button>
      </div>
      
      <div className="mt-4 flex flex-col sm:flex-row gap-2 w-full">
        <Button
          variant="ghost"
          onClick={onGoBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Onboarding
        </Button>
        
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Ir para Dashboard
        </Button>
      </div>
      
      {attemptCount > 2 && (
        <div className="mt-5 text-xs text-gray-500 bg-white/60 p-3 rounded-md w-full">
          <p>Dicas de solução:</p>
          <ul className="list-disc pl-5 mt-1">
            <li>Tente atualizar a página</li>
            <li>Verifique sua conexão com a internet</li>
            <li>Espere alguns minutos e tente novamente</li>
            <li>Entre em contato com o suporte caso o problema persista</li>
          </ul>
        </div>
      )}
    </div>
  );
};
