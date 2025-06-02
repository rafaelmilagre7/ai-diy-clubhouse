
import React from 'react';
import { useSuggestions } from '@/hooks/suggestions/useSuggestions';
import { SuggestionFilter } from '@/types/suggestionTypes';
import { SuggestionsHeader } from './SuggestionsHeader';
import { SuggestionsContent } from './SuggestionsContent';
import { SuggestionsPerformanceWrapper } from '../performance/SuggestionsPerformanceWrapper';
import SuggestionsDebugPanel from '../debug/SuggestionsDebugPanel';
import SuggestionsTestPanel from '../debug/SuggestionsTestPanel';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SuggestionsLayout = () => {
  const {
    suggestions,
    isLoading,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    refetch,
    error,
    isFetching,
    stats
  } = useSuggestions();

  const handleRetry = React.useCallback(() => {
    toast.info("Recarregando sugestões...");
    refetch();
  }, [refetch]);

  const handleFilterChange = React.useCallback((value: SuggestionFilter) => {
    setFilter(value);
  }, [setFilter]);

  const handleSearchChange = React.useCallback((value: string) => {
    setSearchQuery(value);
  }, [setSearchQuery]);

  if (isLoading) {
    return (
      <SuggestionsPerformanceWrapper>
        <div className="container py-6 space-y-6">
          <SuggestionsHeader 
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            filter={filter}
            onFilterChange={handleFilterChange}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse hover-lift">
                <div className="p-4 space-y-3">
                  <Skeleton className="h-6 w-4/5 mb-2 shimmer" />
                  <Skeleton className="h-4 w-2/5 shimmer" />
                  <Skeleton className="h-20 w-full shimmer" />
                  <div className="flex justify-between pt-2">
                    <Skeleton className="h-4 w-16 shimmer" />
                    <Skeleton className="h-4 w-12 shimmer" />
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
      <div className="container py-6 space-y-6">
        <SuggestionsHeader 
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          filter={filter}
          onFilterChange={handleFilterChange}
        />
        
        {/* Painéis de Debug - apenas em desenvolvimento */}
        {process.env.NODE_ENV === 'development' && (
          <>
            <SuggestionsTestPanel />
            <SuggestionsDebugPanel />
          </>
        )}
        
        {error ? (
          <Alert variant="destructive" className="mb-4 animate-fade-in">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro ao carregar sugestões</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <p>Não foi possível carregar as sugestões. Por favor, tente novamente.</p>
              <Button variant="outline" size="sm" onClick={handleRetry} className="gap-2 w-fit">
                <RefreshCw size={14} />
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="animate-slide-up">
            <SuggestionsContent 
              suggestions={suggestions} 
              searchQuery={searchQuery}
              filter={filter}
            />
            
            {/* Indicador de carregamento durante refetch */}
            {isFetching && !isLoading && (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  Atualizando sugestões...
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </SuggestionsPerformanceWrapper>
  );
};

export default SuggestionsLayout;
