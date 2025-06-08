
import { FC, memo } from "react";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { CheckCircle, Clock, Target, TrendingUp } from "lucide-react";

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
      title: "Implementações Concluídas",
      value: completed,
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
      borderColor: "border-success/20"
    },
    {
      title: "Em Andamento",
      value: inProgress,
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
      borderColor: "border-warning/20"
    },
    {
      title: "Taxa de Conclusão",
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: "text-info",
      bgColor: "bg-info/10",
      borderColor: "border-info/20"
    },
    {
      title: "Total de Soluções",
      value: total,
      icon: Target,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="p-6 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-surface-hover rounded-lg" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-surface-hover rounded w-3/4" />
                <div className="h-6 bg-surface-hover rounded w-1/2" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
      {kpis.map((kpi, index) => (
        <Card
          key={kpi.title}
          variant="interactive"
          className="p-6 hover:scale-105 transition-transform duration-200"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-center space-x-4">
            <div className={`
              w-12 h-12 rounded-lg flex items-center justify-center
              ${kpi.bgColor} ${kpi.borderColor} border
            `}>
              <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
            </div>
            <div className="space-y-1">
              <Text variant="caption" textColor="tertiary">
                {kpi.title}
              </Text>
              <Text variant="card" textColor="primary" weight="bold">
                {kpi.value}
              </Text>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
});

KpiGrid.displayName = 'KpiGrid';
