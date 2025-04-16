
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SolutionsGrid } from "./SolutionsGrid";
import { Solution } from "@/lib/supabase";

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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Soluções disponíveis</h2>
        
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="revenue" className="text-revenue">Receita</TabsTrigger>
          <TabsTrigger value="operational" className="text-operational">Operacional</TabsTrigger>
          <TabsTrigger value="strategy" className="text-strategy">Estratégia</TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="all" className="mt-6">
        <SolutionsGrid 
          solutions={filteredSolutions}
          onSelectSolution={onSelectSolution}
        />
      </TabsContent>
      
      <TabsContent value="revenue" className="mt-6">
        <SolutionsGrid 
          solutions={filteredSolutions.filter(s => s.category === "revenue")}
          onSelectSolution={onSelectSolution}
        />
      </TabsContent>
      
      <TabsContent value="operational" className="mt-6">
        <SolutionsGrid 
          solutions={filteredSolutions.filter(s => s.category === "operational")}
          onSelectSolution={onSelectSolution}
        />
      </TabsContent>
      
      <TabsContent value="strategy" className="mt-6">
        <SolutionsGrid 
          solutions={filteredSolutions.filter(s => s.category === "strategy")}
          onSelectSolution={onSelectSolution}
        />
      </TabsContent>
    </Tabs>
  );
};
