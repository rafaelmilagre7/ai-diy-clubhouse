
import React from 'react';
import { useForumTopics } from '@/hooks/community/useForumTopics';
import { useForumCategories } from '@/hooks/community/useForumCategories';
import { TopicCard } from './TopicCard';
import { TopicListSkeleton } from './TopicListSkeleton';
import { EmptyTopicsState } from './EmptyTopicsState';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ForumTopicsProps {
  searchQuery: string;
  filter: string;
}

export const ForumTopics = ({ searchQuery, filter }: ForumTopicsProps) => {
  const { categories } = useForumCategories();
  const { data: topics, isLoading, error } = useForumTopics({
    activeTab: 'todos',
    selectedFilter: filter as any,
    searchQuery,
    categories
  });

  if (isLoading) {
    return <TopicListSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar tópicos. Tente novamente em alguns instantes.
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
