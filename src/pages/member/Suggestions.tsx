
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuggestions } from '@/hooks/suggestions/useSuggestions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Plus, Search, TrendingUp, Clock, Settings, CheckCircle } from 'lucide-react';
import { SuggestionCard } from '@/components/suggestions/SuggestionCard';
import LoadingScreen from '@/components/common/LoadingScreen';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const SuggestionsPage = () => {
  const navigate = useNavigate();
  const {
    suggestions,
    isLoading,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    error
  } = useSuggestions();

  if (isLoading) {
    return <LoadingScreen message="Carregando sugestões..." />;
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sugestões</h1>
        <Button onClick={() => navigate('/suggestions/new')} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Sugestão
        </Button>
      </div>

      {/* Filtros e busca */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar sugestões..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <ToggleGroup 
          type="single" 
          value={filter}
          onValueChange={(value) => value && setFilter(value as any)}
          className="flex-shrink-0"
        >
          <ToggleGroupItem value="popular" className="gap-1">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden md:inline">Populares</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="recent" className="gap-1">
            <Clock className="h-4 w-4" />
            <span className="hidden md:inline">Recentes</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="in_development" className="gap-1">
            <Settings className="h-4 w-4" />
            <span className="hidden md:inline">Em Desenvolvimento</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="completed" className="gap-1">
            <CheckCircle className="h-4 w-4" />
            <span className="hidden md:inline">Implementadas</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Conteúdo */}
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Erro ao carregar sugestões</AlertTitle>
          <AlertDescription>
            Não foi possível carregar as sugestões. Tente novamente.
          </AlertDescription>
        </Alert>
      ) : suggestions.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Nenhuma sugestão encontrada</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery 
                ? `Nenhuma sugestão encontrada para "${searchQuery}"` 
                : 'Seja o primeiro a sugerir uma melhoria para a plataforma!'
              }
            </p>
            <Button onClick={() => navigate('/suggestions/new')}>
              Criar primeira sugestão
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-400">
              {suggestions.length} {suggestions.length === 1 ? 'sugestão' : 'sugestões'} 
              {searchQuery && ` para "${searchQuery}"`}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions.map((suggestion) => (
              <SuggestionCard key={suggestion.id} suggestion={suggestion} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SuggestionsPage;
