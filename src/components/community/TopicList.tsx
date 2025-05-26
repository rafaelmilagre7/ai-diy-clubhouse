
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { TopicItem } from "./TopicItem";
import { TopicListSkeleton } from "./TopicListSkeleton";
import { TopicListError } from "./TopicListError";
import { EmptyTopicList } from "./EmptyTopicList";
import { TopicPagination } from "./TopicPagination";
import { useTopicList } from "@/hooks/useTopicList";

interface TopicListProps {
  categoryId: string;
  categorySlug: string;
}

export const TopicList = ({ categoryId, categorySlug }: TopicListProps) => {
  const {
    pinnedTopics,
    regularTopics,
    totalPages,
    currentPage,
    hasTopics,
    isLoading,
    error,
    handleRetry,
    handlePageChange
  } = useTopicList({ categoryId });

  if (isLoading) {
    return <TopicListSkeleton />;
  }

  if (error) {
    return <TopicListError onRetry={handleRetry} />;
  }

  if (!hasTopics) {
    return <EmptyTopicList categorySlug={categorySlug} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-medium">Tópicos</h2>
        <Button asChild className="flex items-center gap-2">
          <Link to={`/comunidade/novo-topico/${categorySlug}`}>
            <PlusCircle className="h-4 w-4" />
            <span>Criar Tópico</span>
          </Link>
        </Button>
      </div>

      {pinnedTopics.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">Tópicos fixados</h3>
            <Separator className="flex-1" />
          </div>
          {pinnedTopics.map((topic) => (
            <TopicItem key={topic.id} topic={topic} isPinned={true} />
          ))}
        </div>
      )}

      {regularTopics.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">Todos os tópicos</h3>
            <Separator className="flex-1" />
          </div>
          {regularTopics.map((topic) => (
            <TopicItem key={topic.id} topic={topic} />
          ))}
        </>
      )}

      <TopicPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};
