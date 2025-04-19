
import React from 'react';
import { useSuggestions } from '@/hooks/suggestions/useSuggestions';
import { SuggestionsHeader } from './SuggestionsHeader';
import { SuggestionsContent } from './SuggestionsContent';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

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

  React.useEffect(() => {
    console.log("Componente SuggestionsLayout montado, buscando sugestões...");
    refetch().catch(error => {
      console.error("Erro ao buscar sugestões:", error);
      toast.error("Erro ao carregar sugestões. Tente novamente.");
    });
  }, [refetch]);

  React.useEffect(() => {
    if (error) {
      console.error("Erro ao buscar sugestões:", error);
      toast.error("Erro ao carregar sugestões. Por favor, tente novamente.");
    }
  }, [error]);

  React.useEffect(() => {
    console.log("Quantidade de sugestões carregadas:", suggestions?.length || 0);
    if (suggestions && suggestions.length > 0) {
      console.log("Primeira sugestão:", suggestions[0]);
    }
  }, [suggestions]);

  const filteredSuggestions = suggestions.filter(suggestion => 
    suggestion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    suggestion.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="container py-6 space-y-6">
        <SuggestionsHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filter={filter}
          onFilterChange={setFilter}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-4/5 mb-2" />
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-20 w-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <SuggestionsHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filter={filter}
        onFilterChange={setFilter}
      />
      <SuggestionsContent 
        suggestions={filteredSuggestions} 
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default SuggestionsLayout;
