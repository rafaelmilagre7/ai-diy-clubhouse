
import React from 'react';
import { ImplementationTrailCreator } from '@/components/implementation-trail/ImplementationTrailCreator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Target, TrendingUp } from 'lucide-react';

const ImplementationTrailPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0F111A] p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3">
            <Sparkles className="h-8 w-8 text-viverblue" />
            Trilha de Implementação
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Sua trilha personalizada gerada com IA baseada no seu perfil e objetivos. 
            Siga os passos recomendados para alcançar seus resultados.
          </p>
        </div>

        {/* Cards informativos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-viverblue flex items-center gap-2 text-lg">
                <Target className="h-5 w-5" />
                Personalizada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm">
                Criada especificamente para seus objetivos e nível de experiência
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-viverblue flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5" />
                Gerada por IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm">
                Utilizamos inteligência artificial para criar as melhores recomendações
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-viverblue flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5" />
                Resultados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm">
                Focada em resultados práticos e implementação real no seu negócio
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Trilha principal */}
        <ImplementationTrailCreator />
      </div>
    </div>
  );
};

export default ImplementationTrailPage;
