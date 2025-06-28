
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MessageSquare, ThumbsUp, ThumbsDown, Filter } from 'lucide-react';
import { useAdminSuggestions } from '@/hooks/suggestions/useAdminSuggestions';

const AdminSuggestions = () => {
  const [filter, setFilter] = useState('all');
  const { suggestions, isLoading, updateSuggestionStatus, deleteSuggestion } = useAdminSuggestions();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'in_review': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'implemented': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'Nova';
      case 'in_review': return 'Em Análise';
      case 'approved': return 'Aprovada';
      case 'rejected': return 'Rejeitada';
      case 'implemented': return 'Implementada';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Sugestões da Comunidade</h1>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sugestões da Comunidade</h1>
          <p className="text-muted-foreground">
            Gerencie e monitore as sugestões dos usuários
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'Todas' },
          { key: 'new', label: 'Novas' },
          { key: 'in_review', label: 'Em Análise' },
          { key: 'approved', label: 'Aprovadas' },
          { key: 'implemented', label: 'Implementadas' }
        ].map((item) => (
          <Button
            key={item.key}
            variant={filter === item.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(item.key)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {/* Suggestions List */}
      <div className="grid gap-4">
        {suggestions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma sugestão encontrada</h3>
              <p className="text-muted-foreground mb-4">
                Não há sugestões para os filtros selecionados.
              </p>
            </CardContent>
          </Card>
        ) : (
          suggestions.map((suggestion) => (
            <Card key={suggestion.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                    <CardDescription className="mt-1">
                      Por {suggestion.user_name || 'Usuário'} • {new Date(suggestion.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(suggestion.status)}>
                    {getStatusText(suggestion.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{suggestion.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      <span className="text-sm">{suggestion.upvotes || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsDown className="h-4 w-4" />
                      <span className="text-sm">{suggestion.downvotes || 0}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSuggestionStatus(suggestion.id, 'approved')}
                      disabled={suggestion.status === 'approved'}
                    >
                      Aprovar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSuggestionStatus(suggestion.id, 'in_review')}
                      disabled={suggestion.status === 'in_review'}
                    >
                      Em Análise
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteSuggestion(suggestion.id)}
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminSuggestions;
