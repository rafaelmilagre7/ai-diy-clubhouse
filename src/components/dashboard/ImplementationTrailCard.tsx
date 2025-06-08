
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Sparkles, ArrowRight, Route } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ImplementationTrailCard = () => {
  const navigate = useNavigate();

  const handleNavigateToTrail = () => {
    navigate('/trilha-implementacao');
  };

  return (
    <Card className="glass-dark border-2 bg-gradient-to-br from-viverblue/20 to-purple-500/20 border-viverblue/30 hover:border-viverblue/50 transition-all duration-300 hover:shadow-lg hover:shadow-viverblue/25">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-viverblue/20 rounded-lg">
            <Brain className="h-6 w-6 text-viverblue" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-high-contrast text-lg flex items-center gap-2">
              <Route className="h-5 w-5 text-viverblue" />
              Sua Trilha Personalizada
            </CardTitle>
            <p className="text-medium-contrast text-sm mt-1">
              Guia inteligente com IA para sua jornada
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-medium-contrast">
            <Sparkles className="h-4 w-4 text-viverblue" />
            <span>Recomendações baseadas no seu perfil</span>
          </div>
          
          <div className="flex flex-col gap-2 text-sm text-medium-contrast">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Soluções prioritárias para implementar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Aulas recomendadas para seu perfil</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Justificativas inteligentes da IA</span>
            </div>
          </div>

          <Button 
            onClick={handleNavigateToTrail}
            className="w-full bg-viverblue hover:bg-viverblue/90 text-white"
          >
            Acessar Minha Trilha
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
