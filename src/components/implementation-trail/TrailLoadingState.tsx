
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
    <Card className="bg-gradient-to-br from-viverblue/10 via-transparent to-viverblue/5 border-viverblue/20">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-viverblue/20">
            <Loader2 className="h-8 w-8 text-viverblue animate-spin" />
          </div>
        </div>
        <CardTitle className="text-xl text-viverblue flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5" />
          {isRegenerating ? 'Regenerando' : 'Gerando'} Sua Trilha Personalizada
        </CardTitle>
      </CardHeader>
      
      <CardContent className="text-center space-y-6">
        <div className="space-y-3">
          <p className="text-neutral-300">
            Nossa IA está analisando seu perfil e criando uma trilha personalizada...
          </p>
          
          <div className="bg-viverblue/10 border border-viverblue/20 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-2 h-2 bg-viverblue rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-viverblue rounded-full animate-pulse delay-100"></div>
              <div className="w-2 h-2 bg-viverblue rounded-full animate-pulse delay-200"></div>
            </div>
            <p className="text-sm text-viverblue font-medium">
              Analisando seu onboarding e selecionando as melhores soluções...
            </p>
          </div>

          <div className="text-xs text-neutral-500 space-y-1">
            <p>✨ Selecionando soluções prioritárias</p>
            <p>📚 Escolhendo aulas personalizadas</p>
            <p>🎯 Organizando por nível de impacto</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
