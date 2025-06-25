
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Sparkles,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Database
} from 'lucide-react';
import { ModernLoadingState } from '../ModernLoadingState';
import { useAutoRecommendations } from '@/hooks/analytics/insights/useAutoRecommendations';

interface AutoRecommendationsProps {
  timeRange: string;
}

export const AutoRecommendations: React.FC<AutoRecommendationsProps> = ({ timeRange }) => {
  const { data: recommendations, isLoading, error } = useAutoRecommendations(timeRange);

  if (isLoading) {
    return <ModernLoadingState type="chart" />;
  }

  if (error) {
    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-amber-500" />
            Recomendações IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-center">
            <div className="space-y-2">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
              <p className="text-muted-foreground">Erro ao carregar recomendações</p>
              <p className="text-sm text-gray-500">{error.message}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-amber-500" />
            Recomendações IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-center">
            <div className="space-y-2">
              <Database className="h-8 w-8 text-gray-400 mx-auto" />
              <p className="text-muted-foreground">Dados insuficientes para gerar recomendações</p>
              <p className="text-sm text-gray-500">
                Aguardando mais atividade na plataforma para análise ({timeRange})
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance':
        return <TrendingUp className="h-4 w-4" />;
      case 'engagement':
        return <Users className="h-4 w-4" />;
      case 'content':
        return <BookOpen className="h-4 w-4" />;
      case 'user_experience':
        return <Sparkles className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: number) => {
    if (priority >= 80) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    } else if (priority >= 60) {
      return <Lightbulb className="h-4 w-4 text-yellow-500" />;
    } else {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-amber-500" />
          Recomendações IA
        </CardTitle>
        <p className="text-sm text-gray-600">
          Sugestões baseadas em análise de dados reais ({timeRange})
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.slice(0, 4).map((recommendation) => (
          <div 
            key={recommendation.id}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getTypeIcon(recommendation.type)}
                <h3 className="font-semibold text-gray-900">
                  {recommendation.title}
                </h3>
                {getPriorityIcon(recommendation.priority)}
              </div>
              <div className="flex gap-2">
                <Badge className={getImpactColor(recommendation.impact)}>
                  Impacto: {recommendation.impact}
                </Badge>
                <Badge className={getEffortColor(recommendation.effort)}>
                  Esforço: {recommendation.effort}
                </Badge>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-3">
              {recommendation.description}
            </p>
            
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Progresso atual (dados reais)</span>
                <span>
                  {recommendation.metrics.current.toFixed(1)}{recommendation.metrics.unit} / 
                  {recommendation.metrics.target}{recommendation.metrics.unit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ 
                    width: `${Math.min(100, (recommendation.metrics.current / recommendation.metrics.target) * 100)}%` 
                  }}
                />
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Ações Sugeridas:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                {recommendation.actionItems.slice(0, 3).map((action, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-gray-400 rounded-full" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
        
        {/* Aviso sobre dados reais */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700">
            <CheckCircle className="h-3 w-3 inline mr-1" />
            Todas as recomendações são baseadas exclusivamente em dados reais da plataforma. 
            Nenhuma métrica é simulada ou estimada.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
