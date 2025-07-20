
import { TopicItem } from "./TopicItem";
import { TopicListSkeleton } from "./TopicListSkeleton";
import { TopicListError } from "./TopicListError";
import { EmptyTopicsState } from "./EmptyTopicsState";
import { Topic } from "@/types/forumTypes";
import { Separator } from "@/components/ui/separator";

interface UnifiedTopicListProps {
  topics: Topic[];
  isLoading: boolean;
  error: any;
  refetch: () => void;
  searchQuery: string;
  showPinned?: boolean;
}

export const UnifiedTopicList = ({ 
  topics, 
  isLoading, 
  error, 
  refetch, 
  searchQuery,
  showPinned = true 
}: UnifiedTopicListProps) => {
  if (isLoading) {
    return <TopicListSkeleton />;
  }

  if (error) {
    return <TopicListError onRetry={refetch} />;
  }

  if (!topics || topics.length === 0) {
    return <EmptyTopicsState searchQuery={searchQuery} />;
  }

  const pinnedTopics = showPinned ? topics.filter(topic => topic.is_pinned) : [];
  const regularTopics = showPinned ? topics.filter(topic => !topic.is_pinned) : topics;

  return (
    <div className="space-y-4">
      {pinnedTopics.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">Tópicos fixados</h3>
            <Separator className="flex-1" />
          </div>
          <div className="space-y-3">
            {pinnedTopics.map((topic) => (
              <TopicItem key={topic.id} topic={topic} />
            ))}
          </div>
        </div>
      )}

      {regularTopics.length > 0 && (
        <>
          {pinnedTopics.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Todos os tópicos</h3>
              <Separator className="flex-1" />
            </div>
          )}
          <div className="space-y-3">
            {regularTopics.map((topic) => (
              <TopicItem key={topic.id} topic={topic} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
