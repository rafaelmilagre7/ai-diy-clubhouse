
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { categoryMapping } from "@/lib/types/categoryTypes";

export interface CategoryTabsProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

export const CategoryTabs = ({ activeCategory, setActiveCategory }: CategoryTabsProps) => {
  // Mantemos as chaves antigas para IDs para compatibilidade com o resto do sistema
  const categories = [
    { id: "all", name: "Todas" },
    { id: "Receita", name: "Receita" },
    { id: "Operacional", name: "Otimização Operacional" },
    { id: "Estratégia", name: "Gestão Estratégica" }
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
              ? "bg-[#0ABAB5]/10 text-[#0ABAB5] hover:bg-[#0ABAB5]/20 hover:text-[#0ABAB5]"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};
