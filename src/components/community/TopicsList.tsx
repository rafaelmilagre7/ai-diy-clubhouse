
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useForumTopics, TopicFilterType } from '@/hooks/community/useForumTopics';
import { TopicCard } from './TopicCard';
import { Skeleton } from '@/components/ui/skeleton';

interface TopicsListProps {
  categorySlug?: string;
  showCreateButton?: boolean;
}

export const TopicsList: React.FC<TopicsListProps> = ({ 
  categorySlug,
  showCreateButton = true 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<TopicFilterType>('recentes');
  const [page, setPage] = useState(0);

  const { 
    data: topicsData, 
    isLoading, 
    error 
  } = useForumTopics({
    categorySlug,
    selectedFilter,
    searchQuery,
    page
  });

  const { topics = [], totalCount = 0, hasMore = false } = topicsData || {};

  // Separar tópicos fixados dos regulares
  const pinnedTopics = topics.filter(topic => topic.is_pinned);
  const regularTopics = topics.filter(topic => !topic.is_pinned);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Erro ao carregar tópicos. Tente novamente.</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Recarregar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros e busca */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Busca */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar discussões..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtro */}
          <Select value={selectedFilter} onValueChange={(value) => setSelectedFilter(value as TopicFilterType)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recentes">Recentes</SelectItem>
              <SelectItem value="populares">Em Alta</SelectItem>
              <SelectItem value="sem-respostas">Sem Respostas</SelectItem>
              <SelectItem value="resolvidos">Resolvidos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Botão criar tópico */}
        {showCreateButton && (
          <Button asChild>
            <Link to="/comunidade/novo-topico">
              <Plus className="h-4 w-4 mr-2" />
              Novo Tópico
            </Link>
          </Button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      )}

      {/* Lista de tópicos */}
      {!isLoading && (
        <div className="space-y-6">
          {/* Tópicos fixados */}
          {pinnedTopics.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-600 flex items-center gap-2">
                📌 Tópicos Fixados
              </h3>
              <div className="space-y-3">
                {pinnedTopics.map((topic) => (
                  <TopicCard key={topic.id} topic={topic} isPinned />
                ))}
              </div>
            </div>
          )}

          {/* Tópicos regulares */}
          <div className="space-y-3">
            {pinnedTopics.length > 0 && (
              <h3 className="text-sm font-medium text-gray-600">
                Discussões Recentes
              </h3>
            )}
            
            {regularTopics.length > 0 ? (
              <div className="space-y-3">
                {regularTopics.map((topic) => (
                  <TopicCard key={topic.id} topic={topic} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  {searchQuery ? 'Nenhum tópico encontrado' : 'Nenhum tópico ainda'}
                </p>
                {showCreateButton && (
                  <Button asChild>
                    <Link to="/comunidade/novo-topico">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar primeiro tópico
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Paginação */}
          {hasMore && (
            <div className="text-center pt-6">
              <Button 
                variant="outline"
                onClick={() => setPage(prev => prev + 1)}
              >
                Carregar mais
              </Button>
            </div>
          )}

          {/* Contador */}
          {totalCount > 0 && (
            <p className="text-sm text-gray-500 text-center">
              Mostrando {topics.length} de {totalCount} tópicos
            </p>
          )}
        </div>
      )}
    </div>
  );
};
