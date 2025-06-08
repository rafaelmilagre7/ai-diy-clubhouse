
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ImplementationTrailCard = () => {
  const navigate = useNavigate();

  const handleNavigateToTrail = () => {
    navigate('/trilha-implementacao');
  };

  return (
    <Card className="glass-dark border-2 bg-gradient-to-br from-viverblue/20 to-purple-500/20 border-viverblue/30 hover:border-viverblue/50 transition-all duration-300 hover:shadow-lg hover:shadow-viverblue/25">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-viverblue/20 rounded-lg">
              <Brain className="h-5 w-5 text-viverblue" />
            </div>
            <div>
              <CardTitle className="text-high-contrast text-lg flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-viverblue animate-pulse" />
                Trilha Personalizada
              </CardTitle>
              <p className="text-medium-contrast text-sm">
                Guia inteligente criado especialmente para você
              </p>
            </div>
          </div>
          <Button 
            onClick={handleNavigateToTrail}
            size="sm"
            className="bg-viverblue hover:bg-viverblue/90 text-white"
          >
            Acessar
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
};
