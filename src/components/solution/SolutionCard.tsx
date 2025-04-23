
import { Solution } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useLogging } from "@/hooks/useLogging";
import { toast } from "sonner";

interface SolutionCardProps {
  solution: Solution;
  onClick?: () => void;
  className?: string;
}

export const SolutionCard = ({ solution, onClick, className }: SolutionCardProps) => {
  const navigate = useNavigate();
  const { log } = useLogging("SolutionCard");

  const handleClick = () => {
    // Validação rigorosa do ID antes de navegar
    if (!solution || !solution.id) {
      const errorMsg = "Solução inválida: ID ausente";
      log("ERRO: " + errorMsg, { solution });
      toast.error(errorMsg);
      return;
    }
    
    // Garantir que o ID é uma string válida
    const id = String(solution.id).trim();
    if (!id) {
      const errorMsg = "ID da solução é inválido após conversão";
      log("ERRO: " + errorMsg, { originalId: solution.id });
      toast.error(errorMsg);
      return;
    }
    
    // Log detalhado para diagnóstico
    log("Clique na solução", { 
      solutionId: id, 
      title: solution.title,
      path: `/solutions/${id}`
    });
    
    if (onClick) {
      onClick();
    } else {
      // Navegar com ID validado
      navigate(`/solutions/${id}`);
    }
  };

  // Traduzir nível de dificuldade
  const translateDifficulty = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy": return "Fácil";
      case "medium": return "Médio";
      case "advanced": return "Avançado";
      default: return difficulty || "Não definido";
    }
  };

  // Classes de gradiente baseadas na categoria
  const categoryGradient = {
    revenue: "from-revenue-lighter to-white border-l-4 border-l-revenue",
    operational: "from-operational-lighter to-white border-l-4 border-l-operational",
    strategy: "from-strategy-lighter to-white border-l-4 border-l-strategy"
  };

  // Fallback para categoria desconhecida
  const gradientClass = solution.category && categoryGradient[solution.category as keyof typeof categoryGradient]
    ? categoryGradient[solution.category as keyof typeof categoryGradient]
    : "from-gray-50 to-white border-l-4 border-l-gray-300";

  return (
    <Card 
      className={cn(
        "overflow-hidden rounded-xl shadow-md transition-all duration-300 cursor-pointer depth-effect",
        "hover:shadow-xl hover:translate-y-[-4px]",
        "bg-gradient-to-br",
        gradientClass,
        className
      )}
      onClick={handleClick}
      data-solution-id={solution.id}
    >
      <CardContent className="p-0 relative">
        {/* Thumbnail */}
        {solution.thumbnail_url && (
          <div className="h-48 w-full overflow-hidden">
            <img 
              src={solution.thumbnail_url} 
              alt={solution.title} 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Tratamento para erro de imagem
                log("Erro ao carregar thumbnail", { 
                  src: solution.thumbnail_url,
                  solutionId: solution.id
                });
                e.currentTarget.src = 'https://placehold.co/600x400?text=VIVER+DE+IA';
              }}
            />
          </div>
        )}
        
        <div className="p-4 space-y-2">
          {/* Category and difficulty */}
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="capitalize text-xs">
              {solution.category === "revenue" ? "Receita" : 
               solution.category === "operational" ? "Operacional" : 
               solution.category === "strategy" ? "Estratégia" : 
               solution.category}
            </Badge>
            
            {solution.difficulty && (
              <span className={cn(
                "text-xs px-2 py-1 rounded-full",
                solution.difficulty.toLowerCase() === "easy" ? "bg-green-100 text-green-800" :
                solution.difficulty.toLowerCase() === "medium" ? "bg-yellow-100 text-yellow-800" :
                solution.difficulty.toLowerCase() === "advanced" ? "bg-red-100 text-red-800" :
                "bg-gray-100 text-gray-800"
              )}>
                {translateDifficulty(solution.difficulty)}
              </span>
            )}
          </div>
          
          {/* Title and description */}
          <div>
            <h3 className="font-semibold text-lg mb-1">{solution.title}</h3>
            <p className="text-muted-foreground text-sm line-clamp-3">
              {solution.description}
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-3 border-t border-gray-100 flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
          {solution.created_at ? new Date(solution.created_at).toLocaleDateString('pt-BR') : ""}
        </span>
        <span className="text-xs font-medium text-primary hover:underline">
          Ver detalhes
        </span>
      </CardFooter>
    </Card>
  );
};
