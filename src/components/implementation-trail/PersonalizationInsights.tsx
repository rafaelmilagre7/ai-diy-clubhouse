import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Target, TrendingUp, Clock, Star } from 'lucide-react';

interface PersonalizationInsightsProps {
  trail: {
    priority1: Array<{ aiScore?: number; estimatedTime?: string }>;
    priority2: Array<{ aiScore?: number; estimatedTime?: string }>;
    priority3: Array<{ aiScore?: number; estimatedTime?: string }>;
    ai_message?: string;
    generated_at: string;
  };
}

export const PersonalizationInsights = ({ trail }: PersonalizationInsightsProps) => {
  // Calcular métricas de personalização
  const allSolutions = [...trail.priority1, ...trail.priority2, ...trail.priority3];
  const avgScore = Math.round(
    allSolutions.reduce((acc, sol) => acc + (sol.aiScore || 0), 0) / allSolutions.length
  );
  
  const highScoreSolutions = allSolutions.filter(sol => (sol.aiScore || 0) >= 85).length;
  const totalSolutions = allSolutions.length;
  
  const getPersonalizationLevel = (score: number) => {
    if (score >= 90) return { label: 'Excelente', color: 'bg-green-100 text-green-800', icon: '🎯' };
    if (score >= 75) return { label: 'Boa', color: 'bg-blue-100 text-blue-800', icon: '👍' };
    if (score >= 60) return { label: 'Moderada', color: 'bg-yellow-100 text-yellow-800', icon: '⚡' };
    return { label: 'Básica', color: 'bg-gray-100 text-gray-800', icon: '📋' };
  };

  const personalizationLevel = getPersonalizationLevel(avgScore);

  return (
    <div className="space-y-6">
      {/* Mensagem da IA */}
      {trail.ai_message && (
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-blue-600" />
              Insights da IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-high-contrast leading-relaxed">{trail.ai_message}</p>
          </CardContent>
        </Card>
      )}

      {/* Métricas de Personalização */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-high-contrast">{avgScore}%</p>
                <p className="text-sm text-medium-contrast">Compatibilidade Média</p>
              </div>
              <Badge className={personalizationLevel.color}>
                {personalizationLevel.icon} {personalizationLevel.label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Star className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-high-contrast">{highScoreSolutions}</p>
                <p className="text-sm text-medium-contrast">Soluções Altamente Compatíveis</p>
              </div>
              <Badge className="bg-green-100 text-green-800">
                {Math.round((highScoreSolutions / totalSolutions) * 100)}% do total
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-high-contrast">{totalSolutions}</p>
                <p className="text-sm text-medium-contrast">Soluções Recomendadas</p>
              </div>
              <Badge className="bg-purple-100 text-purple-800">
                Trilha Personalizada
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dicas de Implementação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            Estratégia de Implementação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-high-contrast">Recomendações para começar:</h4>
              <ul className="space-y-2 text-sm text-medium-contrast">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  Comece pela solução de maior score na Prioridade 1
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  Implemente uma solução por vez para garantir qualidade
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  Monitore resultados antes de passar para a próxima
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-high-contrast">Dicas de sucesso:</h4>
              <ul className="space-y-2 text-sm text-medium-contrast">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">•</span>
                  Reserve tempo adequado para cada implementação
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  Documente o processo e resultados obtidos
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  Ajuste conforme sua realidade específica
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data de geração */}
      <div className="text-center text-sm text-medium-contrast">
        Trilha gerada em {new Date(trail.generated_at).toLocaleDateString('pt-BR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>
    </div>
  );
};