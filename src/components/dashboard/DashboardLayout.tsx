
import React from 'react';
import { Solution } from '@/lib/supabase/types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SolutionsGrid } from './SolutionsGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { NoSolutionsPlaceholder } from './NoSolutionsPlaceholder';

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
  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        
        <Tabs defaultValue={currentCategory} className="mt-6" value={currentCategory} onValueChange={onCategoryChange}>
          <TabsList>
            <TabsTrigger value="recommended">Recomendadas</TabsTrigger>
            <TabsTrigger value="active">Em andamento</TabsTrigger>
            <TabsTrigger value="completed">Concluídas</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, index) => (
            <Card key={index} className="p-4">
              <Skeleton className="h-4 w-3/4 mb-3" />
              <Skeleton className="h-16 w-full mb-2" />
              <Skeleton className="h-4 w-1/3" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Renderizar o conteúdo apropriado com base na categoria selecionada
  const renderSolutionsContent = (solutionsToRender: Solution[]) => {
    if (!solutionsToRender || solutionsToRender.length === 0) {
      return <NoSolutionsPlaceholder />;
    }
    
    return <SolutionsGrid solutions={solutionsToRender} onSolutionClick={onSolutionClick} />;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold">Dashboard</h2>
      
      <Tabs defaultValue={currentCategory} className="mt-6" value={currentCategory} onValueChange={onCategoryChange}>
        <TabsList>
          <TabsTrigger value="recommended">Recomendadas</TabsTrigger>
          <TabsTrigger value="active">Em andamento</TabsTrigger>
          <TabsTrigger value="completed">Concluídas</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="recommended">
            {renderSolutionsContent(solutions.recommended)}
          </TabsContent>
          
          <TabsContent value="active">
            {renderSolutionsContent(solutions.active)}
          </TabsContent>
          
          <TabsContent value="completed">
            {renderSolutionsContent(solutions.completed)}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default DashboardLayout;
