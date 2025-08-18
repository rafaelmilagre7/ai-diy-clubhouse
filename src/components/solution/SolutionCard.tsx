
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
      return "bg-green-900/40 text-green-300 border-green-700";
    case "medium":
      return "bg-yellow-900/40 text-yellow-300 border-yellow-700";
    case "advanced":
      return "bg-red-900/40 text-red-300 border-red-700";
    default:
      return "bg-gray-800/60 text-gray-300 border-gray-700";
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
        icon = <TrendingUp className="h-4 w-4 text-green-400" />;
        break;
      case 'Operacional':
        icon = <Settings className="h-4 w-4 text-blue-400" />;
        break;
      case 'Estratégia':
        icon = <BarChart className="h-4 w-4 text-purple-400" />;
        break;
      default:
        icon = <Zap className="h-4 w-4 text-gray-400" />;
    }

    return {
      ...details,
      icon,
      color: category === 'Receita' ? 'bg-green-900/40 text-green-300 border-green-700' :
             category === 'Operacional' ? 'bg-blue-900/40 text-blue-300 border-blue-700' :
             category === 'Estratégia' ? 'bg-purple-900/40 text-purple-300 border-purple-700' :
             'bg-gray-800/60 text-gray-300 border-gray-700'
    };
  };

  const categoryDetails = getCategoryDetailsWithIcon(solution.category);

  const handleClick = (e: React.MouseEvent) => {
    if (!hasAccess && onUpgradeRequired) {
      e.preventDefault();
      onUpgradeRequired();
    }
  };

  const CardComponent = hasAccess ? Link : 'div';

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
        
        {/* Premium Overlay para usuários sem acesso */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60 z-30 flex items-center justify-center backdrop-blur-sm">
          <div className="text-center space-y-3">
            <div className="p-3 bg-gradient-to-r from-viverblue via-viverblue/90 to-viverblue/80 rounded-full w-fit mx-auto shadow-2xl">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <Badge className="bg-gradient-to-r from-viverblue via-viverblue/90 to-viverblue/80 text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg">
              <Lock className="h-3 w-3 mr-2" />
              PREMIUM
            </Badge>
            <p className="text-white/90 text-sm font-medium">Clique para fazer upgrade</p>
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
            
            {/* Premium Badge para usuários sem acesso */}
            <Badge 
              className="absolute top-3 right-3 bg-gradient-to-r from-viverblue via-viverblue/90 to-viverblue/80 text-white border-0 shadow-lg backdrop-blur-sm"
            >
              <Crown className="h-3 w-3 mr-1" />
              PREMIUM
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
        <div className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-viverblue/30 via-viverblue/60 to-viverblue/30"></div>
      </Card>
    </div>
  );
};
