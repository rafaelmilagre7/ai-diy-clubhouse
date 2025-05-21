
import { Topic } from "@/types/forumTypes";
import { TopicItem } from "./TopicItem";
import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { EmptyTopicsState } from "./EmptyTopicsState";
import { PinIcon } from "lucide-react";

export interface TopicListProps {
  pinnedTopics?: Topic[];
  regularTopics: Topic[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  categoryId?: string;
  categorySlug?: string;
  searchQuery?: string;
}

export const TopicList = ({ 
  pinnedTopics = [], 
  regularTopics,
  currentPage,
  totalPages,
  onPageChange,
  categoryId,
  categorySlug,
  searchQuery
}: TopicListProps) => {
  const hasTopics = pinnedTopics.length > 0 || regularTopics.length > 0;
  
  if (!hasTopics) {
    return <EmptyTopicsState searchQuery={searchQuery} />;
  }
  
  return (
    <div className="space-y-6">
      {/* Tópicos fixados */}
      {pinnedTopics && pinnedTopics.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <PinIcon className="h-4 w-4" />
            <span>Tópicos fixados</span>
          </div>
          
          <Card className="divide-y">
            {pinnedTopics.map((topic) => (
              <TopicItem key={topic.id} topic={topic} isPinned />
            ))}
          </Card>
        </div>
      )}
      
      {/* Tópicos regulares */}
      <div className="space-y-2">
        {pinnedTopics && pinnedTopics.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Tópicos
          </div>
        )}
        
        <Card className="divide-y">
          {regularTopics.map((topic) => (
            <TopicItem key={topic.id} topic={topic} />
          ))}
        </Card>
      </div>
      
      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};
