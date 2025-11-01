import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  trend?: number; // % de crescimento (positivo ou negativo)
  isLoading?: boolean;
  variant?: 'primary' | 'success' | 'warning' | 'info';
}

export const StatsCard = ({ 
  icon: Icon, 
  label, 
  value, 
  trend,
  isLoading,
  variant = 'primary' 
}: StatsCardProps) => {
  const variantStyles = {
    primary: 'bg-aurora/10 border-aurora/20 text-aurora',
    success: 'bg-operational/10 border-operational/20 text-operational',
    warning: 'bg-warning/10 border-warning/20 text-warning',
    info: 'bg-info/10 border-info/20 text-info'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        "relative overflow-hidden rounded-xl border p-4 transition-all",
        "bg-surface-elevated/50 backdrop-blur-sm",
        variantStyles[variant].split(' ').filter(c => c.includes('border')).join(' ')
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 flex-1">
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
          {isLoading ? (
            <div className="h-8 w-20 bg-muted/50 rounded animate-pulse" />
          ) : (
            <div className="flex items-baseline gap-2">
              <motion.p 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-foreground"
              >
                {value.toLocaleString('pt-BR')}
              </motion.p>
              
              {trend !== undefined && (
                <div className={cn(
                  "flex items-center gap-0.5 text-xs font-medium",
                  trend > 0 ? "text-operational" : trend < 0 ? "text-destructive" : "text-muted-foreground"
                )}>
                  {trend > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : trend < 0 ? (
                    <TrendingDown className="w-3 h-3" />
                  ) : null}
                  <span>{Math.abs(trend)}%</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className={cn(
          "p-2 rounded-lg",
          variantStyles[variant]
        )}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </motion.div>
  );
};
