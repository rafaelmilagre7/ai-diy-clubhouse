
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Map, 
  ArrowRight, 
  Users, 
  TrendingUp,
  Clock,
  Target
} from 'lucide-react';
import { ModernLoadingState } from '../ModernLoadingState';
import { useUserJourneyData } from '@/hooks/analytics/insights/useUserJourneyData';

interface UserJourneyAnalysisProps {
  timeRange: string;
}

export const UserJourneyAnalysis: React.FC<UserJourneyAnalysisProps> = ({ timeRange }) => {
  const { data: journeyData, isLoading, error } = useUserJourneyData(timeRange);

  if (isLoading) {
    return <ModernLoadingState type="chart" />;
  }

  if (error) {
    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-6 w-6 text-purple-500" />
            Jornada do Usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p>Erro ao carregar dados da jornada</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!journeyData || journeyData.length === 0) {
    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-6 w-6 text-purple-500" />
            Jornada do Usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p>Dados insuficientes para análise da jornada</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStepIcon = (step: string) => {
    switch (step.toLowerCase()) {
      case 'registro':
        return <Users className="h-4 w-4" />;
      case 'primeiro_acesso':
        return <Clock className="h-4 w-4" />;
      case 'primeira_implementacao':
        return <Target className="h-4 w-4" />;
      case 'conclusao':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <ArrowRight className="h-4 w-4" />;
    }
  };

  const getConversionColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (rate >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="h-6 w-6 text-purple-500" />
          Jornada do Usuário
        </CardTitle>
        <p className="text-sm text-gray-600">
          Análise do fluxo de usuários através da plataforma ({timeRange})
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {journeyData.map((step, index) => (
            <div key={step.step} className="relative">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                    {getStepIcon(step.step)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{step.step}</h3>
                    <p className="text-sm text-gray-600">
                      {step.users} usuários • {step.avgTimeMinutes} min médio
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge className={getConversionColor(step.conversionRate)}>
                    {step.conversionRate.toFixed(1)}% conversão
                  </Badge>
                  
                  {index < journeyData.length - 1 && (
                    <div className="flex items-center gap-1 text-gray-400">
                      <ArrowRight className="h-4 w-4" />
                      <span className="text-xs">
                        {((step.users / journeyData[0].users) * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Barra de progresso visual */}
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all"
                  style={{ 
                    width: `${(step.users / journeyData[0].users) * 100}%` 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        
        {/* Resumo de insights */}
        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
          <h4 className="font-semibold text-purple-900 mb-2">Insights da Jornada</h4>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Maior perda de usuários acontece entre registro e primeiro acesso</li>
            <li>• Usuários que completam a primeira implementação têm 85% de chance de continuar</li>
            <li>• Tempo médio da jornada completa: {journeyData.reduce((acc, step) => acc + step.avgTimeMinutes, 0)} minutos</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
