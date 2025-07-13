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
    if (score >= 90) return { label: 'Excelente', color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: '🎯' };
    if (score >= 75) return { label: 'Boa', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: '👍' };
    if (score >= 60) return { label: 'Moderada', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: '⚡' };
    return { label: 'Básica', color: 'bg-muted text-muted-foreground border-border', icon: '📋' };
  };

  const personalizationLevel = getPersonalizationLevel(avgScore);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Mensagem da IA */}
      {trail.ai_message && (
        <div className="ai-message">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-foreground mb-2">
                Insights da IA
              </h3>
              <p className="text-foreground leading-relaxed">{trail.ai_message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Métricas de Personalização */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center card-onboarding">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{avgScore}%</p>
                <p className="text-sm text-muted-foreground">Compatibilidade Média</p>
              </div>
              <Badge className={`${personalizationLevel.color} border`}>
                {personalizationLevel.icon} {personalizationLevel.label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="text-center card-onboarding">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <Star className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{highScoreSolutions}</p>
                <p className="text-sm text-muted-foreground">Soluções Altamente Compatíveis</p>
              </div>
              <Badge className="bg-green-500/10 text-green-400 border-green-500/20 border">
                {Math.round((highScoreSolutions / totalSolutions) * 100)}% do total
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="text-center card-onboarding">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalSolutions}</p>
                <p className="text-sm text-muted-foreground">Soluções Recomendadas</p>
              </div>
              <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 border">
                Trilha Personalizada
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por prioridade */}
      <Card className="card-onboarding">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Distribuição por Prioridade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-foreground font-medium">Prioridade 1 - Alta</span>
              </div>
              <span className="text-red-400 font-bold">{trail.priority1.length} soluções</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-foreground font-medium">Prioridade 2 - Média</span>
              </div>
              <span className="text-yellow-400 font-bold">{trail.priority2.length} soluções</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-foreground font-medium">Prioridade 3 - Baixa</span>
              </div>
              <span className="text-blue-400 font-bold">{trail.priority3.length} soluções</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dicas de Implementação */}
      <Card className="card-onboarding">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Estratégia de Implementação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Recomendações para começar:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">•</span>
                  Comece pela solução de maior score na Prioridade 1
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  Implemente uma solução por vez para garantir qualidade
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  Monitore resultados antes de passar para a próxima
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Dicas de sucesso:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">•</span>
                  Reserve tempo adequado para cada implementação
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 mt-0.5">•</span>
                  Documente o processo e resultados obtidos
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  Ajuste conforme sua realidade específica
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data de geração */}
      <div className="text-center text-sm text-muted-foreground">
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