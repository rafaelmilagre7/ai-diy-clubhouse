import { memo, useMemo } from 'react';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { Trophy, Target, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
interface AuroraKpiGridProps {
  completed: number;
  inProgress: number;
  total: number;
  isLoading?: boolean;
}

// Componente para o anel de progresso
const ProgressRing = ({ progress, size = 48, strokeWidth = 4 }: {
  progress: number;
  size?: number;
  strokeWidth?: number;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90 aurora-progress-ring"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="opacity-20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--aurora-primary))"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-aurora-primary">{progress}%</span>
      </div>
    </div>
  );
};

export const AuroraKpiGrid = memo(({ 
  completed, 
  inProgress, 
  total, 
  isLoading = false 
}: AuroraKpiGridProps) => {
  
  const stats = useMemo(() => {
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const progressRate = total > 0 ? Math.round((inProgress / total) * 100) : 0;
    
    return {
      completionRate,
      progressRate,
      totalItems: total
    };
  }, [completed, inProgress, total]);

  const kpiItems = useMemo(() => [
    {
      id: 'completed',
      title: 'Concluídas',
      value: completed,
      percentage: stats.completionRate,
      icon: Trophy,
      description: 'Soluções implementadas com sucesso'
    },
    {
      id: 'progress',
      title: 'Em Progresso',
      value: inProgress,
      percentage: stats.progressRate,
      icon: Target,
      description: 'Implementações em andamento'
    },
    {
      id: 'total',
      title: 'Disponíveis',
      value: total,
      percentage: 100,
      icon: TrendingUp,
      description: 'Total de soluções na plataforma'
    }
  ], [completed, inProgress, total, stats]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        {[1, 2, 3].map((i) => (
          <LiquidGlassCard key={i} hoverable={false}>
            <div className="p-lg">
              <div className="flex items-center justify-between mb-md">
                <div className="flex items-center space-x-md">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
                <Skeleton className="w-12 h-12 rounded-full" />
              </div>
              <Skeleton className="h-3 w-3/4" />
            </div>
          </LiquidGlassCard>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-lg animate-fade-in">
      {kpiItems.map((item, index) => {
        const IconComponent = item.icon;
        
        return (
          <div key={item.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in">
            <LiquidGlassCard 
              className="group hover:shadow-aurora-primary/20"
              hoverable
            >
            <div className="p-lg">
              <div className="flex items-center justify-between mb-md">
                <div className="flex items-center space-x-md">
                  <div className="p-md rounded-xl bg-aurora-primary/10 group-hover:bg-aurora-primary/20 transition-all duration-300">
                    <IconComponent className="h-6 w-6 text-aurora-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{item.title}</p>
                    <p className="text-3xl font-bold text-foreground">{item.value}</p>
                  </div>
                </div>
                
                {/* Progress Ring apenas para concluídas e em andamento */}
                {item.id !== 'total' && (
                  <div className="flex-shrink-0">
                    <ProgressRing progress={item.percentage} size={48} strokeWidth={3} />
                  </div>
                )}
                
                {/* Ícone especial para total */}
                {item.id === 'total' && (
                  <div className="flex-shrink-0 p-sm rounded-full bg-aurora-primary/10">
                    <TrendingUp className="h-6 w-6 text-aurora-primary-light" />
                  </div>
                )}
              </div>
              
              <div className="space-y-2 mt-md">
                <p className="text-xs text-muted-foreground">{item.description}</p>
                
                {/* Barra de progresso visual */}
                <div className="w-full h-1.5 bg-muted/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-aurora-primary to-aurora-primary-light rounded-full transition-all duration-500"
                    style={{ width: `${item.id === 'total' ? 100 : item.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </LiquidGlassCard>
          </div>
        );
      })}
    </div>
  );
});

AuroraKpiGrid.displayName = 'AuroraKpiGrid';
