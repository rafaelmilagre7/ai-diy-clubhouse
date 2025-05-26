
import React from 'react';
import { TopicCard } from './TopicCard';
import { EmptyTopicsState } from './EmptyTopicsState';
import { Topic } from '@/types/forumTypes';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TopicListProps {
  pinnedTopics: Topic[];
  regularTopics: Topic[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const TopicList: React.FC<TopicListProps> = ({
  pinnedTopics,
  regularTopics,
  currentPage,
  totalPages,
  onPageChange
}) => {
  const hasTopics = pinnedTopics.length > 0 || regularTopics.length > 0;

  if (!hasTopics) {
    return <EmptyTopicsState />;
  }

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

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = currentPage - 2 + i;
              if (pageNum < 0 || pageNum >= totalPages) return null;
              
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className="w-10"
                >
                  {pageNum + 1}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
          >
            Próxima
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
