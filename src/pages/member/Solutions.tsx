
import React, { useState, useEffect, useCallback } from 'react';
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
import { NoSolutionsPlaceholder } from '@/components/dashboard/NoSolutionsPlaceholder';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toSolutionCategory } from '@/lib/types/categoryTypes';

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
  const [difficulty, setDifficulty] = useState(
    searchParams.get('difficulty') || 'all'
  );

  // Buscar os dados das soluções
  const { 
    solutions,
    filteredSolutions, 
    loading,
    error,
    refetch
  } = useSolutionsData(activeCategory, searchQuery, difficulty);

  // Atualizar os parâmetros de URL quando mudar categoria ou pesquisa
  useEffect(() => {
    const params: Record<string, string> = {};
    
    if (activeCategory !== 'all') {
      params.category = activeCategory;
    }
    
    if (searchQuery) {
      params.search = searchQuery;
    }
    
    if (difficulty !== 'all') {
      params.difficulty = difficulty;
    }
    
    setSearchParams(params);
  }, [activeCategory, searchQuery, difficulty, setSearchParams]);

  // Função para lidar com a mudança de categoria
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  // Função para lidar com a mudança de dificuldade
  const handleDifficultyChange = (value: string) => {
    setDifficulty(value);
  };

  // Função para lidar com cliques nas soluções
  const handleSolutionClick = useCallback((solution: Solution) => {
    // Validar dados da solução antes de navegar
    if (!solution || !solution.id) {
      log("ERRO: Tentativa de navegação com solução inválida", { solution });
      return;
    }
    
    // Log detalhado para diagnóstico
    log("Navegando para solução", { 
      solutionId: solution.id, 
      title: solution.title,
      path: `/solutions/${solution.id}`,
      category: solution.category,
      normalizedCategory: toSolutionCategory(solution.category),
      difficulty: solution.difficulty
    });
    
    // Verificar se temos um ID válido antes de navegar
    if (!solution.id || typeof solution.id !== 'string' || solution.id.trim() === '') {
      log("ERRO: ID da solução é inválido", { solution });
      return;
    }

    // Limpar cache de qualquer erro anterior
    queryClient.invalidateQueries({ queryKey: ['solution', solution.id] });
    
    // Verificar se o ID é válido e convertê-lo para string
    const id = String(solution.id).trim();
    if (!id) {
      log("ERRO: ID inválido após conversão", { originalId: solution.id });
      return;
    }
    
    // Navegar para a página de detalhes da solução com o parâmetro de ID
    navigate(`/solutions/${id}`);
  }, [log, navigate, queryClient]);

  const categories = [
    { id: 'all', name: 'Todas' },
    { id: 'revenue', name: 'Receita' },
    { id: 'operational', name: 'Operacional' },
    { id: 'strategy', name: 'Estratégia' }
  ];
  
  const difficultyOptions = [
    { value: 'all', label: 'Todas as dificuldades' },
    { value: 'easy', label: 'Fácil' },
    { value: 'medium', label: 'Intermediário' },
    { value: 'advanced', label: 'Avançado' }
  ];

  // Função para tentar carregar novamente as soluções em caso de erro
  const handleRetry = () => {
    refetch();
  };

  // Se estiver carregando as soluções, mostrar tela de carregamento
  if (loading) {
    return <LoadingScreen message="Carregando soluções..." />;
  }

  // Se ocorrer um erro, mostrar mensagem de erro com opção para tentar novamente
  if (error) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border shadow-sm">
        <h2 className="text-2xl font-bold mb-2">Erro ao carregar soluções</h2>
        <p className="text-gray-600 mb-6">
          {error instanceof Error ? error.message : "Ocorreu um erro ao tentar buscar as soluções. Por favor, tente novamente."}
        </p>
        <Button 
          onClick={handleRetry}
          className="px-4 py-2 bg-[#0ABAB5] text-white rounded-md hover:bg-[#099388] transition-colors"
        >
          Tentar novamente
        </Button>
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filtrar por dificuldade</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={difficulty} onValueChange={handleDifficultyChange}>
                {difficultyOptions.map((option) => (
                  <DropdownMenuRadioItem key={option.value} value={option.value}>
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
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
              <NoSolutionsPlaceholder />
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
