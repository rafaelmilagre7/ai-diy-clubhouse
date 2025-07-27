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
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'start':
        return <Zap className="h-4 w-4 text-blue-500" />;
      case 'progress':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'achievement':
        return <Star className="h-4 w-4 text-yellow-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'completion':
        return 'bg-green-500/10 border-green-500/20';
      case 'start':
        return 'bg-blue-500/10 border-blue-500/20';
      case 'progress':
        return 'bg-orange-500/10 border-orange-500/20';
      case 'achievement':
        return 'bg-yellow-500/10 border-yellow-500/20';
      default:
        return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  const getActivityBadge = (type: Activity['type']) => {
    switch (type) {
      case 'completion':
        return <Badge className="bg-green-500 text-white text-xs">Concluído</Badge>;
      case 'start':
        return <Badge className="bg-blue-500 text-white text-xs">Iniciado</Badge>;
      case 'progress':
        return <Badge variant="outline" className="border-orange-500 text-orange-500 text-xs">Progresso</Badge>;
      case 'achievement':
        return <Badge className="bg-yellow-500 text-black text-xs">Conquista</Badge>;
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
        <div className="space-y-3">
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