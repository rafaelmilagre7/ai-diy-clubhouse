
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, ArrowRight, Sparkles } from "lucide-react";

interface OnboardingIncompleteTrailStateProps {
  onNavigateToOnboarding: () => void;
}

export const OnboardingIncompleteTrailState: React.FC<OnboardingIncompleteTrailStateProps> = ({
  onNavigateToOnboarding
}) => {
  return (
    <Card className="w-full border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-transparent to-amber-500/10">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-viverblue" />
          Trilha de Implementação
          <span className="text-sm font-normal text-viverblue bg-viverblue/10 px-2 py-1 rounded-full">
            IA
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 space-y-6">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-amber-500/20 border border-amber-500/30">
              <User className="h-8 w-8 text-amber-400" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-white">
              Complete seu Perfil Primeiro
            </h3>
            <p className="text-neutral-400 max-w-md mx-auto">
              Para gerar sua trilha de implementação personalizada com IA, você precisa completar 
              seu perfil. Isso nos permite entender melhor seus objetivos e criar recomendações 
              específicas para seu negócio.
            </p>
          </div>

          <div className="bg-viverblue/10 border border-viverblue/20 rounded-lg p-4">
            <h4 className="text-viverblue font-medium mb-2">
              ✨ O que sua trilha incluirá após completar o perfil:
            </h4>
            <ul className="text-sm text-neutral-300 space-y-1 text-left">
              <li>• Soluções prioritárias baseadas no seu negócio</li>
              <li>• Aulas personalizadas para seu nível de conhecimento</li>
              <li>• Cronograma de implementação otimizado</li>
              <li>• Recomendações da IA especializada em negócios</li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <Button 
              onClick={onNavigateToOnboarding}
              className="bg-viverblue hover:bg-viverblue/90 text-white px-6 py-3"
              size="lg"
            >
              <ArrowRight className="mr-2 h-5 w-5" />
              Complete seu Perfil
            </Button>
            
            <div className="text-sm text-neutral-500">
              <p>Tempo estimado: 5-10 minutos</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
