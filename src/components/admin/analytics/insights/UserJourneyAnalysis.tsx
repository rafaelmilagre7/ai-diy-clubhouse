
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  ArrowRight, 
  Clock, 
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserJourneyData } from '@/hooks/analytics/insights/useUserJourneyData';
import LoadingScreen from '@/components/common/LoadingScreen';

interface UserJourneyAnalysisProps {
  timeRange: string;
}

interface JourneyStepDisplay {
  step: string;
  users: number;
  completion_rate: number;
  average_time: string;
}

export const UserJourneyAnalysis: React.FC<UserJourneyAnalysisProps> = ({
  timeRange
}) => {
  const { data: journeyData, isLoading, error } = useUserJourneyData(timeRange);

  if (isLoading) {
    return <LoadingScreen variant="modern" type="chart" fullScreen={false} />;
  }

  if (error) {
    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-6 w-6" />
            Erro ao Carregar Jornada do Usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Erro ao carregar dados da jornada</p>
        </CardContent>
      </Card>
    );
  }

  // Converter dados para formato esperado pelo componente
  const displayData: JourneyStepDisplay[] = journeyData?.map(step => ({
    step: step.step,
    users: step.users,
    completion_rate: step.conversionRate,
    average_time: step.avgTimeMinutes ? `${step.avgTimeMinutes} min` : 'N/A'
  })) || [];

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-blue-500" />
          Jornada do Usuário
        </CardTitle>
        <p className="text-sm text-gray-600">
          Análise do funil de conversão ({timeRange})
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayData.map((step, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-50">
                {index === 0 && <Users className="h-4 w-4" />}
                {index > 0 && index < displayData.length - 1 && <ArrowRight className="h-4 w-4" />}
                {index === displayData.length - 1 && <Target className="h-4 w-4" />}
              </div>
              <div>
                <p className="font-medium text-gray-900">{step.step}</p>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Tempo médio: {step.average_time}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">{step.users} Usuários</p>
              <div className="flex items-center justify-end gap-1">
                <Progress value={step.completion_rate} className="w-24" />
                <span className="text-sm text-gray-600">{step.completion_rate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
