
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Sparkles } from "lucide-react";

interface TrailEmptyStateProps {
  onRegenerate: () => void;
}

export const TrailEmptyState: React.FC<TrailEmptyStateProps> = ({
  onRegenerate
}) => {
  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-viverblue flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6" />
          Trilha de Implementação
        </CardTitle>
      </CardHeader>
      <CardContent className="py-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Lightbulb className="h-16 w-16 text-viverblue" />
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-white">
              Sua trilha personalizada não foi encontrada
            </h3>
            <p className="text-neutral-400 max-w-md">
              Não conseguimos localizar uma trilha de implementação para seu perfil. 
              Vamos gerar uma nova trilha personalizada baseada no seu onboarding.
            </p>
          </div>
          <Button
            onClick={onRegenerate}
            className="bg-viverblue hover:bg-viverblue/90 flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Gerar Trilha Personalizada
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
