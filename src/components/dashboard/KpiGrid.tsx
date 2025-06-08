
import { FC, memo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle, 
  Clock, 
  Target, 
  TrendingUp,
  PlayCircle,
  Award,
  Zap
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
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} variant="elevated" className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-6 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: "Projetos Concluídos",
      value: completed,
      icon: CheckCircle,
      variant: "success" as const,
      description: "Implementações finalizadas",
      gradient: "from-success/10 to-success/5",
      iconBg: "bg-success/10",
      iconColor: "text-success"
    },
    {
      title: "Em Andamento",
      value: inProgress,
      icon: PlayCircle,
      variant: "warning" as const,
      description: "Projetos ativos",
      gradient: "from-warning/10 to-warning/5",
      iconBg: "bg-warning/10",
      iconColor: "text-warning"
    },
    {
      title: "Total Disponível",
      value: total,
      icon: Target,
      variant: "info" as const,
      description: "Soluções na plataforma",
      gradient: "from-primary/10 to-accent/10",
      iconBg: "bg-primary/10",
      iconColor: "text-primary"
    }
  ];

  const getCompletionRate = () => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Grid principal de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          
          return (
            <Card 
              key={kpi.title}
              variant="elevated" 
              className={`overflow-hidden hover-lift transition-all duration-300 bg-gradient-to-br ${kpi.gradient} border-l-4 border-l-${kpi.variant}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl transition-all group-hover:scale-110 ${kpi.iconBg}`}>
                      <Icon className={`h-6 w-6 ${kpi.iconColor}`} />
                    </div>
                    <div>
                      <Text variant="caption" textColor="secondary" className="font-medium uppercase tracking-wide">
                        {kpi.title}
                      </Text>
                      <Text variant="body-small" textColor="tertiary">
                        {kpi.description}
                      </Text>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <Text variant="display" textColor="primary" className="font-bold">
                    {kpi.value}
                  </Text>
                  
                  {kpi.title === "Projetos Concluídos" && total > 0 && (
                    <Badge variant={kpi.variant} size="sm">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {getCompletionRate()}%
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Card de resumo da performance */}
      {total > 0 && (
        <Card variant="elevated" className="p-6 bg-gradient-to-r from-accent/5 to-primary/5 border-accent/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-2xl">
                <Award className="h-6 w-6 text-accent" />
              </div>
              <div>
                <Text variant="card" textColor="primary" className="font-semibold mb-1">
                  Sua Performance
                </Text>
                <Text variant="body" textColor="secondary">
                  Você completou {getCompletionRate()}% das soluções disponíveis
                </Text>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-2">
              <Badge variant="accent" size="lg">
                <Zap className="h-4 w-4 mr-2" />
                {completed > 0 ? "Ativo" : "Iniciante"}
              </Badge>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
});

KpiGrid.displayName = 'KpiGrid';
