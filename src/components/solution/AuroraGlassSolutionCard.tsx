import React, { useState, memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Solution } from '@/lib/supabase';
import { TrendingUp, Settings, BarChart, Sparkles } from 'lucide-react';
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
        glow: 'hover:shadow-[0_0_40px_-5px_hsl(var(--revenue)/0.5),0_0_20px_-5px_hsl(var(--revenue)/0.3)]',
        glowPulse: 'aurora-glow-revenue',
        icon: <TrendingUp className="h-3.5 w-3.5" />,
      };
    case 'Operacional':
      return {
        gradient: 'from-operational/70 via-operational/50 to-operational/30',
        border: 'border-operational/30',
        glow: 'hover:shadow-[0_0_40px_-5px_hsl(var(--operational)/0.5),0_0_20px_-5px_hsl(var(--operational)/0.3)]',
        glowPulse: 'aurora-glow-operational',
        icon: <Settings className="h-3.5 w-3.5" />,
      };
    case 'Estratégia':
      return {
        gradient: 'from-strategy/70 via-strategy/50 to-strategy/30',
        border: 'border-strategy/30',
        glow: 'hover:shadow-[0_0_40px_-5px_hsl(var(--strategy)/0.5),0_0_20px_-5px_hsl(var(--strategy)/0.3)]',
        glowPulse: 'aurora-glow-strategy',
        icon: <BarChart className="h-3.5 w-3.5" />,
      };
    default:
      return {
        gradient: 'from-aurora-primary/70 via-aurora-primary/50 to-aurora-primary/30',
        border: 'border-aurora-primary/30',
        glow: 'hover:shadow-[0_0_40px_-5px_hsl(var(--aurora-primary)/0.5),0_0_20px_-5px_hsl(var(--aurora-primary)/0.3)]',
        glowPulse: 'aurora-glow-primary',
        icon: <TrendingUp className="h-3.5 w-3.5" />,
      };
  }
};

export const AuroraGlassSolutionCard = memo<AuroraGlassSolutionCardProps>(({ solution, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const categoryStyle = getCategoryColor(solution.category);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
    setMousePosition({ x, y });
  };

  return (
    <div
      className={cn(
        "aurora-glass-solution-card relative overflow-hidden rounded-2xl cursor-pointer",
        "bg-gradient-to-br from-card/90 to-card/60",
        "border backdrop-blur-xl transition-all duration-300",
        categoryStyle.border,
        categoryStyle.glow,
        "hover:scale-[1.02] animate-fade-in",
        "shadow-[0_8px_32px_-8px_hsl(var(--foreground)/0.1)]"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      onMouseMove={handleMouseMove}
      onClick={onClick}
    >
      {/* Scan line effect */}
      {isHovered && (
        <div className="aurora-scan-line absolute inset-0 z-[15] pointer-events-none" />
      )}

      {/* Glass reflection overlay */}
      <div
        className={cn(
          "absolute inset-0 z-10 pointer-events-none transition-opacity duration-400",
          isHovered ? "opacity-70" : "opacity-50"
        )}
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 80%, rgba(255,255,255,0.05) 100%)',
        }}
      />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-20 mix-blend-overlay z-[5]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Category glow gradient at bottom - com breathing effect */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-2/3 z-[8] transition-opacity duration-400",
          "bg-gradient-to-t blur-3xl",
          categoryStyle.gradient,
          categoryStyle.glowPulse,
          isHovered ? "opacity-85" : "opacity-70"
        )}
      />

      {/* Enhanced bottom border glow */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-[2px] z-20 transition-all duration-400",
          isHovered ? "opacity-100 shadow-[0_0_12px_2px_currentColor]" : "opacity-80"
        )}
        style={{
          background: `linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.7) 50%, transparent 100%)`,
        }}
      />

      {/* Cover image with aspect-video (16:9) - com parallax */}
      <div className="relative aspect-video w-full overflow-hidden">
        {solution.thumbnail_url ? (
          <img
            src={solution.thumbnail_url}
            alt={solution.title}
            className="w-full h-full object-cover transition-transform duration-700"
            style={{
              transform: isHovered 
                ? `scale(1.1) translate(${mousePosition.x}px, ${mousePosition.y}px)` 
                : 'scale(1) translate(0, 0)'
            }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center">
            <div className="text-4xl opacity-30">{categoryStyle.icon}</div>
          </div>
        )}
        
        {/* Gradient overlay on image */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
        
        {/* Badge "Nova" - exemplo de status indicator */}
        {Math.random() > 0.7 && (
          <div className="absolute top-3 right-3 z-20">
            <Badge 
              className="bg-primary/90 text-primary-foreground border-primary backdrop-blur-sm 
                         shadow-[0_0_20px_-5px_hsl(var(--primary)/0.5)] animate-pulse-subtle
                         hover:scale-110 transition-transform duration-200"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Nova
            </Badge>
          </div>
        )}
      </div>

      {/* Glass panel with content */}
      <div className="relative z-30 p-md space-y-sm">
        {/* Category badge - com micro-animação */}
        <div className="flex items-center gap-sm">
          <Badge 
            variant="secondary" 
            className={cn(
              "text-xs font-medium backdrop-blur-sm bg-background/80 transition-transform duration-200",
              isHovered && "scale-105"
            )}
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

      {/* Corner accents - enhanced */}
      <div
        className={cn(
          "absolute bottom-0 left-0 w-[2px] h-1/4 z-20 rounded-full transition-all duration-400",
          isHovered ? "opacity-100 h-1/3 shadow-[0_0_8px_1px_currentColor]" : "opacity-70"
        )}
        style={{
          background: 'linear-gradient(to top, rgba(255, 255, 255, 0.7) 0%, transparent 100%)',
        }}
      />
      <div
        className={cn(
          "absolute bottom-0 right-0 w-[2px] h-1/4 z-20 rounded-full transition-all duration-400",
          isHovered ? "opacity-100 h-1/3 shadow-[0_0_8px_1px_currentColor]" : "opacity-70"
        )}
        style={{
          background: 'linear-gradient(to top, rgba(255, 255, 255, 0.7) 0%, transparent 100%)',
        }}
      />

      {/* Floating particles on hover */}
      {isHovered && (
        <>
          <div className="aurora-particle absolute top-[20%] left-[30%] w-1 h-1" />
          <div className="aurora-particle absolute top-[60%] right-[25%] w-1.5 h-1.5 animation-delay-300" />
          <div className="aurora-particle absolute bottom-[40%] left-[70%] w-1 h-1 animation-delay-500" />
        </>
      )}
    </div>
  );
});

AuroraGlassSolutionCard.displayName = 'AuroraGlassSolutionCard';
