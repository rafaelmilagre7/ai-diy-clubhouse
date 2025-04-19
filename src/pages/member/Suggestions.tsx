
import React, { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { useSuggestions } from '@/hooks/suggestions/useSuggestions';
import { SuggestionsHeader } from '@/components/suggestions/layout/SuggestionsHeader';
import { SuggestionCard } from '@/components/suggestions/cards/SuggestionCard';
import { SuggestionsEmptyState } from '@/components/suggestions/states/SuggestionsEmptyState';
import { getStatusLabel, getStatusColor } from '@/utils/suggestionUtils';
import { toast } from 'sonner';

const SuggestionsPage = () => {
  const {
    suggestions,
    categories,
    isLoading,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    refetch
  } = useSuggestions();

  useEffect(() => {
    console.log("Componente SuggestionsPage montado, buscando sugestões...");
    refetch().catch(error => {
      console.error("Erro ao buscar sugestões:", error);
      toast.error("Erro ao carregar sugestões. Tente novamente.");
    });
  }, [refetch]);

  useEffect(() => {
    console.log("Quantidade de sugestões carregadas:", suggestions?.length || 0);
    console.log("Detalhes das sugestões:", suggestions);
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

      {filteredSuggestions.length === 0 ? (
        <SuggestionsEmptyState searchQuery={searchQuery} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              getStatusLabel={getStatusLabel}
              getStatusColor={getStatusColor}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SuggestionsPage;
