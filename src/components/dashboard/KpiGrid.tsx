
import { FC, memo } from "react";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiGridProps {
  completed: number;
  inProgress: number;
  total: number;
  isLoading?: boolean;
}

interface KpiCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  variant: "success" | "warning" | "info" | "accent";
  description: string;
  isLoading?: boolean;
}

const KpiCard: FC<KpiCardProps> = memo(({ 
  title, 
  value, 
  icon, 
  variant, 
  description, 
  isLoading 
}) => {
  return (
    <Card 
      variant="elevated" 
      className={cn(
        "p-6 hover-lift transition-all duration-300",
        "hover:shadow-glow-primary border-border-subtle"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-2 rounded-lg",
              variant === "success" && "bg-success/10",
              variant === "warning" && "bg-warning/10", 
              variant === "info" && "bg-info/10",
              variant === "accent" && "bg-accent/10"
            )}>
              {icon}
            </div>
            <Text variant="label" textColor="secondary" className="uppercase tracking-wide">
              {title}
            </Text>
          </div>
          
          <div className="space-y-1">
            {isLoading ? (
              <div className="h-8 bg-surface animate-pulse rounded"></div>
            ) : (
              <Text variant="section" textColor="primary" weight="bold">
                {value}
              </Text>
            )}
            <Text variant="caption" textColor="tertiary">
              {description}
            </Text>
          </div>
        </div>
        
        <Badge variant={variant} size="sm">
          <TrendingUp className="h-3 w-3 mr-1" />
          Ativo
        </Badge>
      </div>
    </Card>
  );
});

KpiCard.displayName = 'KpiCard';

export const KpiGrid: FC<KpiGridProps> = memo(({ 
  completed, 
  inProgress, 
  total, 
  isLoading 
}) => {
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
      <KpiCard
        title="Concluídas"
        value={completed}
        icon={<CheckCircle className="h-5 w-5 text-success" />}
        variant="success"
        description="Soluções implementadas"
        isLoading={isLoading}
      />
      
      <KpiCard
        title="Em andamento"
        value={inProgress}
        icon={<Clock className="h-5 w-5 text-warning" />}
        variant="warning"
        description="Implementações ativas"
        isLoading={isLoading}
      />
      
      <KpiCard
        title="Total"
        value={total}
        icon={<Target className="h-5 w-5 text-info" />}
        variant="info"
        description="Soluções disponíveis"
        isLoading={isLoading}
      />
      
      <KpiCard
        title="Taxa de sucesso"
        value={completionRate}
        icon={<TrendingUp className="h-5 w-5 text-accent" />}
        variant="accent"
        description="% de conclusão"
        isLoading={isLoading}
      />
    </div>
  );
});

KpiGrid.displayName = 'KpiGrid';
