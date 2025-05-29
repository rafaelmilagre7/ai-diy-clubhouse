
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";
import { useDashboardProgress } from "@/hooks/useDashboardProgress";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, BookOpen, Award, Clock } from "lucide-react";

export const DashboardStats = () => {
  const { profile } = useAuth();
  const { data: dashboardData, isLoading } = useDashboardProgress();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Soluções Implementadas",
      value: dashboardData?.completedSolutions || 0,
      icon: TrendingUp,
      description: "soluções concluídas"
    },
    {
      title: "Soluções em Andamento",
      value: dashboardData?.activeSolutions || 0,
      icon: BookOpen,
      description: "em progresso"
    },
    {
      title: "Conquistas",
      value: dashboardData?.achievements || 0,
      icon: Award,
      description: "badges conquistadas"
    },
    {
      title: "Tempo Total",
      value: `${Math.round((dashboardData?.totalTimeSpent || 0) / 60)}h`,
      icon: Clock,
      description: "de aprendizado"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
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
  );
};
