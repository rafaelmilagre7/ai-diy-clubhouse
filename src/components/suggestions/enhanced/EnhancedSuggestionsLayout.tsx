
import React from 'react';
import { useEnhancedSuggestions } from '@/hooks/suggestions/useEnhancedSuggestions';
import { EnhancedSuggestionsHeader } from './EnhancedSuggestionsHeader';
import { EnhancedSuggestionFilters } from './EnhancedSuggestionFilters';
import { EnhancedSuggestionCard } from './EnhancedSuggestionCard';
import { SuggestionsPerformanceWrapper } from '../performance/SuggestionsPerformanceWrapper';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EnhancedSuggestionsLayout = () => {
  const {
    suggestions,
    isLoading,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    refetch,
    error,
    isFetching,
    stats
  } = useEnhancedSuggestions();

  const handleRetry = React.useCallback(() => {
    toast.info("Recarregando sugestões...");
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <SuggestionsPerformanceWrapper>
        <div className="container py-8 space-y-8">
          <EnhancedSuggestionsHeader 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filter={filter}
            onFilterChange={setFilter}
          />
          
          <EnhancedSuggestionFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filter={filter}
            onFilterChange={setFilter}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="p-6 space-y-4">
                  <Skeleton className="h-6 w-4/5 mb-3" />
                  <Skeleton className="h-4 w-2/5" />
                  <Skeleton className="h-20 w-full" />
                  <div className="flex justify-between pt-3">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </SuggestionsPerformanceWrapper>
    );
  }

  return (
    <SuggestionsPerformanceWrapper>
      <div className="container py-8 space-y-8">
        <EnhancedSuggestionsHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filter={filter}
          onFilterChange={setFilter}
        />
        
        <EnhancedSuggestionFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filter={filter}
          onFilterChange={setFilter}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />
        
        {error ? (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro ao carregar sugestões</AlertTitle>
            <AlertDescription className="flex flex-col gap-3">
              <p>Não foi possível carregar as sugestões. Por favor, tente novamente.</p>
              <Button variant="outline" size="sm" onClick={handleRetry} className="gap-2 w-fit">
                <RefreshCw size={14} />
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <div>
            {/* Estatísticas */}
            {stats.total > 0 && (
              <div className="mb-6 p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Mostrando {suggestions.length} de {stats.total} sugestões
                  {Object.keys(stats.byStatus).length > 0 && (
                    <span className="ml-2">
                      • {Object.entries(stats.byStatus).map(([status, count]) => `${count} ${status}`).join(', ')}
                    </span>
                  )}
                </p>
              </div>
            )}

            {suggestions.length === 0 ? (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Nenhuma sugestão encontrada</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || selectedCategory || selectedStatus
                      ? 'Tente ajustar os filtros para encontrar sugestões.'
                      : 'Seja o primeiro a compartilhar uma ideia!'}
                  </p>
                  <Button onClick={() => window.location.href = '/suggestions/new'} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Criar Primeira Sugestão
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestions.map((suggestion) => (
                  <EnhancedSuggestionCard 
                    key={suggestion.id} 
                    suggestion={suggestion}
                  />
                ))}
              </div>
            )}
            
            {/* Indicador de carregamento durante refetch */}
            {isFetching && !isLoading && (
              <div className="text-center py-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-muted-foreground">
                    Atualizando sugestões...
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </SuggestionsPerformanceWrapper>
  );
};

export default EnhancedSuggestionsLayout;
