
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header com gradiente e efeito visual */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-muted/50 border border-border/50 p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Soluções
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Explore as soluções disponíveis e comece a implementá-las em seu negócio
              </p>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-background/95 backdrop-blur border border-border/50 rounded-xl p-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar soluções..."
                    className="w-80 pl-10 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros com design moderno */}
        <Tabs defaultValue={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <div className="relative group">
            {/* Fundo com gradiente sutil */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-3xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Container das tabs com glassmorphism */}
            <div className="relative bg-card/80 backdrop-blur-xl border border-border/30 rounded-2xl p-1.5 shadow-2xl">
              <TabsList className="bg-transparent p-0 h-auto w-full grid grid-cols-4 gap-1">
                {categories.map((category) => (
                  <TabsTrigger 
                    key={category.id}
                    value={category.id}
                    className="relative px-4 py-3 text-sm font-medium transition-all duration-300 rounded-xl
                             data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 
                             data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25
                             data-[state=active]:scale-105 data-[state=active]:border-0
                             hover:bg-muted/50 hover:scale-102 hover:text-foreground
                             text-muted-foreground border border-transparent"
                  >
                    <span className="relative z-10">{category.name}</span>
                    {/* Indicador de foco */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 data-[state=active]:opacity-100 rounded-xl transition-opacity duration-300"></div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          {/* Conteúdo com animações */}
          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-8">
              {filteredSolutions?.length === 0 ? (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card/50 to-muted/30 border border-dashed border-border/50 p-12">
                  <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
                  <div className="relative flex flex-col items-center text-center space-y-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
                      <Filter className="relative h-16 w-16 text-primary/60" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-heading font-semibold text-foreground">
                        Nenhuma solução encontrada
                      </h3>
                      <p className="text-muted-foreground max-w-md">
                        Não encontramos soluções com esse filtro. Tente selecionar outra categoria ou ajuste sua busca.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
                  {filteredSolutions?.map((solution: Solution, index) => (
                    <div 
                      key={solution.id} 
                      className="animate-scale-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <SolutionCard solution={solution} />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Solutions;
