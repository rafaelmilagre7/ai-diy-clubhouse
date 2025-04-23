
import React from 'react';
import { Solution } from '@/types/solution';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface DashboardLayoutProps {
  solutions: {
    active: Solution[];
    recommended: Solution[];
    completed: any[];
  };
  isLoading: boolean;
  onCategoryChange: (category: string) => void;
  onSolutionClick: (solution: Solution) => void;
  currentCategory: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  solutions,
  isLoading,
  onCategoryChange,
  onSolutionClick,
  currentCategory
}) => {
  return (
    <div>
      <h2 className="text-2xl font-bold">Dashboard</h2>
      
      <Tabs defaultValue="recommended" className="mt-6" value={currentCategory} onValueChange={onCategoryChange}>
        <TabsList>
          <TabsTrigger value="recommended">Recomendadas</TabsTrigger>
          <TabsTrigger value="active">Em andamento</TabsTrigger>
          <TabsTrigger value="completed">Concluídas</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="mt-6">
        {isLoading ? (
          <div className="py-10 text-center">Carregando...</div>
        ) : (
          <div>
            {currentCategory === 'recommended' && renderSolutions(solutions.recommended)}
            {currentCategory === 'active' && renderSolutions(solutions.active)}
            {currentCategory === 'completed' && renderSolutions(solutions.completed)}
          </div>
        )}
      </div>
    </div>
  );
  
  function renderSolutions(solutionsToRender: Solution[]) {
    if (solutionsToRender.length === 0) {
      return (
        <div className="text-center py-10 text-muted-foreground">
          Nenhuma solução encontrada nesta categoria.
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {solutionsToRender.map(solution => (
          <div 
            key={solution.id} 
            className="border rounded-lg p-4 cursor-pointer hover:shadow-md"
            onClick={() => onSolutionClick(solution)}
          >
            <h3 className="font-semibold">{solution.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{solution.description}</p>
          </div>
        ))}
      </div>
    );
  }
};

export default DashboardLayout;
