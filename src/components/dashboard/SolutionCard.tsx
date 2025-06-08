
import React from 'react';
import { Link } from 'react-router-dom';
import { Solution } from '@/lib/supabase';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { BarChart, TrendingUp, Settings, Zap, ImageIcon, Play, Clock, Users, ArrowRight, Bookmark, Star } from 'lucide-react';
import { SolutionCategory, getCategoryConfig } from '@/lib/types/categoryTypes';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SolutionCardProps {
  solution: Solution;
  onClick?: () => void;
  variant?: 'default' | 'compact' | 'featured';
}

const getDifficultyBadgeVariant = (difficulty: string) => {
  switch (difficulty) {
    case "easy":
      return "success";
    case "medium":
      return "warning";
    case "advanced":
      return "error";
    default:
      return "secondary";
  }
};

const getDifficultyLabel = (difficulty: string) => {
  switch (difficulty) {
    case "easy":
      return "Fácil";
    case "medium":
      return "Médio";
    case "advanced":
      return "Avançado";
    default:
      return difficulty;
  }
};

export const SolutionCard: React.FC<SolutionCardProps> = ({ 
  solution, 
  onClick,
  variant = 'default'
}) => {
  const categoryConfig = getCategoryConfig(solution.category as SolutionCategory);
  
  const getCategoryIcon = () => {
    switch (categoryConfig.icon) {
      case 'TrendingUp':
        return <TrendingUp className="h-4 w-4" />;
      case 'Settings':
        return <Settings className="h-4 w-4" />;
      case 'BarChart':
        return <BarChart className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    }
  };

  if (variant === 'compact') {
    return (
      <Card 
        variant="interactive" 
        className="h-full overflow-hidden transition-all duration-300 hover:shadow-glow-primary group cursor-pointer"
        onClick={handleClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="relative w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
              {solution.thumbnail_url ? (
                <img 
                  src={solution.thumbnail_url} 
                  alt={solution.title} 
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <ImageIcon className="h-8 w-8 text-text-muted" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <Text variant="body" textColor="primary" className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                  {solution.title}
                </Text>
                <Badge 
                  variant={categoryConfig.badgeVariant}
                  size="xs"
                  className="ml-2 flex-shrink-0"
                >
                  {getCategoryIcon()}
                </Badge>
              </div>
              
              <Text variant="caption" textColor="secondary" className="line-clamp-2 mb-2">
                {solution.description}
              </Text>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={getDifficultyBadgeVariant(solution.difficulty)}
                    size="xs"
                  >
                    {getDifficultyLabel(solution.difficulty)}
                  </Badge>
                </div>
                
                <ArrowRight className="h-4 w-4 text-text-tertiary group-hover:text-primary transition-colors" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'featured') {
    return (
      <Card 
        variant="elevated" 
        className={cn(
          "h-full overflow-hidden transition-all duration-300 group cursor-pointer",
          "bg-gradient-to-br from-primary/5 via-surface to-accent/5",
          "border-primary/20 hover:border-primary/40 hover:shadow-glow-primary"
        )}
        onClick={handleClick}
      >
        <CardHeader className="p-0 relative">
          <div className="relative h-56 bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
            {solution.thumbnail_url ? (
              <img 
                src={solution.thumbnail_url} 
                alt={solution.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-elevated to-surface-hover">
                <ImageIcon className="h-16 w-16 text-text-muted" />
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
              <Badge 
                variant="accent"
                className="backdrop-blur-sm bg-accent/90 text-white border-0"
                size="sm"
              >
                <Star className="h-3 w-3 mr-1" />
                Destaque
              </Badge>
              
              <Button
                variant="ghost"
                size="icon-sm"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-0"
              >
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="absolute bottom-4 left-4 right-4">
              <Badge 
                variant={categoryConfig.badgeVariant}
                className="backdrop-blur-sm shadow-sm mb-2"
                size="sm"
              >
                <span className="flex items-center gap-1.5">
                  {getCategoryIcon()}
                  <span>{categoryConfig.name}</span>
                </span>
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-4">
          <div className="space-y-3">
            <Text 
              variant="subsection" 
              textColor="primary" 
              className="line-clamp-2 group-hover:text-primary transition-colors font-bold"
            >
              {solution.title}
            </Text>
            
            <Text variant="body" textColor="secondary" className="line-clamp-3 leading-relaxed">
              {solution.description}
            </Text>
          </div>

          <div className="flex items-center gap-4 text-text-tertiary">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <Text variant="caption" textColor="tertiary">10-15 min</Text>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <Text variant="caption" textColor="tertiary">Avançado</Text>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-6 pt-0 flex items-center justify-between border-t border-border-subtle bg-surface-elevated/50">
          <div className="flex items-center gap-2">
            <Badge
              variant={getDifficultyBadgeVariant(solution.difficulty)}
              size="sm"
            >
              {getDifficultyLabel(solution.difficulty)}
            </Badge>
            
            {typeof solution.success_rate === "number" && solution.success_rate > 0 && (
              <Badge variant="info" size="sm">
                {solution.success_rate}% sucesso
              </Badge>
            )}
          </div>
          
          <Button variant="ghost" size="sm" className="group-hover:bg-primary group-hover:text-white transition-all">
            <Play className="h-4 w-4 mr-2" />
            Começar
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Link to={`/solution/${solution.id}`} className="block group">
      <Card 
        variant="elevated" 
        className={cn(
          "h-full overflow-hidden transition-all duration-300",
          "hover:shadow-glow-primary hover:-translate-y-1",
          "group-hover:border-primary/30 bg-gradient-to-br from-surface to-surface-elevated"
        )}
      >
        <CardHeader className="p-0 relative">
          <div className="relative h-48 bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
            {solution.thumbnail_url ? (
              <img 
                src={solution.thumbnail_url} 
                alt={solution.title} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-elevated to-surface-hover">
                <ImageIcon className="h-12 w-12 text-text-muted" />
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-primary/90 backdrop-blur-sm rounded-full p-3 transform scale-90 group-hover:scale-100 transition-transform duration-300">
                <Play className="h-6 w-6 text-white fill-current" />
              </div>
            </div>
            
            <Badge 
              variant={categoryConfig.badgeVariant}
              className="absolute top-3 left-3 backdrop-blur-sm shadow-sm"
              size="sm"
            >
              <span className="flex items-center gap-1.5">
                {getCategoryIcon()}
                <span>{categoryConfig.name}</span>
              </span>
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 flex-1 flex flex-col space-y-4">
          <div className="space-y-3">
            <Text 
              variant="card" 
              textColor="primary" 
              className="line-clamp-2 group-hover:text-primary transition-colors font-semibold"
            >
              {solution.title}
            </Text>
            
            <Text variant="body-small" textColor="secondary" className="line-clamp-3 leading-relaxed">
              {solution.description}
            </Text>
          </div>

          <div className="flex items-center gap-4 text-text-tertiary">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <Text variant="caption" textColor="tertiary">5-10 min</Text>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <Text variant="caption" textColor="tertiary">Intermediário</Text>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-6 pt-0 flex items-center justify-between border-t border-border-subtle bg-surface-elevated/50">
          <div className="flex items-center gap-2">
            {getCategoryIcon()}
            <Text variant="caption" textColor="tertiary" className="font-medium">
              {categoryConfig.name}
            </Text>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge
              variant={getDifficultyBadgeVariant(solution.difficulty)}
              size="sm"
            >
              {getDifficultyLabel(solution.difficulty)}
            </Badge>
            
            {typeof solution.success_rate === "number" && solution.success_rate > 0 && (
              <Badge variant="info" size="sm">
                {solution.success_rate}% sucesso
              </Badge>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};
