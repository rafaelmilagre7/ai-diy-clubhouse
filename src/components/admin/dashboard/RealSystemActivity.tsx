
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Activity, 
  Eye, 
  Play, 
  CheckCircle, 
  Clock, 
  User,
  BarChart3,
  TrendingUp
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarInitials } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface SystemActivity {
  id: string;
  user_id: string;
  event_type: string;
  created_at: string;
  user_name?: string;
  event_description: string;
}

interface ActivitySummary {
  totalEvents: number;
  eventsByType: { type: string; count: number }[];
  userActivities: SystemActivity[];
}

interface RealSystemActivityProps {
  activityData: ActivitySummary;
  loading: boolean;
}

export const RealSystemActivity = ({ activityData, loading }: RealSystemActivityProps) => {
  const [expanded, setExpanded] = useState(false);
  
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'solution_view':
      case 'lesson_view':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'solution_start':
        return <Play className="h-4 w-4 text-green-500" />;
      case 'solution_complete':
      case 'lesson_complete':
        return <CheckCircle className="h-4 w-4 text-purple-500" />;
      case 'login':
        return <User className="h-4 w-4 text-indigo-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getEventBadgeVariant = (eventType: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (eventType) {
      case 'solution_complete':
      case 'lesson_complete':
        return 'default';
      case 'solution_start':
        return 'secondary';
      case 'login':
        return 'outline';
      default:
        return 'outline';
    }
  };
  
  // Formatação segura de data
  const formatDateSafe = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
      }
      return "data desconhecida";
    } catch (error) {
      return "data inválida";
    }
  };
  
  // Limitar atividades exibidas
  const displayCount = expanded ? activityData.userActivities.length : Math.min(8, activityData.userActivities.length);
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card de atividades */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array(6).fill(0).map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-3 w-[120px]" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Card de resumo */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Atividades Recentes */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Atividade do Sistema
              </CardTitle>
              <CardDescription>
                Últimas {activityData.userActivities.length} atividades registradas na plataforma
              </CardDescription>
            </div>
            <Badge variant="outline">
              {activityData.totalEvents} eventos
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {activityData.userActivities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma atividade registrada no período selecionado</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {activityData.userActivities.slice(0, displayCount).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg border bg-card">
                    <div className="flex-shrink-0 mt-1">
                      {getEventIcon(activity.event_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-6 w-6">
                          <AvatarInitials name={activity.user_name || "U"} />
                          <AvatarFallback>{(activity.user_name || "U").substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm truncate">
                          {activity.user_name || 'Usuário desconhecido'}
                        </span>
                        <Badge variant={getEventBadgeVariant(activity.event_type)} className="text-xs">
                          {activity.event_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {activity.event_description}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDateSafe(activity.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {activityData.userActivities.length > 8 && (
                <button
                  className="mt-4 text-sm text-primary hover:underline w-full text-center"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? "Ver menos" : `Ver mais ${activityData.userActivities.length - 8} atividades`}
                </button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Resumo de Eventos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Eventos por Tipo
          </CardTitle>
          <CardDescription>
            Distribuição das atividades no período
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activityData.eventsByType.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Sem dados disponíveis</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activityData.eventsByType.map((event, index) => (
                <div key={event.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getEventIcon(event.type)}
                    <span className="text-sm font-medium capitalize">
                      {event.type.replace('_', ' ')}
                    </span>
                  </div>
                  <Badge variant="secondary">
                    {event.count}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
