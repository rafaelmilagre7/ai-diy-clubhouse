
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, AlertCircle } from "lucide-react";

interface TrailEmptyStateProps {
  onRegenerate: () => void;
}

export const TrailEmptyState: React.FC<TrailEmptyStateProps> = ({ onRegenerate }) => {
  return (
    <Card className="bg-neutral-900/50 border-neutral-700/50">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-viverblue/20">
            <AlertCircle className="h-8 w-8 text-viverblue" />
          </div>
        </div>
        <CardTitle className="text-xl text-white">
          Nenhuma Trilha Encontrada
        </CardTitle>
      </CardHeader>
      
      <CardContent className="text-center space-y-6">
        <div className="space-y-3">
          <p className="text-neutral-400">
            Parece que você ainda não tem uma trilha de implementação personalizada.
          </p>
          <p className="text-sm text-neutral-500">
            Vamos criar uma trilha baseada no seu perfil e objetivos de negócio!
          </p>
        </div>

        <div className="bg-viverblue/10 border border-viverblue/20 rounded-lg p-4">
          <h4 className="text-viverblue font-medium mb-2">
            ✨ O que sua trilha incluirá:
          </h4>
          <ul className="text-sm text-neutral-300 space-y-1 text-left">
            <li>• Soluções prioritárias para seu negócio</li>
            <li>• Aulas personalizadas baseadas no seu nível</li>
            <li>• Cronograma de implementação otimizado</li>
            <li>• Recomendações da IA especializada</li>
          </ul>
        </div>

        <Button 
          onClick={onRegenerate}
          className="w-full bg-viverblue hover:bg-viverblue/90 text-white"
          size="lg"
        >
          <Sparkles className="h-5 w-5 mr-2" />
          Gerar Minha Trilha Personalizada
          <RefreshCw className="h-5 w-5 ml-2" />
        </Button>

        <p className="text-xs text-neutral-500">
          Baseado no seu onboarding e perfil de negócio
        </p>
      </CardContent>
    </Card>
  );
};
