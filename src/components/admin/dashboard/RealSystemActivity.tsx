
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Users, CheckCircle, AlertCircle, MessageSquare, BookOpen, MousePointer } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface RealSystemActivityProps {
  activityData: {
    totalLogins: number;
    newUsers: number;
    activeImplementations: number;
    completedSolutions: number;
    forumActivity: number;
    learningProgress: number;
    benefitClicks: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
    peakUsageHours: Array<{ hour: number; users: number }>;
    recentActivities: Array<{
      id: string;
      type: string;
      description: string;
      timestamp: string;
      user_id?: string;
    }>;
  };
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
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Calcular totalEvents e eventsByType a partir dos dados disponíveis
  const totalEvents = (activityData?.totalLogins || 0) + 
                     (activityData?.forumActivity || 0) + 
                     (activityData?.completedSolutions || 0) + 
                     (activityData?.activeImplementations || 0);

  const eventsByType = {
    login: activityData?.totalLogins || 0,
    forum: activityData?.forumActivity || 0,
    implementation: activityData?.completedSolutions || 0,
    learning: activityData?.learningProgress || 0,
    benefit: activityData?.benefitClicks || 0
  };

  const getHealthBadgeVariant = (health: string) => {
    switch (health) {
      case 'healthy': return 'default';
      case 'warning': return 'secondary';
      case 'critical': return 'destructive';
      default: return 'default';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'forum': return <MessageSquare className="h-4 w-4" />;
      case 'implementation': return <CheckCircle className="h-4 w-4" />;
      case 'learning': return <BookOpen className="h-4 w-4" />;
      case 'login': return <Users className="h-4 w-4" />;
      case 'benefit': return <MousePointer className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora mesmo';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    return `${Math.floor(diffInHours / 24)}d atrás`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Atividade do Sistema
            </CardTitle>
            <CardDescription>
              {totalEvents} eventos registrados • {activityData?.recentActivities?.length || 0} atividades recentes
            </CardDescription>
          </div>
          <Badge variant={getHealthBadgeVariant(activityData?.systemHealth || 'healthy')}>
            {activityData?.systemHealth === 'healthy' && 'Saudável'}
            {activityData?.systemHealth === 'warning' && 'Atenção'}
            {activityData?.systemHealth === 'critical' && 'Crítico'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{eventsByType.login}</div>
            <div className="text-xs text-muted-foreground">Logins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{eventsByType.implementation}</div>
            <div className="text-xs text-muted-foreground">Implementações</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{eventsByType.forum}</div>
            <div className="text-xs text-muted-foreground">Fórum</div>
          </div>
        </div>

        {/* Atividades recentes */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Atividades Recentes</h4>
          {activityData?.recentActivities?.length > 0 ? (
            activityData.recentActivities.slice(0, 8).map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-lg transition-colors">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(activity.timestamp)}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {activity.type}
                </Badge>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Nenhuma atividade recente registrada</p>
            </div>
          )}
        </div>

        {/* Horários de pico */}
        {activityData?.peakUsageHours && activityData.peakUsageHours.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="text-sm font-medium">Horários de Pico</h4>
            <div className="grid grid-cols-3 gap-2">
              {activityData.peakUsageHours.slice(0, 6).map((peak) => (
                <div key={peak.hour} className="text-center p-2 bg-muted/30 rounded">
                  <div className="text-sm font-medium">{peak.hour}:00</div>
                  <div className="text-xs text-muted-foreground">{peak.users} usuários</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
