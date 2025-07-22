
import React from 'react';
import { useSuggestions, SuggestionFilter } from '@/hooks/suggestions/useSuggestions';
import { SuggestionsHeader } from './SuggestionsHeader';
import { SuggestionsContent } from './SuggestionsContent';
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
    error
  } = useSuggestions();

  // Tentativa automática de busca de dados quando o componente monta
  React.useEffect(() => {
    console.log("Componente SuggestionsLayout montado, buscando sugestões...");
    refetch().catch(error => {
      console.error("Erro ao buscar sugestões:", error);
    });
  }, [refetch]);

  const handleRetry = () => {
    toast.info("Tentando buscar sugestões novamente...");
    refetch();
  };

  const handleFilterChange = (value: SuggestionFilter) => {
    setFilter(value);
  };

  React.useEffect(() => {
    console.log("Quantidade de sugestões carregadas:", suggestions?.length || 0);
    if (suggestions && suggestions.length > 0) {
      console.log("Primeira sugestão:", suggestions[0]);
    }
  }, [suggestions]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 space-y-8">
          <SuggestionsHeader 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filter={filter}
            onFilterChange={handleFilterChange}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-[280px] bg-card/50 backdrop-blur-sm border-border">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-3 flex-1">
                      <Skeleton className="h-6 w-4/5" />
                      <Skeleton className="h-5 w-2/5" />
                    </div>
                    <Skeleton className="h-16 w-16 rounded-xl" />
                  </div>
                  <Skeleton className="h-16 w-full" />
                  <div className="pt-4 border-t border-border/30">
                    <div className="flex justify-between">
                      <div className="flex gap-4">
                        <Skeleton className="h-5 w-12" />
                        <Skeleton className="h-5 w-12" />
                      </div>
                      <Skeleton className="h-5 w-8" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <SuggestionsHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filter={filter}
          onFilterChange={handleFilterChange}
        />
        
        {error ? (
          <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertCircle className="w-4 h-4" />
            <AlertTitle>Erro ao carregar sugestões</AlertTitle>
            <AlertDescription className="space-y-3">
              <p>Não foi possível carregar as sugestões. Tente novamente.</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry} 
                className="gap-2 w-fit"
              >
                <RefreshCw className="w-4 h-4" />
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <SuggestionsContent 
            suggestions={suggestions} 
            searchQuery={searchQuery}
          />
        )}
      </div>
    </div>
  );
};

export default SuggestionsLayout;
