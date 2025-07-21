
import { memo, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Target, TrendingUp, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuroraKpiGridProps {
  completed: number;
  inProgress: number;
  total: number;
  isLoading?: boolean;
}

// Componente de loading com Aurora Style
const AuroraKpiSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {[1, 2, 3].map((i) => (
      <Card key={i} className="relative overflow-hidden border-aurora/20 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-aurora/5 via-transparent to-viverblue/5 animate-pulse" />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-3 flex-1">
              <div className="h-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg animate-pulse" />
              <div className="h-8 bg-gradient-to-r from-muted/40 to-muted/20 rounded-lg animate-pulse w-3/4" />
              <div className="h-3 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg animate-pulse w-1/2" />
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-aurora/20 to-viverblue/20 rounded-xl animate-pulse" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Componente de progresso circular Aurora
const AuroraProgressRing = ({ percentage, size = 40 }: { percentage: number; size?: number }) => {
  const radius = (size - 4) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="2"
          fill="transparent"
          className="text-muted/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#auroraGradient)"
          strokeWidth="2"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="auroraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--aurora))" />
            <stop offset="50%" stopColor="hsl(var(--viverblue))" />
            <stop offset="100%" stopColor="hsl(var(--operational))" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-aurora">{percentage}%</span>
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
      title: 'Soluções Concluídas',
      value: completed,
      percentage: stats.completionRate,
      icon: Trophy,
      gradient: 'from-emerald-500/20 via-aurora/10 to-emerald-400/20',
      glowColor: 'emerald-400',
      iconBg: 'from-emerald-500/20 to-emerald-400/10',
      description: `${stats.completionRate}% implementações finalizadas`,
      showProgress: true
    },
    {
      id: 'progress',
      title: 'Em Andamento',
      value: inProgress,
      percentage: stats.progressRate,
      icon: Target,
      gradient: 'from-aurora/20 via-viverblue/10 to-operational/20',
      glowColor: 'aurora',
      iconBg: 'from-aurora/20 to-viverblue/10',
      description: `${stats.progressRate}% soluções em implementação`,
      showProgress: true
    },
    {
      id: 'total',
      title: 'Total Disponível',
      value: total,
      percentage: 100,
      icon: TrendingUp,
      gradient: 'from-strategy/20 via-viverblue/10 to-aurora/20',
      glowColor: 'strategy',
      iconBg: 'from-strategy/20 to-aurora/10',
      description: 'Soluções na plataforma',
      showProgress: false
    }
  ], [completed, inProgress, total, stats]);

  if (isLoading) {
    return <AuroraKpiSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {kpiItems.map((item, index) => {
        const IconComponent = item.icon;
        
        return (
          <Card 
            key={item.id} 
            className={cn(
              "group relative overflow-hidden",
              "border-aurora/20 hover:border-aurora/40",
              "bg-gradient-to-br from-card/90 to-card/50",
              "backdrop-blur-xl",
              "transition-all duration-500 ease-out",
              "hover:scale-[1.02] hover:shadow-2xl hover:shadow-aurora/20",
              "cursor-pointer",
              "animate-fade-in"
            )}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Aurora background effect */}
            <div className={cn(
              "absolute inset-0 opacity-0 group-hover:opacity-100",
              "bg-gradient-to-r",
              item.gradient,
              "transition-opacity duration-500"
            )} />
            
            {/* Floating particles effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <Sparkles className={cn(
                "absolute top-4 right-4 w-3 h-3 opacity-0 group-hover:opacity-40",
                `text-${item.glowColor}`,
                "animate-pulse transition-opacity duration-700"
              )} />
            </div>

            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      {item.title}
                    </h3>
                    {item.showProgress && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-2 h-2 rounded-full bg-aurora animate-pulse" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold bg-gradient-to-r from-foreground via-aurora to-viverblue bg-clip-text text-transparent">
                      {item.value}
                    </span>
                    {item.showProgress && (
                      <AuroraProgressRing percentage={item.percentage} size={32} />
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground group-hover:text-aurora/80 transition-colors duration-300">
                    {item.description}
                  </p>
                </div>
                
                <div className={cn(
                  "relative p-4 rounded-xl",
                  "bg-gradient-to-br",
                  item.iconBg,
                  "group-hover:scale-110 transition-transform duration-300",
                  "shadow-lg group-hover:shadow-xl",
                  `group-hover:shadow-${item.glowColor}/20`
                )}>
                  <IconComponent className={cn(
                    "w-6 h-6 transition-all duration-300",
                    `text-${item.glowColor}`,
                    "group-hover:drop-shadow-lg"
                  )} />
                  
                  {/* Glow effect */}
                  <div className={cn(
                    "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-30",
                    "bg-gradient-to-r from-aurora/20 to-viverblue/20",
                    "blur-sm transition-opacity duration-500"
                  )} />
                </div>
              </div>
            </CardContent>
            
            {/* Bottom glow line */}
            <div className={cn(
              "absolute bottom-0 left-0 right-0 h-0.5",
              "bg-gradient-to-r from-transparent via-aurora to-transparent",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            )} />
          </Card>
        );
      })}
    </div>
  );
});

AuroraKpiGrid.displayName = 'AuroraKpiGrid';
