import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  Star, 
  Zap,
  Calendar
} from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';

interface Activity {
  id: string;
  type: 'completion' | 'start' | 'progress' | 'achievement';
  title: string;
  description?: string;
  date: string;
  metadata?: {
    solution?: string;
    module?: number;
    achievement?: string;
  };
}

interface ActivityWidgetProps {
  activities: Activity[];
  isLoading?: boolean;
}

export const ActivityWidget = ({ activities, isLoading = false }: ActivityWidgetProps) => {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'completion':
        return <CheckCircle className="h-4 w-4 text-system-healthy" />;
      case 'start':
        return <Zap className="h-4 w-4 text-operational" />;
      case 'progress':
        return <Clock className="h-4 w-4 text-status-warning" />;
      case 'achievement':
        return <Star className="h-4 w-4 text-status-warning" />;
      default:
        return <Calendar className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'completion':
        return 'bg-system-healthy/10 border-system-healthy/20';
      case 'start':
        return 'bg-operational/10 border-operational/20';
      case 'progress':
        return 'bg-status-warning/10 border-status-warning/20';
      case 'achievement':
        return 'bg-status-warning/10 border-status-warning/20';
      default:
        return 'bg-muted/10 border-border';
    }
  };

  const getActivityBadge = (type: Activity['type']) => {
    switch (type) {
      case 'completion':
        return <Badge className="bg-system-healthy text-white text-xs">Concluído</Badge>;
      case 'start':
        return <Badge className="bg-operational text-white text-xs">Iniciado</Badge>;
      case 'progress':
        return <Badge variant="outline" className="border-status-warning text-status-warning text-xs">Progresso</Badge>;
      case 'achievement':
        return <Badge className="bg-status-warning text-white text-xs">Conquista</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 animate-pulse">
                <div className="h-4 w-4 bg-muted rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-md">
          {activities.length > 0 ? (
            activities.slice(0, 5).map((activity) => (
              <div 
                key={activity.id} 
                className={`flex items-start gap-3 p-3 rounded-lg border ${getActivityColor(activity.type)} hover:bg-opacity-80 transition-all duration-200`}
              >
                <div className="mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm leading-tight">
                        {activity.title}
                      </h4>
                      {activity.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {activity.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(activity.date)}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {getActivityBadge(activity.type)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <h3 className="font-medium text-sm mb-1">Nenhuma atividade recente</h3>
              <p className="text-xs text-muted-foreground">
                Suas atividades aparecerão aqui conforme você usar a plataforma
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};