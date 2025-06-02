
import React from 'react';
import { useSuggestions } from '@/hooks/suggestions/useSuggestions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth';

const SuggestionsDebugPanel = () => {
  const { user } = useAuth();
  const {
    suggestions,
    isLoading,
    error,
    filter,
    searchQuery
  } = useSuggestions();

  return (
    <Card className="mb-6 border-dashed border-yellow-300 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-sm text-yellow-800">
          🔍 Debug Panel - Sistema de Sugestões
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>Estado do Hook:</strong>
            <div className="mt-1 space-y-1">
              <Badge variant={isLoading ? 'default' : 'secondary'}>
                Loading: {isLoading ? 'SIM' : 'NÃO'}
              </Badge>
              <Badge variant={error ? 'destructive' : 'secondary'}>
                Error: {error ? 'SIM' : 'NÃO'}
              </Badge>
              <Badge variant="outline">
                Filtro: {filter}
              </Badge>
              <Badge variant="outline">
                Busca: {searchQuery || 'nenhuma'}
              </Badge>
            </div>
          </div>
          
          <div>
            <strong>Dados Carregados:</strong>
            <div className="mt-1 space-y-1">
              <Badge variant="outline">
                Total: {suggestions?.length || 0} sugestões
              </Badge>
              <Badge variant="outline">
                Usuário: {user?.id ? 'logado' : 'não logado'}
              </Badge>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-2 bg-red-100 border border-red-300 rounded text-red-700">
            <strong>Erro:</strong> {error.message}
          </div>
        )}

        {suggestions && suggestions.length > 0 && (
          <div className="space-y-2">
            <strong>Primeira Sugestão (Exemplo):</strong>
            <div className="p-2 bg-gray-100 rounded text-xs font-mono">
              <div>ID: {suggestions[0].id}</div>
              <div>Título: {suggestions[0].title}</div>
              <div>Upvotes: {suggestions[0].upvotes}</div>
              <div>Downvotes: {suggestions[0].downvotes}</div>
              <div>Voto do usuário: {suggestions[0].user_vote_type || 'nenhum'}</div>
              <div>Nome do autor: {suggestions[0].user_name || 'não disponível'}</div>
            </div>
          </div>
        )}

        {suggestions && suggestions.length === 0 && !isLoading && (
          <div className="p-2 bg-blue-100 border border-blue-300 rounded text-blue-700">
            ℹ️ Nenhuma sugestão encontrada para os filtros atuais
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SuggestionsDebugPanel;
