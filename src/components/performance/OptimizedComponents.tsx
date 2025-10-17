import React, { memo, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Componente otimizado para Cards de soluções
export const OptimizedSolutionCard = memo<{
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  onClick?: () => void;
  className?: string;
}>(({ id, title, description, category, status, onClick, className }) => {
  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  const statusColor = useMemo(() => {
    switch (status) {
      case 'completed': return 'bg-system-healthy/10 text-system-healthy border-system-healthy/20';
      case 'active': return 'bg-operational/10 text-operational border-operational/20';
      case 'recommended': return 'bg-status-warning/10 text-status-warning border-status-warning/20';
      default: return 'bg-muted/10 text-muted-foreground border-border';
    }
  }, [status]);

  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-smooth hover:scale-[1.02] hover:shadow-lg bg-card border-border",
        className
      )}
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base line-clamp-1 group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          <Badge variant="outline" className={cn("text-xs ml-2", statusColor)}>
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {description}
        </p>
        <Badge variant="secondary" className="text-xs">
          {category}
        </Badge>
      </CardContent>
    </Card>
  );
});

OptimizedSolutionCard.displayName = 'OptimizedSolutionCard';

// Componente otimizado para Lista de ferramentas
export const OptimizedToolCard = memo<{
  id: string;
  name: string;
  description: string;
  category: string;
  logo_url?: string;
  onClick?: () => void;
}>(({ id, name, description, category, logo_url, onClick }) => {
  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  return (
    <Card 
      className="group cursor-pointer transition-smooth hover:scale-[1.02] hover:shadow-lg bg-card border-border"
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          {logo_url && (
            <img 
              src={logo_url} 
              alt={name}
              className="w-8 h-8 rounded-md object-cover"
              loading="lazy"
            />
          )}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm line-clamp-1 group-hover:text-primary transition-colors">
              {name}
            </CardTitle>
            <Badge variant="secondary" className="text-xs mt-1">
              {category}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground line-clamp-2">
          {description}
        </p>
      </CardContent>
    </Card>
  );
});

OptimizedToolCard.displayName = 'OptimizedToolCard';

// Componente otimizado para Estatísticas
export const OptimizedStatCard = memo<{
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}>(({ title, value, description, trend, icon, className }) => {
  const trendColor = useMemo(() => {
    switch (trend) {
      case 'up': return 'text-system-healthy';
      case 'down': return 'text-status-error';
      default: return 'text-muted-foreground';
    }
  }, [trend]);

  return (
    <Card className={cn("bg-card border-border", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {description && (
          <p className={cn("text-xs mt-1", trendColor)}>
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
});

OptimizedStatCard.displayName = 'OptimizedStatCard';

// Wrapper otimizado para listas
export const OptimizedList = memo<{
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  keyExtractor: (item: any, index: number) => string;
  className?: string;
}>(({ items, renderItem, keyExtractor, className }) => {
  const memoizedItems = useMemo(() => 
    items.map((item, index) => ({
      key: keyExtractor(item, index),
      element: renderItem(item, index)
    })), 
    [items, renderItem, keyExtractor]
  );

  return (
    <div className={className}>
      {memoizedItems.map(({ key, element }) => (
        <React.Fragment key={key}>
          {element}
        </React.Fragment>
      ))}
    </div>
  );
});

OptimizedList.displayName = 'OptimizedList';