
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Mail, MessageSquare, Send, Users, TrendingUp, Clock } from 'lucide-react';
import { useCommunications } from '@/hooks/admin/useCommunications';

export const CommunicationStats = () => {
  const { communications } = useCommunications();

  // Calcular estatísticas reais
  const stats = React.useMemo(() => {
    const total = communications.length;
    const sent = communications.filter(c => c.status === 'sent').length;
    const draft = communications.filter(c => c.status === 'draft').length;
    const scheduled = communications.filter(c => c.status === 'scheduled').length;
    
    // Calcular comunicações enviadas no último mês
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const sentLastMonth = communications.filter(c => 
      c.status === 'sent' && 
      c.sent_at && 
      new Date(c.sent_at) >= lastMonth
    ).length;

    return {
      total,
      sent,
      draft,
      scheduled,
      sentLastMonth
    };
  }, [communications]);

  const statCards = [
    {
      title: 'Total de Comunicações',
      value: stats.total,
      icon: MessageSquare,
      description: 'Comunicações criadas no sistema',
      trend: null
    },
    {
      title: 'Comunicações Enviadas',
      value: stats.sent,
      icon: Send,
      description: 'Comunicações já enviadas',
      trend: stats.sentLastMonth > 0 ? `+${stats.sentLastMonth} no último mês` : null
    },
    {
      title: 'Rascunhos',
      value: stats.draft,
      icon: Mail,
      description: 'Comunicações em rascunho',
      trend: null
    },
    {
      title: 'Agendadas',
      value: stats.scheduled,
      icon: Clock,
      description: 'Comunicações agendadas',
      trend: null
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
              {stat.trend && (
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.trend}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
