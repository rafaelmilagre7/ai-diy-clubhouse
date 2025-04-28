
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Clock, Users, Award } from 'lucide-react';
import { useRealtimeStats } from '@/hooks/analytics/useRealtimeStats';
import { Skeleton } from '@/components/ui/skeleton';

export const RealtimeStats = () => {
  const { data: stats, isLoading, error } = useRealtimeStats();
  
  if (isLoading) {
    return <RealtimeStatsSkeleton />;
  }

  if (error || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Erro ao Carregar"
          value="--"
          icon={<Activity className="h-5 w-5" />}
          description="Tente recarregar a página"
        />
      </div>
    );
  }

  const statItems = [
    {
      title: "Usuários Ativos",
      value: stats.activeUsers,
      icon: <Users className="h-5 w-5" />,
      description: "Nos últimos 7 dias"
    },
    {
      title: "Total de Usuários",
      value: stats.totalUsers,
      icon: <Users className="h-5 w-5" />,
      description: "Registrados na plataforma"
    },
    {
      title: "Implementações",
      value: stats.implementationsToday,
      icon: <Award className="h-5 w-5" />,
      description: "Iniciadas hoje"
    },
    {
      title: "Taxa de Conclusão",
      value: `${stats.averageCompletionRate}%`,
      icon: <Activity className="h-5 w-5" />,
      description: "Média geral"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <StatCard
          key={index}
          title={item.title}
          value={item.value}
          icon={item.icon}
          description={item.description}
        />
      ))}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
}

const StatCard = ({ title, value, icon, description }: StatCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-foreground mt-1">
              {value}
            </CardDescription>
          </div>
          <div className="h-8 w-8 bg-primary/10 flex items-center justify-center rounded-md">
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

const RealtimeStatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array(4).fill(null).map((_, index) => (
      <Card key={index} className="animate-pulse">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <Skeleton className="h-4 w-24 bg-muted" />
              <Skeleton className="h-8 w-16 bg-muted mt-1" />
            </div>
            <Skeleton className="h-8 w-8 rounded-md bg-muted" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-36 bg-muted" />
        </CardContent>
      </Card>
    ))}
  </div>
);
