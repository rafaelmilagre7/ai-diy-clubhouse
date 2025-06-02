
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { useEnhancedSuggestions } from '@/hooks/suggestions/useEnhancedSuggestions';
import { EnhancedSuggestionFilters } from './EnhancedSuggestionFilters';
import { SuggestionItem } from '../ui/SuggestionItem';
import { SuggestionsStats } from '../ui/SuggestionsStats';
import { SuggestionsPerformanceWrapper } from '../performance/SuggestionsPerformanceWrapper';
import { Skeleton } from '@/components/ui/skeleton';

const EnhancedSuggestionsLayout = () => {
  const navigate = useNavigate();
  
  const {
    suggestions,
    isLoading,
    error,
    stats,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    refetch,
    isFetching
  } = useEnhancedSuggestions();

  const handleCreateSuggestion = () => {
    navigate('/suggestions/new');
  };

  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            Erro ao carregar sugestões: {error.message}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()} 
              className="ml-4"
            >
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <SuggestionsPerformanceWrapper>
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sugestões</h1>
            <p className="text-muted-foreground">
              Compartilhe ideias e vote nas melhores sugestões da comunidade
            </p>
          </div>
          
          <Button onClick={handleCreateSuggestion} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Sugestão
          </Button>
        </div>

        {/* Stats Overview */}
        <SuggestionsStats stats={stats} />

        {/* Filtros Avançados */}
        <Card className="p-6">
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
        </Card>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-6 space-y-4">
                <Skeleton className="h-6 w-4/5" />
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-20 w-full" />
                <div className="flex justify-between pt-3">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Lista de Sugestões */}
            {suggestions.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="space-y-4">
                  <div className="text-6xl">💡</div>
                  <h3 className="text-lg font-medium">Nenhuma sugestão encontrada</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || selectedCategory || selectedStatus 
                      ? 'Tente ajustar os filtros para encontrar sugestões.'
                      : 'Seja o primeiro a criar uma sugestão!'
                    }
                  </p>
                  <Button onClick={handleCreateSuggestion} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Criar primeira sugestão
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestions.map((suggestion) => (
                  <SuggestionItem
                    key={suggestion.id}
                    suggestion={suggestion}
                    onVote={() => {
                      // Votação será implementada via hook useVoting
                      refetch();
                    }}
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
          </>
        )}
      </div>
    </SuggestionsPerformanceWrapper>
  );
};

export default EnhancedSuggestionsLayout;
