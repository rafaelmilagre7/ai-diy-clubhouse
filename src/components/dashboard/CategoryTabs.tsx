
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ALL_CATEGORIES } from "@/lib/types/categoryTypes";

export interface CategoryTabsProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

export const CategoryTabs = ({ activeCategory, setActiveCategory }: CategoryTabsProps) => {
  return (
    <div className="flex space-x-sm overflow-x-auto pb-2 md:pb-0">
      {ALL_CATEGORIES.map((category) => (
        <Button
          key={category.id}
          onClick={() => setActiveCategory(category.id)}
          variant="ghost"
          size="sm"
          className={cn(
            "text-sm whitespace-nowrap",
            activeCategory === category.id
              ? "bg-aurora-primary/10 text-aurora-primary hover:bg-aurora-primary/20 hover:text-aurora-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};
