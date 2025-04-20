
import React, { useState, useEffect } from 'react';
import { useSolutionsData } from '@/hooks/useSolutionsData';
import { SolutionCard } from '@/components/solution/SolutionCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter } from 'lucide-react';
import LoadingScreen from '@/components/common/LoadingScreen';
import { Solution } from '@/lib/supabase';
import { useToolsData } from '@/hooks/useToolsData';

const Solutions = () => {
  // Garantir que as ferramentas estejam corretamente configuradas
  const { isFixing } = useToolsData();
  
  const { 
    filteredSolutions, 
    loading, 
    searchQuery, 
    setSearchQuery,
    activeCategory,
    setActiveCategory
  } = useSolutionsData(null);

  const categories = [
    { id: 'all', name: 'Todas' },
    { id: 'revenue', name: 'Receita' },
    { id: 'operational', name: 'Operacional' },
    { id: 'strategy', name: 'Estratégia' }
  ];

  // Se estiver corrigindo as ferramentas, mostrar também carregando
  if (loading || isFixing) {
    return <LoadingScreen message="Carregando soluções..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Soluções</h1>
          <p className="text-muted-foreground mt-1">
            Explore as soluções disponíveis e comece a implementá-las em seu negócio
          </p>
        </div>

        <div className="w-full sm:w-auto flex gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar soluções..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="mb-6 flex flex-wrap">
          {categories.map((category) => (
            <TabsTrigger 
              key={category.id}
              value={category.id}
              className="flex-1 sm:flex-none"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-0">
            {filteredSolutions.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg border border-dashed">
                <div className="flex flex-col items-center px-4">
                  <Filter className="h-10 w-10 text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium">Nenhuma solução encontrada</h3>
                  <p className="text-muted-foreground text-sm mt-1 max-w-md">
                    Não encontramos soluções com esse filtro. Tente selecionar outra categoria ou ajuste sua busca.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSolutions.map((solution: Solution) => (
                  <SolutionCard key={solution.id} solution={solution} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Solutions;
