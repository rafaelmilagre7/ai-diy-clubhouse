
import { memo, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Target, TrendingUp } from 'lucide-react';

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
          stroke="hsl(var(--aurora))"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-aurora">{progress}%</span>
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
      gradient: 'from-strategy/10 via-strategy-light/5 to-strategy-lighter/10',
      iconColor: 'text-strategy',
      accentColor: 'border-strategy/30',
      glowColor: 'group-hover:shadow-strategy/20',
      description: 'Soluções implementadas com sucesso'
    },
    {
      id: 'progress',
      title: 'Em Progresso',
      value: inProgress,
      percentage: stats.progressRate,
      icon: Target,
      gradient: 'from-strategy-light/10 via-strategy/5 to-strategy-lighter/10',
      iconColor: 'text-strategy-light',
      accentColor: 'border-strategy-light/30',
      glowColor: 'group-hover:shadow-strategy-light/20',
      description: 'Implementações em andamento'
    },
    {
      id: 'total',
      title: 'Disponíveis',
      value: total,
      percentage: 100,
      icon: TrendingUp,
      gradient: 'from-strategy-light/10 via-strategy/5 to-strategy-lighter/10',
      iconColor: 'text-strategy-light',
      accentColor: 'border-strategy-light/30',
      glowColor: 'group-hover:shadow-strategy-light/20',
      description: 'Total de soluções na plataforma'
    }
  ], [completed, inProgress, total, stats]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse aurora-glass border-aurora/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-muted/50 rounded-xl"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted/50 rounded w-24"></div>
                    <div className="h-6 bg-muted/50 rounded w-16"></div>
                  </div>
                </div>
                <div className="w-12 h-12 bg-muted/50 rounded-full"></div>
              </div>
              <div className="h-3 bg-muted/50 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {kpiItems.map((item) => {
        const IconComponent = item.icon;
        
        return (
          <Card 
            key={item.id} 
            className={`group relative overflow-hidden aurora-glass hover:aurora-glass-hover transition-all duration-500 hover:scale-[1.02] border-l-4 ${item.accentColor} hover:shadow-xl ${item.glowColor}`}
          >
            {/* Background gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-50 group-hover:opacity-80 transition-opacity duration-500`} />
            
            {/* Floating particles effect sem sparkles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-4 right-6 w-1 h-1 bg-aurora rounded-full animate-pulse opacity-60" />
              <div className="absolute bottom-6 left-8 w-1 h-1 bg-viverblue rounded-full animate-pulse opacity-40" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/2 right-1/4 w-0.5 h-0.5 bg-operational rounded-full animate-pulse opacity-50" style={{ animationDelay: '2s' }} />
            </div>

            <CardContent className="relative p-6 z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl backdrop-blur-sm bg-white/10 group-hover:scale-110 transition-all duration-300 border border-white/20`}>
                    <IconComponent className={`h-6 w-6 ${item.iconColor} group-hover:drop-shadow-lg transition-all duration-300`} />
                  </div>
                  <div>
                    <p className="text-sm font-outfit font-medium text-muted-foreground/90 mb-1">{item.title}</p>
                    <div className="flex items-baseline space-x-2">
                      <p className="text-2xl font-inter font-bold text-foreground">{item.value}</p>
                    </div>
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
                  <div className="flex-shrink-0 p-2 rounded-full bg-gradient-to-r from-strategy/20 to-strategy-light/20 backdrop-blur-sm">
                    <TrendingUp className="h-6 w-6 text-strategy-light" />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-xs font-outfit text-muted-foreground/80">{item.description}</p>
                
                {/* Barra de progresso visual para todos os itens */}
                <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden">
                   <div 
                    className={`h-full bg-gradient-to-r ${
                      item.id === 'completed' ? 'from-strategy to-strategy-light' :
                      item.id === 'progress' ? 'from-strategy-light to-strategy-lighter' :
                      'from-strategy-light to-strategy'
                    } rounded-full transition-all duration-1000 ease-out aurora-shimmer`}
                    style={{ width: `${item.id === 'total' ? 100 : item.percentage}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});

AuroraKpiGrid.displayName = 'AuroraKpiGrid';
