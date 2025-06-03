
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuggestions } from '@/hooks/suggestions/useSuggestions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Search, TrendingUp, Clock, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { SuggestionCard } from '@/components/suggestions/SuggestionCard';
import LoadingScreen from '@/components/common/LoadingScreen';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const AdminSuggestions = () => {
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

  // Estatísticas por status
  const statusStats = suggestions.reduce((acc, suggestion) => {
    acc[suggestion.status] = (acc[suggestion.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return <LoadingScreen message="Carregando sugestões..." />;
  }

  return (
    <div className="pl-8 pr-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Sugestões</h1>
          <p className="text-gray-400 mt-1">
            Gerencie as sugestões da comunidade e defina seus status
          </p>
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{statusStats.new || 0}</div>
          <div className="text-sm text-blue-300">Novas</div>
        </div>
        <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{statusStats.under_review || 0}</div>
          <div className="text-sm text-purple-300">Em Análise</div>
        </div>
        <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">{statusStats.in_development || 0}</div>
          <div className="text-sm text-amber-300">Em Desenvolvimento</div>
        </div>
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{statusStats.completed || 0}</div>
          <div className="text-sm text-green-300">Implementadas</div>
        </div>
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{statusStats.declined || 0}</div>
          <div className="text-sm text-red-300">Recusadas</div>
        </div>
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
          <ToggleGroupItem value="all" className="gap-1">
            <AlertCircle className="h-4 w-4" />
            <span className="hidden md:inline">Todas</span>
          </ToggleGroupItem>
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
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Nenhuma sugestão encontrada</h3>
            <p className="text-gray-400">
              {searchQuery 
                ? `Nenhuma sugestão encontrada para "${searchQuery}"` 
                : 'Nenhuma sugestão foi criada ainda pelos membros.'
              }
            </p>
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

export default AdminSuggestions;
