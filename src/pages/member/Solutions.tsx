
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSolutionsData } from '@/hooks/useSolutionsData';
import { SolutionCard } from '@/components/solution/SolutionCard';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter } from 'lucide-react';
import LoadingScreen from '@/components/common/LoadingScreen';
import { Solution } from '@/lib/supabase';
import { useLogging } from '@/hooks/useLogging';
import { useQueryClient } from '@tanstack/react-query';

const Solutions = () => {
  // Logger para depuração
  const { log } = useLogging("SolutionsPage");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  
  // Estado local para armazenar a categoria ativa e termo de pesquisa
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get('category') || 'all'
  );
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );

  // Buscar os dados das soluções
  const { 
    solutions,
    filteredSolutions, 
    loading,
    error
  } = useSolutionsData(activeCategory, searchQuery);

  // Atualizar os parâmetros de URL quando mudar categoria ou pesquisa
  useEffect(() => {
    const params: Record<string, string> = {};
    
    if (activeCategory !== 'all') {
      params.category = activeCategory;
    }
    
    if (searchQuery) {
      params.search = searchQuery;
    }
    
    setSearchParams(params);
  }, [activeCategory, searchQuery, setSearchParams]);

  // Pré-carregar detalhes das soluções quando listar todas
  useEffect(() => {
    if (solutions && solutions.length > 0 && !loading) {
      // Prefetch das primeiras 3 soluções para melhorar a experiência
      solutions.slice(0, 3).forEach(solution => {
        queryClient.prefetchQuery({
          queryKey: ['solution', solution.id],
          queryFn: async () => null, // Apenas para registrar a chave
          staleTime: 2 * 60 * 1000 // 2 minutos
        });
      });
    }
  }, [solutions, loading, queryClient]);

  // Log para diagnóstico
  useEffect(() => {
    log("Solutions page loaded", { 
      solutionsCount: filteredSolutions?.length || 0,
      activeCategory,
      isLoading: loading
    });
  }, [filteredSolutions, activeCategory, loading, log]);

  // Função para lidar com a mudança de categoria
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  // Função para lidar com cliques nas soluções
  const handleSolutionClick = (solution: Solution) => {
    log("Navegando para solução", { solutionId: solution.id, title: solution.title });
    navigate(`/solution/${solution.id}`);
  };

  const categories = [
    { id: 'all', name: 'Todas' },
    { id: 'revenue', name: 'Receita' },
    { id: 'operational', name: 'Operacional' },
    { id: 'strategy', name: 'Estratégia' }
  ];

  // Se estiver carregando as soluções, mostrar tela de carregamento
  if (loading) {
    return <LoadingScreen message="Carregando soluções..." />;
  }

  // Se ocorrer um erro, mostrar mensagem de erro
  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Erro ao carregar soluções</h2>
        <p className="text-gray-600">
          Ocorreu um erro ao tentar buscar as soluções. Por favor, tente novamente mais tarde.
        </p>
      </div>
    );
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

      <Tabs 
        value={activeCategory} 
        onValueChange={handleCategoryChange} 
        className="w-full"
      >
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
            {filteredSolutions?.length === 0 ? (
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
                {filteredSolutions?.map((solution: Solution) => (
                  <SolutionCard 
                    key={solution.id} 
                    solution={solution} 
                    onClick={() => handleSolutionClick(solution)} 
                  />
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
