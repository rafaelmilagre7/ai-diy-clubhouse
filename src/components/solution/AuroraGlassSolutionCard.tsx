import React, { useState, memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Solution } from '@/lib/supabase';
import { TrendingUp, Settings, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuroraGlassSolutionCardProps {
  solution: Solution;
  onClick: () => void;
}

// Helpers para categoria
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Receita':
      return {
        gradient: 'from-revenue/70 via-revenue/50 to-revenue/30',
        border: 'border-revenue/30',
        glow: 'hover:shadow-[0_0_30px_-5px_hsl(var(--revenue)/0.4)]',
        icon: <TrendingUp className="h-3.5 w-3.5" />,
      };
    case 'Operacional':
      return {
        gradient: 'from-operational/70 via-operational/50 to-operational/30',
        border: 'border-operational/30',
        glow: 'hover:shadow-[0_0_30px_-5px_hsl(var(--operational)/0.4)]',
        icon: <Settings className="h-3.5 w-3.5" />,
      };
    case 'Estratégia':
      return {
        gradient: 'from-strategy/70 via-strategy/50 to-strategy/30',
        border: 'border-strategy/30',
        glow: 'hover:shadow-[0_0_30px_-5px_hsl(var(--strategy)/0.4)]',
        icon: <BarChart className="h-3.5 w-3.5" />,
      };
    default:
      return {
        gradient: 'from-aurora-primary/70 via-aurora-primary/50 to-aurora-primary/30',
        border: 'border-aurora-primary/30',
        glow: 'hover:shadow-[0_0_30px_-5px_hsl(var(--aurora-primary)/0.4)]',
        icon: <TrendingUp className="h-3.5 w-3.5" />,
      };
  }
};

export const AuroraGlassSolutionCard = memo<AuroraGlassSolutionCardProps>(({ solution, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const categoryStyle = getCategoryColor(solution.category);

  return (
    <div
      className={cn(
        "aurora-glass-solution-card relative overflow-hidden rounded-2xl cursor-pointer",
        "bg-gradient-to-br from-card/90 to-card/60",
        "border backdrop-blur-xl transition-all duration-300",
        categoryStyle.border,
        categoryStyle.glow,
        "hover:scale-[1.02] animate-fade-in"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Glass reflection overlay */}
      <div
        className={cn(
          "absolute inset-0 z-10 pointer-events-none transition-opacity duration-400",
          isHovered ? "opacity-70" : "opacity-50"
        )}
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 80%, rgba(255,255,255,0.05) 100%)',
        }}
      />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-20 mix-blend-overlay z-[5]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Category glow gradient at bottom */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-2/3 z-[8] transition-opacity duration-400",
          "bg-gradient-to-t blur-3xl",
          categoryStyle.gradient,
          isHovered ? "opacity-85" : "opacity-70"
        )}
      />

      {/* Enhanced bottom border glow */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-[2px] z-20 transition-opacity duration-400",
          isHovered ? "opacity-100" : "opacity-80"
        )}
        style={{
          background: `linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%)`,
        }}
      />

      {/* Cover image with aspect-video (16:9) */}
      <div className="relative aspect-video w-full overflow-hidden">
        {solution.thumbnail_url ? (
          <img
            src={solution.thumbnail_url}
            alt={solution.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center">
            <div className="text-4xl opacity-30">{categoryStyle.icon}</div>
          </div>
        )}
        
        {/* Gradient overlay on image */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
      </div>

      {/* Glass panel with content */}
      <div className="relative z-30 p-md space-y-sm">
        {/* Category badge */}
        <div className="flex items-center gap-sm">
          <Badge 
            variant="secondary" 
            className="text-xs font-medium backdrop-blur-sm bg-background/80"
          >
            <span className="mr-1">{categoryStyle.icon}</span>
            {solution.category}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-base text-foreground line-clamp-2 transition-colors">
          {solution.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {solution.description}
        </p>
      </div>

      {/* Corner accents */}
      <div
        className={cn(
          "absolute bottom-0 left-0 w-[1px] h-1/4 z-20 rounded-full transition-opacity duration-400",
          isHovered ? "opacity-100" : "opacity-70"
        )}
        style={{
          background: 'linear-gradient(to top, rgba(255, 255, 255, 0.6) 0%, transparent 100%)',
        }}
      />
      <div
        className={cn(
          "absolute bottom-0 right-0 w-[1px] h-1/4 z-20 rounded-full transition-opacity duration-400",
          isHovered ? "opacity-100" : "opacity-70"
        )}
        style={{
          background: 'linear-gradient(to top, rgba(255, 255, 255, 0.6) 0%, transparent 100%)',
        }}
      />
    </div>
  );
});

AuroraGlassSolutionCard.displayName = 'AuroraGlassSolutionCard';
