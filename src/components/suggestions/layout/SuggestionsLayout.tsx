
import React from 'react';
import { useSuggestions, SuggestionFilter } from '@/hooks/suggestions/useSuggestions';
import { SuggestionsHeader } from './SuggestionsHeader';
import { SuggestionsContent } from './SuggestionsContent';
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

  const handleRetry = () => {
    refetch();
  };

  const handleFilterChange = (value: SuggestionFilter) => {
    setFilter(value);
  };

  return (
    <div className="container py-6 space-y-6">
      <SuggestionsHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filter={filter}
        onFilterChange={handleFilterChange}
      />
      
      {error ? (
        <Alert variant="destructive" className="mb-4">
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
        <SuggestionsContent 
          suggestions={suggestions || []} 
          searchQuery={searchQuery}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default SuggestionsLayout;
