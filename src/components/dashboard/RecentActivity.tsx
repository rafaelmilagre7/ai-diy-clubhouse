
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Eye, Play, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const activities = [
  {
    id: 1,
    type: 'view',
    title: 'Visualizou "Automação de Atendimento com ChatGPT"',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
    icon: Eye
  },
  {
    id: 2,
    type: 'start',
    title: 'Iniciou implementação de "CRM com IA"',
    time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
    icon: Play
  },
  {
    id: 3,
    type: 'complete',
    title: 'Completou "Análise de Dados com IA"',
    time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
    icon: CheckCircle
  }
];

export const RecentActivity: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const IconComponent = activity.icon;
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <IconComponent className="h-5 w-5 text-viverblue mt-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200">
                    {activity.title}
                  </p>
                  <div className="flex items-center mt-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDistanceToNow(activity.time, { addSuffix: true, locale: ptBR })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
