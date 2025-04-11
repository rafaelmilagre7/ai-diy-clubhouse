
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Solution } from "@/lib/supabase";
import { SolutionsGrid } from "./SolutionsGrid";

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  filteredSolutions: Solution[];
  onSelectSolution: (id: string) => void;
}

export const CategoryTabs = ({
  activeCategory,
  onCategoryChange,
  filteredSolutions,
  onSelectSolution,
}: CategoryTabsProps) => {
  return (
    <Tabs defaultValue={activeCategory} onValueChange={onCategoryChange}>
      <TabsList>
        <TabsTrigger value="all">Todas</TabsTrigger>
        <TabsTrigger value="revenue" className="text-revenue">Receita</TabsTrigger>
        <TabsTrigger value="operational" className="text-operational">Operacional</TabsTrigger>
        <TabsTrigger value="strategy" className="text-strategy">Estratégia</TabsTrigger>
      </TabsList>
      
      <div className="mt-6">
        <SolutionsGrid 
          solutions={filteredSolutions} 
          onSelectSolution={onSelectSolution} 
        />
      </div>
    </Tabs>
  );
};
