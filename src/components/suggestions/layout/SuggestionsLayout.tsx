
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

  const renderContent = () => {
    if (error) {
      return (
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
      );
    }

    return (
      <SuggestionsContent 
        suggestions={suggestions || []} 
        searchQuery={searchQuery}
        isLoading={isLoading}
      />
    );
  };

  return (
    <div className="container py-6 space-y-6 animate-fade-in">
      <SuggestionsHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filter={filter}
        onFilterChange={handleFilterChange}
      />
      
      {renderContent()}
    </div>
  );
};

export default SuggestionsLayout;
