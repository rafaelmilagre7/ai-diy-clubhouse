
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BarChart, TrendingUp, Settings, Sparkles, Grid3X3 } from "lucide-react";

export interface CategoryTabsProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  counts?: Record<string, number>;
}

export const CategoryTabs = ({ 
  activeCategory, 
  setActiveCategory,
  counts = {}
}: CategoryTabsProps) => {
  // Categorias atualizadas com ícones e cores
  const categories = [
    { 
      id: "all", 
      name: "Todas",
      icon: Grid3X3,
      color: "text-text-primary",
      activeColor: "text-primary"
    },
    { 
      id: "Receita", 
      name: "Receita",
      icon: TrendingUp,
      color: "text-success",
      activeColor: "text-success"
    },
    { 
      id: "Operacional", 
      name: "Operacional",
      icon: Settings,
      color: "text-warning",
      activeColor: "text-warning"
    },
    { 
      id: "Estratégia", 
      name: "Estratégia",
      icon: BarChart,
      color: "text-info",
      activeColor: "text-info"
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header com informações */}
      <div className="flex items-center justify-between">
        <div>
          <Text variant="subsection" textColor="primary" className="font-bold">
            Categorias
          </Text>
          <Text variant="body-small" textColor="secondary">
            Explore soluções por área de impacto
          </Text>
        </div>
        
        <div className="hidden md:flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <Text variant="caption" textColor="accent" className="font-medium">
            {Object.values(counts).reduce((acc, count) => acc + count, 0)} soluções disponíveis
          </Text>
        </div>
      </div>

      {/* Tabs modernos */}
      <div className="flex space-x-1 overflow-x-auto pb-2 md:pb-0 bg-surface-elevated rounded-xl p-1 border border-border-subtle">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;
          const count = counts[category.id] || 0;
          
          return (
            <Button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              variant="ghost"
              size="sm"
              className={cn(
                "flex items-center gap-2 text-sm whitespace-nowrap transition-all duration-200 hover-scale rounded-lg px-4 py-2.5 min-h-[44px]",
                isActive
                  ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary shadow-sm border border-primary/20"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
              )}
            >
              <Icon className={cn(
                "h-4 w-4 transition-colors duration-200",
                isActive ? category.activeColor : category.color
              )} />
              
              <span className="font-medium">{category.name}</span>
              
              {count > 0 && (
                <Badge 
                  variant={isActive ? "accent" : "secondary"} 
                  size="xs"
                  className="ml-1"
                >
                  {count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {/* Indicador visual para categoria ativa */}
      <div className="hidden md:block">
        {categories.map((category) => {
          if (activeCategory !== category.id) return null;
          
          const Icon = category.icon;
          return (
            <div 
              key={category.id}
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-primary/10"
            >
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Text variant="body" textColor="primary" className="font-semibold">
                  {category.name === "Todas" ? "Todas as Categorias" : `Categoria: ${category.name}`}
                </Text>
                <Text variant="caption" textColor="secondary">
                  {category.id === "all" 
                    ? "Visualizando todas as soluções disponíveis"
                    : `Soluções focadas em ${category.name.toLowerCase()}`
                  }
                </Text>
              </div>
              {counts[category.id] > 0 && (
                <Badge variant="primary" className="ml-auto">
                  {counts[category.id]} soluções
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
