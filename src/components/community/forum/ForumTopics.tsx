
import React from 'react';
import { useForumTopics } from '@/hooks/community/useForumTopics';
import { useForumCategories } from '@/hooks/community/useForumCategories';
import { TopicCard } from './TopicCard';
import { TopicListSkeleton } from './TopicListSkeleton';
import { EmptyTopicsState } from './EmptyTopicsState';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ForumTopicsProps {
  searchQuery: string;
  filter: string;
}

export const ForumTopics = ({ searchQuery, filter }: ForumTopicsProps) => {
  const { categories, isLoading: categoriesLoading, error: categoriesError, refetch: refetchCategories } = useForumCategories();
  const { data: topics, isLoading: topicsLoading, error: topicsError, refetch: refetchTopics } = useForumTopics({
    activeTab: 'todos',
    selectedFilter: filter as any,
    searchQuery,
    categories
  });

  const isLoading = categoriesLoading || topicsLoading;
  const hasError = categoriesError || topicsError;

  if (isLoading) {
    return <TopicListSkeleton />;
  }

  if (hasError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            Erro ao carregar dados da comunidade. 
            {categoriesError && " (Problemas com categorias)"}
            {topicsError && " (Problemas com tópicos)"}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              refetchCategories();
              refetchTopics();
            }}
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!topics || topics.length === 0) {
    return <EmptyTopicsState searchQuery={searchQuery} />;
  }

  // Separar tópicos fixados dos regulares
  const pinnedTopics = topics.filter(topic => topic.is_pinned);
  const regularTopics = topics.filter(topic => !topic.is_pinned);

  return (
    <div className="space-y-6">
      {/* Tópicos Fixados */}
      {pinnedTopics.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            📌 Tópicos Fixados
          </h3>
          <div className="space-y-2">
            {pinnedTopics.map((topic) => (
              <TopicCard key={topic.id} topic={topic} isPinned />
            ))}
          </div>
        </div>
      )}

      {/* Tópicos Regulares */}
      <div className="space-y-3">
        {pinnedTopics.length > 0 && (
          <h3 className="text-sm font-medium text-muted-foreground">
            Discussões Recentes
          </h3>
        )}
        <div className="space-y-2">
          {regularTopics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      </div>
    </div>
  );
};
