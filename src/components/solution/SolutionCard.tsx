
import React from 'react';
import { Link } from 'react-router-dom';
import { Solution } from '@/lib/supabase';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart, TrendingUp, Settings, Zap, Lock, Crown } from 'lucide-react';
import { getCategoryDetails } from '@/lib/types/categoryTypes';

interface SolutionCardProps {
  solution: Solution;
  hasAccess?: boolean;
  onUpgradeRequired?: () => void;
}

const getDifficultyBadgeStyle = (difficulty: string) => {
  switch (difficulty) {
    case "easy":
      return "bg-operational/20 text-operational border-operational/30";
    case "medium":
      return "bg-status-warning/20 text-status-warning border-status-warning/30";
    case "advanced":
      return "bg-status-error/20 text-status-error border-status-error/30";
    default:
      return "bg-muted/60 text-muted-foreground border-border";
  }
};

export const SolutionCard: React.FC<SolutionCardProps> = ({ 
  solution, 
  hasAccess = true, 
  onUpgradeRequired 
}) => {
  const getCategoryDetailsWithIcon = (category: string) => {
    const details = getCategoryDetails(category);
    
    let icon;
    switch (category) {
      case 'Receita':
        icon = <TrendingUp className="h-4 w-4 text-revenue" />;
        break;
      case 'Operacional':
        icon = <Settings className="h-4 w-4 text-operational" />;
        break;
      case 'Estratégia':
        icon = <BarChart className="h-4 w-4 text-strategy" />;
        break;
      default:
        icon = <Zap className="h-4 w-4 text-muted-foreground" />;
    }

    return {
      ...details,
      icon,
      color: category === 'Receita' ? 'bg-revenue/20 text-revenue border-revenue/30' :
             category === 'Operacional' ? 'bg-operational/20 text-operational border-operational/30' :
             category === 'Estratégia' ? 'bg-strategy/20 text-strategy border-strategy/30' :
             'bg-muted/60 text-muted-foreground border-border'
    };
  };

  const categoryDetails = getCategoryDetailsWithIcon(solution.category);

  const handleClick = (e: React.MouseEvent) => {
    if (!hasAccess && onUpgradeRequired) {
      e.preventDefault();
      onUpgradeRequired();
    }
  };

  const CardWrapper = hasAccess ? Link : 'div';

  if (hasAccess) {
    return (
      <Link to={`/solution/${solution.id}`} className="block group cursor-pointer">
        <Card className="h-full overflow-hidden transition-all duration-300 
                       bg-card/90 backdrop-blur-sm border border-border/40 
                       hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 
                       hover:scale-105 hover:bg-card/95 
                       group-hover:translate-y-[-4px] relative">
          
          <CardHeader className="p-0">
            <div className="aspect-video relative overflow-hidden">
              {solution.thumbnail_url ? (
                <img 
                  src={solution.thumbnail_url} 
                  alt={solution.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-background">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
                    <div className="relative text-primary text-3xl font-bold">{solution.title.charAt(0)}</div>
                  </div>
                </div>
              )}
              
              {/* Aurora overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>
              
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <Badge 
                variant="outline"
                className={`absolute top-3 left-3 backdrop-blur-sm bg-card/90 border-border/40 shadow-lg ${categoryDetails.color}`}
              >
                <span className="flex items-center gap-1.5">
                  {categoryDetails.icon}
                  <span className="font-medium">{categoryDetails.name}</span>
                </span>
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-5 space-y-3">
            <h3 className="font-semibold text-lg line-clamp-1 text-foreground group-hover:text-primary transition-colors duration-300">
              {solution.title}
            </h3>
            <p className="text-sm text-muted-foreground/80 line-clamp-2 h-14 overflow-hidden">
              {solution.description}
            </p>
          </CardContent>
          
          <CardFooter className="p-5 pt-0 flex gap-2 flex-wrap justify-between items-center">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
              {categoryDetails.icon}
              <span>{categoryDetails.name}</span>
            </div>
            
            <div className="flex gap-2">
              <Badge
                variant="outline"
                className={`font-medium text-xs backdrop-blur-sm ${getDifficultyBadgeStyle(solution.difficulty)}`}
              >
                {solution.difficulty === "easy"
                  ? "Fácil"
                  : solution.difficulty === "medium"
                  ? "Médio"
                  : solution.difficulty === "advanced"
                  ? "Avançado"
                  : solution.difficulty}
              </Badge>
              
              {typeof solution.success_rate === "number" && solution.success_rate > 0 && (
                <Badge 
                  variant="outline" 
                  className="bg-primary/10 text-primary border-primary/30 backdrop-blur-sm text-xs font-medium"
                >
                  {solution.success_rate}% sucesso
                </Badge>
              )}
            </div>
          </CardFooter>
          
          {/* Bottom glow indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30"></div>
        </Card>
      </Link>
    );
  }

  return (
    <div className="block group cursor-pointer" onClick={handleClick}>
      <Card className="h-full overflow-hidden transition-all duration-300 
                     bg-card/90 backdrop-blur-sm border border-border/40 
                     hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 
                     hover:scale-105 hover:bg-card/95 
                     group-hover:translate-y-[-4px] relative">
        
        {/* Overlay premium com efeito de desbloqueio */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/98 via-background/95 to-background/98 
                       z-30 flex items-center justify-center backdrop-blur-md 
                       opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out 
                       border border-border/10 group-hover:border-primary/40 rounded-lg">
          
          {/* Partículas de brilho animadas */}
          <div className="absolute inset-0 overflow-hidden rounded-lg">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/60 rounded-full animate-ping delay-100"></div>
            <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-primary/40 rounded-full animate-ping delay-300"></div>
            <div className="absolute bottom-1/4 left-3/4 w-1.5 h-1.5 bg-primary/50 rounded-full animate-ping delay-500"></div>
          </div>
          
          <div className="text-center space-y-6 relative z-10">
            {/* Ícone premium com animação de desbloqueio */}
            <div className="relative flex items-center justify-center">
              {/* Anel de energia */}
              <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-primary/30 animate-spin-slow"></div>
              <div className="absolute inset-2 w-16 h-16 rounded-full border border-primary/20 animate-pulse"></div>
              
              {/* Fundo do ícone */}
              <div className="relative w-14 h-14 bg-gradient-to-br from-primary/20 via-primary/30 to-primary/10 
                             rounded-2xl border border-primary/40 backdrop-blur-sm shadow-2xl 
                             flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                
                {/* Ícone de cadeado com animação de desbloqueio */}
                <Lock className="h-7 w-7 text-primary drop-shadow-lg animate-pulse" />
                
                {/* Efeito de brilho */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-primary/10 to-primary/20 
                               rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              {/* Reflexo dourado */}
              <div className="absolute inset-0 w-14 h-14 bg-gradient-to-br from-yellow-400/20 to-transparent 
                             rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200"></div>
            </div>
            
            {/* Texto melhorado */}
            <div className="space-y-3">
              <div className="space-y-1">
                <h4 className="text-foreground font-bold text-xl tracking-tight">
                  Conteúdo Exclusivo
                </h4>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent w-8"></div>
                  <Lock className="h-3 w-3 text-primary/60" />
                  <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent w-8"></div>
                </div>
              </div>
              
              <p className="text-muted-foreground text-sm leading-relaxed max-w-48 mx-auto">
                Desbloqueie esta solução e acelere seus resultados com IA
              </p>
              
              {/* Indicador de ação */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 
                             rounded-full border border-primary/20 backdrop-blur-sm
                             group-hover:bg-primary/20 transition-colors duration-300">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-primary">Toque para upgrade</span>
              </div>
            </div>
          </div>
        </div>
        
        <CardHeader className="p-0">
          <div className="aspect-video relative overflow-hidden">
            {solution.thumbnail_url ? (
              <img 
                src={solution.thumbnail_url} 
                alt={solution.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-background">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
                  <div className="relative text-primary text-3xl font-bold">{solution.title.charAt(0)}</div>
                </div>
              </div>
            )}
            
            {/* Aurora overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>
            
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <Badge 
              variant="outline"
              className={`absolute top-3 left-3 backdrop-blur-sm bg-card/90 border-border/40 shadow-lg ${categoryDetails.color}`}
            >
              <span className="flex items-center gap-1.5">
                {categoryDetails.icon}
                <span className="font-medium">{categoryDetails.name}</span>
              </span>
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-5 space-y-3">
          <h3 className="font-semibold text-lg line-clamp-1 text-foreground group-hover:text-primary transition-colors duration-300">
            {solution.title}
          </h3>
          <p className="text-sm text-muted-foreground/80 line-clamp-2 h-14 overflow-hidden">
            {solution.description}
          </p>
        </CardContent>
        
        <CardFooter className="p-5 pt-0 flex gap-2 flex-wrap justify-between items-center">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
            {categoryDetails.icon}
            <span>{categoryDetails.name}</span>
          </div>
          
          <div className="flex gap-2">
            <Badge
              variant="outline"
              className={`font-medium text-xs backdrop-blur-sm ${getDifficultyBadgeStyle(solution.difficulty)}`}
            >
              {solution.difficulty === "easy"
                ? "Fácil"
                : solution.difficulty === "medium"
                ? "Médio"
                : solution.difficulty === "advanced"
                ? "Avançado"
                : solution.difficulty}
            </Badge>
            
            {typeof solution.success_rate === "number" && solution.success_rate > 0 && (
              <Badge 
                variant="outline" 
                className="bg-primary/10 text-primary border-primary/30 backdrop-blur-sm text-xs font-medium"
              >
                {solution.success_rate}% sucesso
              </Badge>
            )}
          </div>
        </CardFooter>
        
        {/* Bottom glow indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30"></div>
      </Card>
    </div>
  );
};
