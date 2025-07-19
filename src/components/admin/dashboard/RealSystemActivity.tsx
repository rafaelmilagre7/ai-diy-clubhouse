
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, TrendingUp, Users, FileText, MessageSquare, CheckCircle, UserPlus, Zap } from "lucide-react";

interface ActivityData {
  totalLogins: number;
  newUsers: number;
  activeImplementations: number;
  completedSolutions: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  recentActivities: Array<{
    type: string;
    count: number;
    period: string;
  }>;
  forumActivity: number;
  timeRange: string;
  lastUpdated: string;
}

interface RealSystemActivityProps {
  activityData: ActivityData;
  loading: boolean;
}

export const RealSystemActivity = ({ activityData, loading }: RealSystemActivityProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'novos usuários':
        return <UserPlus className="h-5 w-5 text-blue-500" />;
      case 'implementações ativas':
        return <Zap className="h-5 w-5 text-orange-500" />;
      case 'implementações concluídas':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'atividade do fórum':
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      case 'usuários ativos':
        return <Activity className="h-5 w-5 text-green-500" />;
      default:
        return <TrendingUp className="h-5 w-5 text-gray-500" />;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getHealthLabel = (health: string) => {
    switch (health) {
      case 'healthy': return 'Saudável';
      case 'warning': return 'Atenção';
      case 'critical': return 'Crítico';
      default: return 'Desconhecido';
    }
  };

  // Calcular período atual para o cabeçalho
  const periodDays = activityData.timeRange === '7d' ? 7 :
                    activityData.timeRange === '30d' ? 30 :
                    activityData.timeRange === '90d' ? 90 :
                    activityData.timeRange === '1y' ? 365 : 30;

  const periodLabel = periodDays === 7 ? '7 dias' :
                     periodDays === 30 ? '30 dias' :
                     periodDays === 90 ? '90 dias' :
                     periodDays === 365 ? '1 ano' : `${periodDays} dias`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Atividade dos Últimos {periodLabel}</CardTitle>
            <CardDescription>
              Principais métricas de atividade para o período selecionado
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <span className={`font-medium ${getHealthColor(activityData.systemHealth)}`}>
              {getHealthLabel(activityData.systemHealth)}
            </span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Última atualização: {new Date(activityData.lastUpdated).toLocaleString('pt-BR')}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {activityData.recentActivities.length > 0 ? (
          activityData.recentActivities.map((activity, index) => (
            <div key={`${activity.type}-${activityData.timeRange}-${index}`} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                {getActivityIcon(activity.type)}
                <div>
                  <p className="font-medium">{activity.type}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.period}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{activity.count.toLocaleString()}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma atividade encontrada para este período</p>
            <p className="text-sm mt-2">Tente selecionar um período maior ou aguarde mais atividade dos usuários</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
