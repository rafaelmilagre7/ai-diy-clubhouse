import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, User, Clock } from "lucide-react";
import { DataStatusIndicator } from "./DataStatusIndicator";

interface RecentActivity {
  id: string;
  user_id: string;
  event_type: string;
  solution: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

interface RecentActivitiesCardProps {
  activities: RecentActivity[];
  loading?: boolean;
  error?: string | null;
}

export const RecentActivitiesCard = ({ 
  activities, 
  loading = false, 
  error = null 
}: RecentActivitiesCardProps) => {
  const getEventTypeColor = (eventType: string) => {
    switch (eventType.toLowerCase()) {
      case 'login':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'logout':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'view':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'start':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'complete':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType.toLowerCase()) {
      case 'login':
      case 'logout':
        return <User className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    if (diffInDays < 7) return `${diffInDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Atividades Recentes
          </CardTitle>
          <DataStatusIndicator 
            isDataReal={activities.length > 0 && !error}
            loading={loading}
            error={error}
            isEmpty={activities.length === 0 && !loading}
            className="text-xs"
          />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-6 text-sm text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Erro ao carregar atividades</p>
            <p className="text-xs text-red-500 mt-1">{error}</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhuma atividade recente</p>
            <p className="text-xs">As atividades aparecerão aqui conforme os usuários interagem com o sistema</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.slice(0, 8).map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <Badge 
                    variant="secondary" 
                    className={`gap-1 text-xs ${getEventTypeColor(activity.event_type)}`}
                  >
                    {getEventTypeIcon(activity.event_type)}
                    {activity.event_type}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {activity.user_name || 'Usuário'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {activity.solution || 'Sistema'}
                    </p>
                    {activity.user_email && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                        {activity.user_email}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 ml-2">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatRelativeTime(activity.created_at)}
                </div>
              </div>
            ))}
            
            {activities.length > 8 && (
              <div className="text-center pt-2 text-xs text-muted-foreground">
                +{activities.length - 8} atividades a mais
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};