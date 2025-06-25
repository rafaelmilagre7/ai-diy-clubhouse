
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, BookOpen, Wrench, Calendar, Activity, CheckCircle } from 'lucide-react';
import { useAdminAnalytics } from '@/hooks/admin/useAdminAnalytics';
import LoadingScreen from '@/components/common/LoadingScreen';

export const RealAnalyticsDashboard = () => {
  const { data, loading, refetch } = useAdminAnalytics();

  if (loading) {
    return <LoadingScreen message="Carregando analytics..." />;
  }

  const stats = [
    {
      title: 'Total de Usuários',
      value: data.totalUsers,
      icon: Users,
      description: `${data.activeUsers} ativos nos últimos 30 dias`
    },
    {
      title: 'Total de Soluções',
      value: data.totalSolutions,
      icon: BookOpen,
      description: `${data.publishedSolutions} publicadas`
    },
    {
      title: 'Ferramentas',
      value: data.totalTools,
      icon: Wrench,
      description: 'Ferramentas cadastradas'
    },
    {
      title: 'Eventos',
      value: data.totalEvents,
      icon: Calendar,
      description: 'Eventos criados'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics da Plataforma</h1>
          <p className="text-muted-foreground">
            Visão geral dos dados em tempo real
          </p>
        </div>
        <Button onClick={refetch} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Atividade Recente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentActivity.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhuma atividade recente encontrada.
            </p>
          ) : (
            <div className="space-y-3">
              {data.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg border">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(activity.timestamp).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
