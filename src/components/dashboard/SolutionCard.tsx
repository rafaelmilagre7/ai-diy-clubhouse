
import { Solution } from "@/hooks/dashboard/types";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CardThumbnail } from "./CardThumbnail";
import { CardHeader } from "./CardHeader";
import { CardContentSection } from "./CardContent";
import { CardFooterSection } from "./CardFooter";
import { SolutionCategory } from "@/lib/types/categoryTypes";

interface SolutionCardProps {
  solution: Solution;
  onClick: () => void;
}

export const SolutionCard = ({ solution, onClick }: SolutionCardProps) => {
  const handleSelect = () => {
    console.log("Card selecionado, navegando para a solução:", solution.id);
    onClick();
  };

  // Função para mapeamento de categorias para classes CSS
  const getCategoryStyleName = (category: SolutionCategory): string => {
    switch (category) {
      case "Receita":
        return "revenue";
      case "Operacional":
        return "operational";
      case "Estratégia":
        return "strategy";
      default:
        return "";
    }
  };

  // Definir classes específicas baseadas na categoria
  const categoryStyles: Record<string, string> = {
    revenue: "from-revenue-lighter to-white/95 border-l-4 border-l-revenue",
    operational: "from-operational-lighter to-white/95 border-l-4 border-l-operational",
    strategy: "from-strategy-lighter to-white/95 border-l-4 border-l-strategy"
  };

  // Obter o estilo correspondente à categoria atual
  const categoryStyle = categoryStyles[getCategoryStyleName(solution.category)] || "from-gray-100 to-white";

  // Aplicar animação de entrada com delay baseado na posição
  // Isso será processado pelo CSS na classe animate-fade-in definida em utilities.css
  const getAnimationDelay = () => {
    const randomDelay = Math.floor(Math.random() * 5) * 100; // 0, 100, 200, 300, 400ms
    return { '--delay': randomDelay } as React.CSSProperties;
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden rounded-xl shadow-md transition-all duration-300 cursor-pointer",
        "hover:shadow-xl hover:translate-y-[-4px]",
        "bg-gradient-to-br stat-item-enter",
        categoryStyle
      )}
      style={getAnimationDelay()}
      onClick={handleSelect}
    >
      <CardContent className="p-0 relative">
        <CardThumbnail thumbnailUrl={solution.thumbnail_url} />
        <div className="p-4 space-y-3">
          <CardHeader 
            category={solution.category} 
            difficulty={solution.difficulty} 
          />
          <CardContentSection 
            title={solution.title} 
            description={solution.description} 
          />
        </div>
      </CardContent>
      <CardFooter className="p-0">
        <CardFooterSection 
          createdAt={solution.created_at} 
          onSelect={handleSelect} 
        />
      </CardFooter>
    </Card>
  );
};
