
import React, { useState } from 'react';
import { useSolutionsData } from '@/hooks/useSolutionsData';
import { SolutionCard } from '@/components/solution/SolutionCard';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, ShieldAlert } from 'lucide-react';
import LoadingScreen from '@/components/common/LoadingScreen';
import { Solution } from '@/lib/supabase';
import { useToolsData } from '@/hooks/useToolsData';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Container } from '@/components/ui/container';
import { Link } from 'react-router-dom';

const Solutions = () => {
  useDocumentTitle('Soluções | VIVER DE IA Club');
  
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

  console.log("Solutions page loaded", { 
    solutionsCount: filteredSolutions?.length || 0, 
    activeCategory,
    isLoading: loading || toolsDataLoading,
    canViewSolutions
  });

  const categories = [
    { id: 'all', name: 'Todas' },
    { id: 'Receita', name: 'Receita' },
    { id: 'Operacional', name: 'Operacional' },
    { id: 'Estratégia', name: 'Estratégia' }
  ];

  if (!canViewSolutions) {
    return (
      <Container className="py-12">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Text variant="page" textColor="primary">Soluções</Text>
              <Text variant="body" textColor="secondary" className="mt-1">
                Explore as soluções disponíveis e comece a implementá-las em seu negócio
              </Text>
            </div>
          </div>

          <Alert variant="destructive" className="my-8">
            <ShieldAlert className="h-5 w-5" />
            <AlertTitle>
              <Text variant="body" weight="medium" textColor="primary">Acesso restrito</Text>
            </AlertTitle>
            <AlertDescription>
              <Text variant="body" textColor="secondary" className="mb-4">
                Você não tem permissão para acessar as soluções. Entre em contato com o administrador para solicitar acesso.
              </Text>
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard">Voltar para o Dashboard</Link>
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </Container>
    );
  }

  if (loading) {
    return <LoadingScreen message="Carregando soluções..." />;
  }

  return (
    <Container className="py-6">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Text variant="page" textColor="primary">Soluções</Text>
            <Text variant="body" textColor="secondary" className="mt-1">
              Explore as soluções disponíveis e comece a implementá-las em seu negócio
            </Text>
          </div>

          <div className="w-full sm:w-auto flex gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-muted" />
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
          <TabsList className="mb-6 flex flex-wrap bg-surface border border-border">
            {categories.map((category) => (
              <TabsTrigger 
                key={category.id}
                value={category.id}
                className="flex-1 sm:flex-none text-text-secondary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-0">
              {filteredSolutions?.length === 0 ? (
                <div className="text-center py-8 bg-surface rounded-lg border border-border border-dashed">
                  <div className="flex flex-col items-center px-4">
                    <Filter className="h-10 w-10 text-text-muted mb-3" />
                    <Text variant="subsection" textColor="primary" className="mb-2">
                      Nenhuma solução encontrada
                    </Text>
                    <Text variant="body-small" textColor="secondary" className="max-w-md">
                      Não encontramos soluções com esse filtro. Tente selecionar outra categoria ou ajuste sua busca.
                    </Text>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                  {filteredSolutions?.map((solution: Solution) => (
                    <SolutionCard key={solution.id} solution={solution} />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Container>
  );
};

export default Solutions;
