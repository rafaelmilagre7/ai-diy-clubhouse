import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Award, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
interface PerformanceMetric {
  name: string;
  current: number;
  target: number;
  weight: number;
  trend: 'up' | 'down' | 'stable';
  status: 'excellent' | 'good' | 'warning' | 'critical';
}
interface PerformanceScoreProps {
  timeRange: string;
}
export const PerformanceScore: React.FC<PerformanceScoreProps> = ({
  timeRange
}) => {
  const metrics: PerformanceMetric[] = [{
    name: 'Crescimento de Usuários',
    current: 85,
    target: 100,
    weight: 0.3,
    trend: 'up',
    status: 'good'
  }, {
    name: 'Taxa de Conclusão',
    current: 68,
    target: 75,
    weight: 0.25,
    status: 'warning',
    trend: 'stable'
  }, {
    name: 'Engajamento Médio',
    current: 92,
    target: 80,
    weight: 0.2,
    trend: 'up',
    status: 'excellent'
  }, {
    name: 'Retenção (30 dias)',
    current: 73,
    target: 80,
    weight: 0.25,
    trend: 'down',
    status: 'warning'
  }];

  // Calcular score geral ponderado
  const overallScore = Math.round(metrics.reduce((acc, metric) => {
    const score = Math.min(100, metric.current / metric.target * 100);
    return acc + score * metric.weight;
  }, 0));
  const getScoreStatus = (score: number) => {
    if (score >= 90) return {
      status: 'excellent',
      color: 'text-green-600',
      bg: 'bg-green-50'
    };
    if (score >= 75) return {
      status: 'good',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    };
    if (score >= 60) return {
      status: 'warning',
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    };
    return {
      status: 'critical',
      color: 'text-red-600',
      bg: 'bg-red-50'
    };
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <Award className="h-5 w-5 text-green-600" />;
      case 'good':
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Target className="h-5 w-5 text-gray-600" />;
    }
  };
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-400" />;
    }
  };
  const scoreInfo = getScoreStatus(overallScore);
  return <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-6 w-6 text-blue-500" />
          Performance Score
        </CardTitle>
        <p className="text-sm text-gray-600">
          Avaliação geral da performance da plataforma
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Geral */}
        <div className={cn("p-6 rounded-xl border-2", scoreInfo.bg)}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {getStatusIcon(scoreInfo.status)}
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{overallScore}</h3>
                <p className="text-sm text-gray-600">Score Geral</p>
              </div>
            </div>
            <Badge className={cn("text-sm", scoreInfo.color, scoreInfo.bg)}>
              {scoreInfo.status.toUpperCase()}
            </Badge>
          </div>
          <Progress value={overallScore} className="h-3" indicatorClassName={cn(overallScore >= 90 && "bg-green-500", overallScore >= 75 && overallScore < 90 && "bg-blue-500", overallScore >= 60 && overallScore < 75 && "bg-orange-500", overallScore < 60 && "bg-red-500")} />
        </div>

        {/* Métricas Detalhadas */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Métricas Detalhadas</h4>
          {metrics.map((metric, index) => <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-zinc-50">{metric.name}</span>
                  {getTrendIcon(metric.trend)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {metric.current}% / {metric.target}%
                  </span>
                  <Badge variant="outline" className={cn("text-xs", metric.status === 'excellent' && "border-green-200 text-green-700", metric.status === 'good' && "border-blue-200 text-blue-700", metric.status === 'warning' && "border-orange-200 text-orange-700", metric.status === 'critical' && "border-red-200 text-red-700")}>
                    {metric.status}
                  </Badge>
                </div>
              </div>
              <Progress value={metric.current / metric.target * 100} className="h-2" indicatorClassName={cn(metric.status === 'excellent' && "bg-green-500", metric.status === 'good' && "bg-blue-500", metric.status === 'warning' && "bg-orange-500", metric.status === 'critical' && "bg-red-500")} />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Peso: {(metric.weight * 100).toFixed(0)}%</span>
                <span>Meta: {metric.target}%</span>
              </div>
            </div>)}
        </div>
      </CardContent>
    </Card>;
};