
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TrailErrorFallbackProps {
  error?: string;
  onRetry?: () => void;
  onRegenerate?: () => void;
}

export const TrailErrorFallback: React.FC<TrailErrorFallbackProps> = ({
  error,
  onRetry,
  onRegenerate
}) => {
  const navigate = useNavigate();

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-amber-500" />
        </div>
        <CardTitle className="text-xl text-white">
          Erro ao carregar trilha de implementação
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-neutral-400">
          {error || 'Ocorreu um erro inesperado ao carregar sua trilha personalizada.'}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Tentar Novamente
            </Button>
          )}
          
          {onRegenerate && (
            <Button
              onClick={onRegenerate}
              className="bg-viverblue hover:bg-viverblue/90 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Regenerar Trilha
            </Button>
          )}
          
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
