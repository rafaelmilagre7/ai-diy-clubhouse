
import { ForumLayout } from "@/components/community/ForumLayout";
import { MessageSquare, Users, BarChart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useForumStats } from "@/hooks/useForumStats";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { CategoryCard } from "@/components/community/CategoryCard";
import { QuickPostEditor } from "@/components/community/QuickPostEditor";
import { TopicCard } from "@/components/community/TopicCard";

const CommunityHome = () => {
  const { topicCount, postCount, activeUserCount, isLoading: statsLoading } = useForumStats();

  // Buscar categorias
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['forumCategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Buscar tópicos recentes/populares
  const { data: recentTopics, isLoading: topicsLoading } = useQuery({
    queryKey: ['recentForumTopics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_topics')
        .select(`
          *,
          profiles:user_id(*)
        `)
        .eq('is_pinned', false)
        .order('last_activity_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Comunidade</h1>
          </div>
        </div>
        
        {/* Editor rápido */}
        <QuickPostEditor />
        
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 flex items-center gap-3">
            <div className="bg-primary/20 p-3 rounded-full">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tópicos</p>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">{topicCount}</p>
              )}
            </div>
          </Card>
          
          <Card className="p-4 flex items-center gap-3">
            <div className="bg-primary/20 p-3 rounded-full">
              <BarChart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mensagens</p>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">{postCount}</p>
              )}
            </div>
          </Card>
          
          <Card className="p-4 flex items-center gap-3">
            <div className="bg-primary/20 p-3 rounded-full">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Membros ativos</p>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">{activeUserCount}</p>
              )}
            </div>
          </Card>
        </div>
        
        {/* Grid de categorias */}
        <h2 className="text-2xl font-bold mt-2 mb-4">Categorias</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {categoriesLoading ? (
            <>
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="h-24 p-4 animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-muted rounded-md w-3/4 mb-2"></div>
                      <div className="h-4 bg-muted rounded-md w-full"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </>
          ) : (
            categories?.map((category) => (
              <CategoryCard
                key={category.id}
                id={category.id}
                name={category.name}
                description={category.description}
                slug={category.slug}
                icon={category.icon}
              />
            ))
          )}
        </div>
        
        {/* Tópicos recentes */}
        <h2 className="text-2xl font-bold mt-6 mb-4">Discussões recentes</h2>
        <div className="space-y-4">
          {topicsLoading ? (
            <>
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="h-32 p-4 animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-muted rounded-md w-3/4 mb-2"></div>
                      <div className="h-4 bg-muted rounded-md w-full mb-2"></div>
                      <div className="h-4 bg-muted rounded-md w-1/2"></div>
                      <div className="flex gap-4 mt-4">
                        <div className="h-4 w-16 bg-muted rounded-md"></div>
                        <div className="h-4 w-16 bg-muted rounded-md"></div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </>
          ) : (
            recentTopics?.map((topic) => <TopicCard key={topic.id} topic={topic} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityHome;
