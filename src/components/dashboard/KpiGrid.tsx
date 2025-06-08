
import { FC, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle, 
  Clock, 
  Target, 
  TrendingUp,
  Sparkles,
  Lightbulb
} from "lucide-react";

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
      title: "Soluções Implementadas",
      value: completed,
      icon: CheckCircle,
      variant: "success" as const,
      description: "Projetos concluídos com sucesso"
    },
    {
      title: "Em Desenvolvimento",
      value: inProgress,
      icon: Clock,
      variant: "warning" as const,
      description: "Projetos em andamento"
    },
    {
      title: "Taxa de Conclusão",
      value: `${completionRate}%`,
      icon: Target,
      variant: "info" as const,
      description: "Percentual de projetos finalizados"
    },
    {
      title: "Potencial de Crescimento",
      value: total - completed,
      icon: TrendingUp,
      variant: "accent" as const,
      description: "Oportunidades disponíveis"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} variant="elevated" className="p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-full" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        const iconColors = {
          success: "text-success bg-success/10",
          warning: "text-warning bg-warning/10",
          info: "text-info bg-info/10",
          accent: "text-accent bg-accent/10"
        };

        return (
          <Card 
            key={kpi.title} 
            variant="elevated" 
            className="group hover-lift transition-all duration-300"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Header com ícone */}
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${iconColors[kpi.variant]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <Text variant="caption" textColor="secondary" className="font-medium">
                    {kpi.title}
                  </Text>
                </div>
                
                {/* Valor principal */}
                <div className="space-y-1">
                  <Text variant="heading" textColor="primary" className="text-2xl font-bold">
                    {kpi.value}
                  </Text>
                  <Text variant="body-small" textColor="tertiary">
                    {kpi.description}
                  </Text>
                </div>
                
                {/* Sparkle decoration */}
                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Sparkles className="h-4 w-4 text-primary" />
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
