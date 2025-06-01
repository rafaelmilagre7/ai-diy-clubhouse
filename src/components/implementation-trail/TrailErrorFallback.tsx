
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, RotateCcw } from "lucide-react";

interface TrailErrorFallbackProps {
  error: string;
  onRetry: () => void;
  onRegenerate: () => void;
}

export const TrailErrorFallback: React.FC<TrailErrorFallbackProps> = ({ 
  error, 
  onRetry, 
  onRegenerate 
}) => {
  return (
    <Card className="bg-red-900/20 border-red-500/30">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-red-500/20">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
        </div>
        <CardTitle className="text-xl text-red-400">
          Erro ao Carregar Trilha
        </CardTitle>
      </CardHeader>
      
      <CardContent className="text-center space-y-6">
        <div className="bg-red-950/50 border border-red-500/20 rounded-lg p-4">
          <p className="text-sm text-red-300">
            {error}
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-neutral-400">
            Não foi possível carregar sua trilha de implementação.
          </p>
          <p className="text-sm text-neutral-500">
            Tente recarregar os dados ou gerar uma nova trilha.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={onRetry}
            variant="outline"
            className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
          
          <Button 
            onClick={onRegenerate}
            className="flex-1 bg-viverblue hover:bg-viverblue/90 text-white"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Gerar Nova Trilha
          </Button>
        </div>

        <p className="text-xs text-neutral-500">
          Se o problema persistir, entre em contato com o suporte
        </p>
      </CardContent>
    </Card>
  );
};
