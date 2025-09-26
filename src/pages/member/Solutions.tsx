
import React, { useState } from 'react';
import { useSolutionsData } from '@/hooks/useSolutionsData';
import { SolutionCardAccessWrapper } from '@/components/solution/SolutionCardAccessWrapper';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter } from 'lucide-react';
import LoadingScreen from '@/components/common/LoadingScreen';
import { Solution } from '@/lib/supabase';
import { useToolsData } from '@/hooks/useToolsData';
import { useLogging } from '@/contexts/logging';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { AuroraUpgradeModal } from '@/components/ui/aurora-upgrade-modal';

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
    hasSolutionsAccess
  } = useSolutionsData();

  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedItemTitle, setSelectedItemTitle] = useState<string | undefined>();

  // Log data for debugging
  log("Solutions page loaded", { 
    solutionsCount: filteredSolutions?.length || 0, 
    activeCategory,
    isLoading: loading || toolsDataLoading,
    hasSolutionsAccess
  });

  // Atualizado para usar nomes de categorias em português
  const categories = [
    { id: 'all', name: 'Todas' },
    { id: 'Receita', name: 'Receita' },
    { id: 'Operacional', name: 'Operacional' },
    { id: 'Estratégia', name: 'Estratégia' }
  ];

  // Se o usuário não tem permissão, ainda permitir ver a listagem (freemium)
  // O bloqueio será no clique individual de cada solução

  // Se estiver carregando as soluções, mostrar tela de carregamento
  // Mas não bloquear se apenas as ferramentas estiverem carregando
  if (loading) {
    return <LoadingScreen message="Carregando soluções..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-card/95 backdrop-blur-xl border border-border/30 p-8 shadow-2xl shadow-primary/5">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
          <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                Soluções
              </h1>
              <p className="text-lg text-muted-foreground/80 max-w-2xl">
                Explore as soluções disponíveis e comece a implementá-las em seu negócio
              </p>
            </div>

            {/* Search */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 group-focus-within:opacity-100 transition duration-300"></div>
              <div className="relative bg-card/90 backdrop-blur-sm border border-border/40 rounded-xl p-1 shadow-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                  <Input
                    type="search"
                    placeholder="Buscar soluções..."
                    className="w-80 pl-10 bg-background/50 border-border/30 focus:border-primary/50 focus:bg-background/70 transition-all duration-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <Tabs defaultValue={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <div className="relative group">
            {/* Aurora glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-500"></div>
            
            {/* Container das tabs com glassmorphism avançado */}
            <div className="relative bg-card/80 backdrop-blur-xl border border-border/30 rounded-2xl p-2 shadow-2xl shadow-primary/10">
              <TabsList className="bg-transparent p-0 h-auto w-full grid grid-cols-4 gap-2">
                {categories.map((category) => (
                  <TabsTrigger 
                    key={category.id}
                    value={category.id}
                    className="relative px-6 py-4 text-sm font-medium transition-all duration-300 rounded-xl group
                             data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 
                             data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30
                             data-[state=active]:scale-105 data-[state=active]:border-0
                             hover:bg-muted/50 hover:scale-102 hover:text-foreground hover:shadow-md
                             text-muted-foreground border border-transparent"
                  >
                    <span className="relative z-10">{category.name}</span>
                    {/* Active state glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 opacity-0 data-[state=active]:opacity-100 rounded-xl transition-opacity duration-300"></div>
                    {/* Hover shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          {/* Conteúdo */}
          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-8">
              {filteredSolutions?.length === 0 ? (
                <div className="relative overflow-hidden rounded-2xl bg-card/60 backdrop-blur-sm border border-border/40 p-12 shadow-xl">
                  <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5"></div>
                  <div className="relative flex flex-col items-center text-center space-y-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl animate-pulse"></div>
                      <div className="relative p-4 bg-card/80 backdrop-blur-sm rounded-2xl border border-border/40">
                        <Filter className="h-12 w-12 text-primary" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-heading font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Nenhuma solução encontrada
                      </h3>
                      <p className="text-muted-foreground/80 max-w-md">
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
                      <SolutionCardAccessWrapper
                        solution={solution}
                        generalHasAccess={hasSolutionsAccess}
                        onUpgradeRequired={() => {
                          setSelectedItemTitle(solution.title);
                          setUpgradeModalOpen(true);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Modal de Upgrade Aurora */}
        <AuroraUpgradeModal
          open={upgradeModalOpen}
          onOpenChange={setUpgradeModalOpen}
          itemTitle={selectedItemTitle}
        />
      </div>
    </div>
  );
};

export default Solutions;
