
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { UnifiedTopicList } from "./UnifiedTopicList";
import { useCommunityTopics } from "@/hooks/community/useCommunityTopics";

interface TopicListProps {
  categoryId: string;
  categorySlug: string;
}

export const TopicList = ({ categoryId, categorySlug }: TopicListProps) => {
  const { topics, isLoading, error, refetch } = useCommunityTopics({
    activeTab: "all",
    selectedFilter: "recentes",
    searchQuery: "",
    categorySlug: categorySlug
  });

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

      <UnifiedTopicList
        topics={topics}
        isLoading={isLoading}
        error={error}
        refetch={refetch}
        searchQuery=""
        showPinned={true}
      />
    </div>
  );
};
