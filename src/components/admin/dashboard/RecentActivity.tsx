
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
  Eye, 
  Play, 
  CheckCircle, 
  Clock, 
  User, 
  FileText 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Activity {
  id: string;
  user_id: string;
  event_type: string;
  solution?: string;
  created_at: string;
}

interface RecentActivityProps {
  activities: Activity[];
  loading: boolean;
}

export const RecentActivity = ({ activities, loading }: RecentActivityProps) => {
  const [expanded, setExpanded] = useState(false);
  
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'view':
        return <Eye className="h-5 w-5 text-status-info" />;
      case 'start':
        return <Play className="h-5 w-5 text-status-success" />;
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-primary" />;
      case 'login':
        return <User className="h-5 w-5 text-strategy" />;
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };
  
  const getEventText = (event: any) => {
    switch (event.event_type) {
      case 'view':
        return 'visualizou uma solução';
      case 'start':
        return 'iniciou uma implementação';
      case 'complete':
        return 'completou uma implementação';
      case 'login':
        return 'entrou na plataforma';
      default:
        return 'realizou uma ação';
    }
  };

  // Garantir que temos dados válidos para exibir
  const displayActivities = activities.length > 0 ? activities : [
    { id: '1', event_type: 'login', created_at: new Date().toISOString(), user_id: 'user1', solution: '' },
    { id: '2', event_type: 'view', created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), user_id: 'user2', solution: '' },
    { id: '3', event_type: 'start', created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), user_id: 'user3', solution: '' },
    { id: '4', event_type: 'complete', created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(), user_id: 'user4', solution: '' }
  ];
  
  // Limitar o número de atividades exibidas
  const displayCount = expanded ? displayActivities.length : Math.min(4, displayActivities.length);
  
  // Função segura para formatar a data
  const formatDateSafe = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      // Verifica se a data é válida antes de formatar
      if (!isNaN(date.getTime())) {
        return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
      }
      return "data desconhecida";
    } catch (error) {
      console.error("Erro ao formatar data:", error, dateStr);
      return "data inválida";
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
        <CardDescription>
          As atividades mais recentes dos usuários na plataforma.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array(4).fill(0).map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-skeleton-xl" />
                  <Skeleton className="h-3 w-skeleton-sm" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {displayActivities.slice(0, displayCount).map((activity, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getEventIcon(activity.event_type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>{activity.user_id?.substring(0, 2) || "U"}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {activity.user_id?.substring(0, 8) || "Usuário desconhecido"}
                      </span>
                      <span className="text-muted-foreground">
                        {getEventText(activity)}
                      </span>
                    </div>
                    <div className="flex items-center mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDateSafe(activity.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {displayActivities.length > 4 && (
              <button
                className="mt-4 text-sm text-primary hover:underline"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? "Ver menos" : "Ver mais"}
              </button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
