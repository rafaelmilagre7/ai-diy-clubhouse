
import React, { useState } from 'react';
import { useSolutionsData } from '@/hooks/useSolutionsData';
import { SolutionCard } from '@/components/solution/SolutionCard';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, ShieldAlert } from 'lucide-react';
import LoadingScreen from '@/components/common/LoadingScreen';
import { Solution } from '@/lib/supabase';
import { useToolsData } from '@/hooks/useToolsData';
import { useLogging } from '@/contexts/logging';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Solutions = () => {
  // Definir título da página
  useDocumentTitle('Soluções | VIVER DE IA Club');
  
  // Logger para depuração
  const { log } = useLogging();
  
  // Garantir que as ferramentas estejam corretamente configuradas, mas ignorar erros
  const { isLoading: toolsDataLoading } = useToolsData();
  
  const { 
    filteredSolutions, 
    loading, 
    searchQuery, 
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    canViewSolutions
  } = useSolutionsData();

  // Log data for debugging
  log("Solutions page loaded", { 
    solutionsCount: filteredSolutions?.length || 0, 
    activeCategory,
    isLoading: loading || toolsDataLoading,
    canViewSolutions
  });

  // Atualizado para usar nomes de categorias em português
  const categories = [
    { id: 'all', name: 'Todas' },
    { id: 'Receita', name: 'Receita' },
    { id: 'Operacional', name: 'Operacional' },
    { id: 'Estratégia', name: 'Estratégia' }
  ];

  // Se o usuário não tem permissão para ver soluções, mostrar mensagem
  if (!canViewSolutions) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Soluções</h1>
            <p className="text-neutral-300 mt-1">
              Explore as soluções disponíveis e comece a implementá-las em seu negócio
            </p>
          </div>
        </div>

        <Alert variant="destructive" className="my-8">
          <ShieldAlert className="h-5 w-5" />
          <AlertTitle className="text-white">Acesso restrito</AlertTitle>
          <AlertDescription className="text-neutral-200">
            <p className="mb-4">Você não tem permissão para acessar as soluções. Entre em contato com o administrador para solicitar acesso.</p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard">Voltar para o Dashboard</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Se estiver carregando as soluções, mostrar tela de carregamento
  // Mas não bloquear se apenas as ferramentas estiverem carregando
  if (loading) {
    return <LoadingScreen message="Carregando soluções..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Soluções</h1>
          <p className="text-neutral-300 mt-1">
            Explore as soluções disponíveis e comece a implementá-las em seu negócio
          </p>
        </div>

        <div className="w-full sm:w-auto flex gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              type="search"
              placeholder="Buscar soluções..."
              className="pl-8 bg-[#1A1E2E] text-white border-neutral-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="mb-6 flex flex-wrap bg-[#1A1E2E]/80 border border-neutral-700">
          {categories.map((category) => (
            <TabsTrigger 
              key={category.id}
              value={category.id}
              className="flex-1 sm:flex-none text-neutral-300 data-[state=active]:bg-viverblue data-[state=active]:text-white"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-0">
            {filteredSolutions?.length === 0 ? (
              <div className="text-center py-8 bg-[#151823] rounded-lg border border-neutral-700 border-dashed">
                <div className="flex flex-col items-center px-4">
                  <Filter className="h-10 w-10 text-neutral-400 mb-3" />
                  <h3 className="text-lg font-medium text-white">Nenhuma solução encontrada</h3>
                  <p className="text-neutral-400 text-sm mt-1 max-w-md">
                    Não encontramos soluções com esse filtro. Tente selecionar outra categoria ou ajuste sua busca.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSolutions?.map((solution: Solution) => (
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
