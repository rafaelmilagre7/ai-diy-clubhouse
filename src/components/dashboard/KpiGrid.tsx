
import { FC, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Target, CheckCircle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface KpiGridProps {
  completed: number;
  inProgress: number;
  total: number;
  isLoading?: boolean;
}

export const KpiGrid: FC<KpiGridProps> = memo(({ 
  completed, 
  inProgress, 
  total, 
  isLoading = false 
}) => {
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const kpis = [
    {
      title: "Soluções Completadas",
      value: completed,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      borderColor: "border-emerald-200 dark:border-emerald-800"
    },
    {
      title: "Em Andamento",
      value: inProgress,
      icon: Clock,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50 dark:bg-cyan-900/20",
      borderColor: "border-cyan-200 dark:border-cyan-800"
    },
    {
      title: "Taxa de Conclusão",
      value: `${completionRate}%`,
      icon: Target,
      color: "text-teal-600",
      bgColor: "bg-teal-50 dark:bg-teal-900/20",
      borderColor: "border-teal-200 dark:border-teal-800"
    },
    {
      title: "Total Disponível",
      value: total,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-card/50 border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 bg-muted" />
                  <Skeleton className="h-8 w-16 bg-muted" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card 
            key={kpi.title} 
            className={`${kpi.bgColor} ${kpi.borderColor} border backdrop-blur-sm hover:scale-105 transition-all duration-200 animate-fade-in`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {kpi.title}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {kpi.value}
                  </p>
                </div>
                <div className={`${kpi.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});

KpiGrid.displayName = 'KpiGrid';
