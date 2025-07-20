
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { TopicItem } from "./TopicItem";
import { TopicListSkeleton } from "./TopicListSkeleton";
import { TopicListError } from "./TopicListError";
import { EmptyTopicsState } from "./EmptyTopicsState";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface TopicListProps {
  categoryId: string;
  categorySlug: string;
}

export const TopicList = ({ categoryId, categorySlug }: TopicListProps) => {
  const { data: topics, isLoading, error, refetch } = useQuery({
    queryKey: ['categoryTopics', categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_topics')
        .select(`
          *,
          profiles:user_id(name, avatar_url),
          forum_categories:category_id(name, slug)
        `)
        .eq('category_id', categoryId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const pinnedTopics = topics?.filter(topic => topic.is_pinned) || [];
  const regularTopics = topics?.filter(topic => !topic.is_pinned) || [];
  const hasTopics = topics && topics.length > 0;

  if (isLoading) {
    return <TopicListSkeleton />;
  }

  if (error) {
    return <TopicListError onRetry={refetch} />;
  }

  if (!hasTopics) {
    return <EmptyTopicsState searchQuery="" />;
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
            <TopicItem key={topic.id} topic={topic} />
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
    </div>
  );
};
