
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";

interface TrailLoadingStateProps {
  isRegenerating?: boolean;
}

export const TrailLoadingState: React.FC<TrailLoadingStateProps> = ({
  isRegenerating = false
}) => {
  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-viverblue flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6" />
          {isRegenerating ? 'Regenerando' : 'Carregando'} Trilha Personalizada
        </CardTitle>
      </CardHeader>
      <CardContent className="py-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 text-viverblue animate-spin" />
          <div className="text-center space-y-2">
            <p className="text-lg text-white">
              {isRegenerating 
                ? 'Criando uma nova trilha personalizada para você...' 
                : 'Preparando sua trilha de implementação...'
              }
            </p>
            <p className="text-sm text-neutral-400">
              {isRegenerating 
                ? 'Analisando seu perfil e gerando novas recomendações'
                : 'Carregando soluções e aulas recomendadas'
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
