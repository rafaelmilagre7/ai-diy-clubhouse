import React, { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Solution } from '@/lib/supabase';
import { TrendingUp, Settings, BarChart } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

interface AuroraGlassSolutionCardProps {
  solution: Solution;
  onClick: () => void;
}

// Mapeia categoria para variant do GlassCard e cor do badge
const getCategoryVariant = (category: string) => {
  switch (category) {
    case 'Receita':
      return {
        variant: 'revenue' as const,
        icon: <TrendingUp className="h-3.5 w-3.5" />,
        badgeClass: 'bg-revenue/20 text-revenue border-revenue/30',
      };
    case 'Operacional':
      return {
        variant: 'operational' as const,
        icon: <Settings className="h-3.5 w-3.5" />,
        badgeClass: 'bg-operational/20 text-operational border-operational/30',
      };
    case 'Estratégia':
      return {
        variant: 'strategy' as const,
        icon: <BarChart className="h-3.5 w-3.5" />,
        badgeClass: 'bg-strategy/20 text-strategy border-strategy/30',
      };
    default:
      return {
        variant: 'default' as const,
        icon: <TrendingUp className="h-3.5 w-3.5" />,
        badgeClass: 'bg-aurora-primary/20 text-aurora-primary border-aurora-primary/30',
      };
  }
};

export const AuroraGlassSolutionCard = memo<AuroraGlassSolutionCardProps>(({ solution, onClick }) => {
  const categoryConfig = getCategoryVariant(solution.category);

  return (
    <div onClick={onClick} className="cursor-pointer hover:scale-[1.02] transition-transform duration-300">
      <GlassCard 
        variant={categoryConfig.variant}
        className="overflow-hidden animate-fade-in h-full"
      >
      {/* Cover image com aspect-video (16:9) */}
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
            <div className="text-4xl opacity-30">{categoryConfig.icon}</div>
          </div>
        )}
        
        {/* Gradient overlay na imagem */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
      </div>

      {/* Conteúdo */}
      <div className="p-md space-y-sm">
        {/* Badge da categoria com cor específica */}
        <Badge 
          variant="outline" 
          className={`text-xs font-medium ${categoryConfig.badgeClass}`}
        >
          <span className="mr-1">{categoryConfig.icon}</span>
          {solution.category}
        </Badge>

        {/* Título */}
        <h3 className="font-semibold text-base text-foreground line-clamp-2">
          {solution.title}
        </h3>

        {/* Descrição */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {solution.description}
        </p>
      </div>
      </GlassCard>
    </div>
  );
});

AuroraGlassSolutionCard.displayName = 'AuroraGlassSolutionCard';
