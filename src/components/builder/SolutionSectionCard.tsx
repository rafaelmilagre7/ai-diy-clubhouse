import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SolutionSectionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  badgeVariant?: 'default' | 'success' | 'loading' | 'warning';
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const SolutionSectionCard: React.FC<SolutionSectionCardProps> = ({
  icon,
  title,
  description,
  badge,
  badgeVariant = 'default',
  onClick,
  loading = false,
  disabled = false,
  className
}) => {
  const getBadgeClasses = () => {
    switch (badgeVariant) {
      case 'success':
        return 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30';
      case 'loading':
        return 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30';
      case 'warning':
        return 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <Card
      onClick={disabled ? undefined : onClick}
      className={cn(
        "transition-all duration-300 hover:shadow-lg hover:border-primary/30",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:-translate-y-1",
        className
      )}
    >
      <CardContent className="p-lg">
        <div className="flex items-start justify-between gap-md">
          {/* Ícone + Conteúdo */}
          <div className="flex items-start gap-md flex-1">
            <div className="p-sm bg-primary/10 rounded-lg shrink-0">
              {icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-foreground mb-1">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                {loading && <Loader2 className="h-3 w-3 animate-spin" />}
                {description}
              </p>
            </div>
          </div>

          {/* Badge + Seta */}
          <div className="flex items-center gap-sm shrink-0">
            {badge && (
              <Badge variant="outline" className={cn("text-xs", getBadgeClasses())}>
                {badgeVariant === 'loading' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                {badge}
              </Badge>
            )}
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
