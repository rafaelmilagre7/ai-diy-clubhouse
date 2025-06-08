
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CategoryTabsProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

export const CategoryTabs = ({ activeCategory, setActiveCategory }: CategoryTabsProps) => {
  // Categorias atualizadas para o novo sistema
  const categories = [
    { id: "all", name: "Todas" },
    { id: "Receita", name: "Receita" },
    { id: "Operacional", name: "Operacional" },
    { id: "Estratégia", name: "Estratégia" }
  ];

  return (
    <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
      {categories.map((category) => (
        <Button
          key={category.id}
          onClick={() => setActiveCategory(category.id)}
          variant="ghost"
          size="sm"
          className={cn(
            "text-sm whitespace-nowrap",
            activeCategory === category.id
              ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
              : "text-text-secondary hover:text-text-primary"
          )}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};
