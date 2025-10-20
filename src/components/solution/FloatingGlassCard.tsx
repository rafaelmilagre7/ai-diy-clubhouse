import React from 'react';
import { Solution } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Settings, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingGlassCardProps {
  solution: Solution;
  onClick: () => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Receita':
      return <TrendingUp className="h-4 w-4" />;
    case 'Operacional':
      return <Settings className="h-4 w-4" />;
    case 'Estratégia':
      return <BarChart className="h-4 w-4" />;
    default:
      return <TrendingUp className="h-4 w-4" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Receita':
      return 'text-revenue border-revenue/30 bg-revenue/10';
    case 'Operacional':
      return 'text-operational border-operational/30 bg-operational/10';
    case 'Estratégia':
      return 'text-strategy border-strategy/30 bg-strategy/10';
    default:
      return 'text-aurora-primary border-aurora-primary/30 bg-aurora-primary/10';
  }
};

export const FloatingGlassCard: React.FC<FloatingGlassCardProps> = ({ solution, onClick }) => {
  return (
    <div 
      className="floating-glass-wrapper group cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Background com parallax da thumbnail */}
      <div className="floating-glass-background">
        {solution.thumbnail_url ? (
          <>
            <img 
              src={solution.thumbnail_url} 
              alt={solution.title}
              className="floating-glass-image"
            />
            <div className="floating-glass-overlay" />
            <div className="scan-line" />
          </>
        ) : (
          <div className="floating-glass-placeholder">
            <div className="floating-glass-placeholder-icon">
              {getCategoryIcon(solution.category)}
            </div>
            <div className="scan-line" />
          </div>
        )}
      </div>

      {/* Card flutuante com info */}
      <div className="floating-glass-content">
        {/* LED Corner Accents */}
        <div className="led-corner led-corner-tl" />
        <div className="led-corner led-corner-tr" />
        <div className="led-corner led-corner-bl" />
        <div className="led-corner led-corner-br" />
        
        {/* Badge de Categoria */}
        <div className="flex items-center gap-2 mb-3">
          <Badge 
            variant="secondary" 
            className={cn(
              "text-xs font-medium backdrop-blur-sm border flex items-center gap-1.5 px-2.5 py-1",
              getCategoryColor(solution.category)
            )}
          >
            {getCategoryIcon(solution.category)}
            {solution.category}
          </Badge>
        </div>

        {/* Título */}
        <h3 className="text-base font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-aurora-primary transition-colors duration-300">
          {solution.title}
        </h3>

        {/* Descrição */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {solution.description}
        </p>

        {/* Indicador de hover */}
        <div className="floating-glass-hover-indicator">
          <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-aurora-primary via-aurora-primary-light to-aurora-primary transition-all duration-500" />
        </div>
      </div>

      {/* Particles decorativas */}
      <div className="floating-particles">
        <div className="floating-particle" style={{ left: '20%', animationDelay: '0s' }} />
        <div className="floating-particle" style={{ left: '60%', animationDelay: '-2s' }} />
        <div className="floating-particle" style={{ left: '80%', animationDelay: '-4s' }} />
      </div>
    </div>
  );
};
