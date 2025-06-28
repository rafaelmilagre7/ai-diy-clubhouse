
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Activity, Clock, User, Database } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SystemActivity {
  id: string;
  user_id: string;
  event_type: string;
  created_at: string;
  user_name?: string;
  event_description: string;
}

interface RealSystemActivityProps {
  activityData: {
    totalEvents: number;
    eventsByType: { type: string; count: number }[];
    userActivities: SystemActivity[];
  } | null;
  loading: boolean;
}

export const RealSystemActivity = ({ activityData, loading }: RealSystemActivityProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Atividade do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activityData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Atividade do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Dados de atividade não disponíveis para este período</p>
            <p className="text-sm text-muted-foreground mt-2">
              Configure o sistema de analytics para visualizar atividades
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getEventTypeBadgeColor = (eventType: string) => {
    switch (eventType) {
      case 'login':
        return 'bg-green-100 text-green-800';
      case 'view':
        return 'bg-blue-100 text-blue-800';
      case 'complete':
        return 'bg-purple-100 text-purple-800';
      case 'start':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Atividade do Sistema
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {activityData.totalEvents} eventos
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activityData.userActivities.length === 0 ? (
          <div className="text-center py-8">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma atividade encontrada para este período</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activityData.userActivities.slice(0, 10).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg border bg-card">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="text-xs">
                    {getUserInitials(activity.user_name || 'Usuário')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {activity.user_name || 'Usuário Desconhecido'}
                    </p>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getEventTypeBadgeColor(activity.event_type)}`}
                    >
                      {activity.event_type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {activity.event_description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), { 
                      addSuffix: true,
                      locale: ptBR 
                    })}
                  </p>
                </div>
              </div>
            ))}
            
            {activityData.eventsByType.length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Resumo por Tipo de Evento</h4>
                <div className="flex flex-wrap gap-2">
                  {activityData.eventsByType.slice(0, 6).map((event) => (
                    <Badge key={event.type} variant="outline" className="text-xs">
                      {event.type}: {event.count}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
