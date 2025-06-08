
import { FC, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, CheckCircle, Clock, Target, Zap, Award } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const progressRate = total > 0 ? Math.round((inProgress / total) * 100) : 0;

  const kpiCards = [
    {
      title: "Soluções Completadas",
      value: completed,
      icon: CheckCircle,
      color: "success",
      bgGradient: "from-success/10 to-success/5",
      borderColor: "border-success/20",
      iconBg: "bg-success/10",
      iconColor: "text-success",
      badge: `${completionRate}% concluído`,
      badgeVariant: "success" as const
    },
    {
      title: "Em Andamento",
      value: inProgress,
      icon: Clock,
      color: "warning",
      bgGradient: "from-warning/10 to-warning/5",
      borderColor: "border-warning/20",
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
      badge: `${progressRate}% ativo`,
      badgeVariant: "warning" as const
    },
    {
      title: "Total de Soluções",
      value: total,
      icon: Target,
      color: "primary",
      bgGradient: "from-primary/10 to-accent/10",
      borderColor: "border-primary/20",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      badge: "Disponível",
      badgeVariant: "accent" as const
    },
    {
      title: "Taxa de Sucesso",
      value: `${completionRate}%`,
      icon: Award,
      color: "info",
      bgGradient: "from-info/10 to-info/5",
      borderColor: "border-info/20",
      iconBg: "bg-info/10",
      iconColor: "text-info",
      badge: "Crescendo",
      badgeVariant: "info" as const
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} variant="elevated" className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-surface-elevated rounded-2xl"></div>
                <div className="w-16 h-6 bg-surface-elevated rounded-full"></div>
              </div>
              <div className="space-y-2">
                <div className="w-24 h-8 bg-surface-elevated rounded"></div>
                <div className="w-32 h-4 bg-surface-elevated rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
      {kpiCards.map((card, index) => (
        <Card 
          key={card.title}
          variant="elevated" 
          className={cn(
            "overflow-hidden transition-all duration-300 hover:shadow-glow-primary group cursor-pointer",
            `bg-gradient-to-br ${card.bgGradient}`,
            card.borderColor
          )}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <CardContent className="p-6 relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10 transform translate-x-6 -translate-y-6">
              <card.icon className="w-full h-full" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-2xl", card.iconBg)}>
                  <card.icon className={cn("h-6 w-6", card.iconColor)} />
                </div>
                <Badge variant={card.badgeVariant} size="sm">
                  {card.badge}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <Text 
                  variant="display-small" 
                  textColor="primary" 
                  className="font-bold group-hover:scale-105 transition-transform"
                >
                  {card.value}
                </Text>
                <Text variant="body-small" textColor="secondary" className="font-medium">
                  {card.title}
                </Text>
              </div>
              
              {/* Trend indicator */}
              <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <TrendingUp className="h-3 w-3 text-success" />
                <Text variant="caption" textColor="tertiary">
                  {index === 0 ? "+12%" : index === 1 ? "+8%" : index === 2 ? "+5%" : "+15%"} este mês
                </Text>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

KpiGrid.displayName = 'KpiGrid';
