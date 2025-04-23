
import React from "react";
import { Solution } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNowStrict } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SolutionCardProps {
  solution: Solution;
  onClick: () => void;
}

export const SolutionCard = ({ solution, onClick }: SolutionCardProps) => {
  // Classes de gradiente baseadas na categoria
  const categoryGradient = {
    revenue: "from-green-50 to-white border-l-4 border-l-green-500",
    operational: "from-blue-50 to-white border-l-4 border-l-blue-500",
    strategy: "from-purple-50 to-white border-l-4 border-l-purple-500",
    default: "from-gray-50 to-white border-l-4 border-l-gray-500"
  };
  
  const gradientClass = 
    solution.category in categoryGradient
      ? categoryGradient[solution.category as keyof typeof categoryGradient]
      : categoryGradient.default;
      
  // Data de criação formatada
  const formattedDate = solution.created_at
    ? formatDistanceToNowStrict(new Date(solution.created_at), {
        addSuffix: true,
        locale: ptBR
      })
    : "";
    
  // Dificuldade formatada
  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "Fácil";
      case "medium": return "Média";
      case "hard": return "Difícil";
      default: return "Média";
    }
  };
  
  // Cores baseadas na dificuldade
  const difficultyColors = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-red-100 text-red-800",
    default: "bg-gray-100 text-gray-800"
  };
  
  const difficultyColor = 
    solution.difficulty in difficultyColors
      ? difficultyColors[solution.difficulty as keyof typeof difficultyColors]
      : difficultyColors.default;
      
  // Usar diretamente o onClick passado por props, mantendo o caminho consistente
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick();
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md",
        "bg-gradient-to-br",
        gradientClass
      )}
      onClick={handleClick}
    >
      <CardContent className="p-0">
        {/* Thumbnail */}
        {solution.thumbnail_url && (
          <div className="w-full h-40 relative">
            <img 
              src={solution.thumbnail_url} 
              alt={solution.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Content */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="capitalize">
              {solution.category === "revenue" ? "Receita" : 
               solution.category === "operational" ? "Operacional" : 
               solution.category === "strategy" ? "Estratégia" : 
               solution.category}
            </Badge>
            
            <Badge className={cn("text-xs", difficultyColor)}>
              {getDifficultyLabel(solution.difficulty)}
            </Badge>
          </div>
          
          <h3 className="font-semibold text-lg line-clamp-2 mb-2">{solution.title}</h3>
          
          <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
            {solution.description}
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center p-4 pt-0">
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="w-3 h-3 mr-1" />
          <span>Criada {formattedDate}</span>
        </div>
        
        <Button variant="ghost" size="sm" className="gap-1" onClick={handleClick}>
          <span className="sr-only md:not-sr-only md:inline-block">Ver</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
