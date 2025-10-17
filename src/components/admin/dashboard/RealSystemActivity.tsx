
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
        return <UserPlus className="h-5 w-5 text-operational" />;
      case 'implementações ativas':
        return <Zap className="h-5 w-5 text-warning" />;
      case 'implementações concluídas':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'atividade do fórum':
        return <MessageSquare className="h-5 w-5 text-strategy" />;
      case 'usuários ativos':
        return <Activity className="h-5 w-5 text-success" />;
      default:
        return <TrendingUp className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-system-healthy';
      case 'warning': return 'text-system-warning';
      case 'critical': return 'text-system-critical';
      default: return 'text-muted-foreground';
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
    <div className="aurora-glass rounded-xl aurora-hover-scale">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
              <h3 className="text-xl font-bold aurora-text-gradient">
                Atividade dos Últimos {periodLabel}
              </h3>
            </div>
            <p className="text-muted-foreground">
              Principais métricas de atividade para o período selecionado
            </p>
          </div>
          <div className="flex items-center gap-3 aurora-glass px-4 py-2 rounded-lg">
            <div className={`w-2 h-2 rounded-full aurora-glow ${
              activityData.systemHealth === 'healthy' ? 'bg-system-healthy' :
              activityData.systemHealth === 'warning' ? 'bg-system-warning' : 'bg-system-critical'
            }`}></div>
            <span className="text-sm font-medium">Status:</span>
            <span className={`font-bold ${getHealthColor(activityData.systemHealth)}`}>
              {getHealthLabel(activityData.systemHealth)}
            </span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Última atualização: {new Date(activityData.lastUpdated).toLocaleString('pt-BR')}
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        {activityData.recentActivities.length > 0 ? (
          activityData.recentActivities.map((activity, index) => (
            <div 
              key={`${activity.type}-${activityData.timeRange}-${index}`} 
              className="aurora-glass rounded-lg p-4 transition-smooth"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg gradient-aurora-card">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{activity.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.period}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold aurora-text-gradient">
                    {activity.count.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="aurora-glass rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Activity className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h4 className="text-lg font-semibold mb-2">Nenhuma atividade encontrada</h4>
            <p className="text-muted-foreground text-sm">
              Tente selecionar um período maior ou aguarde mais atividade dos usuários
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
