
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Loader2, MessageSquare, Users, BookOpen } from "lucide-react";

export const ForumStatistics = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['forumStatistics'],
    queryFn: async () => {
      // Buscar contagem total de tópicos
      const { count: topicCount, error: topicsError } = await supabase
        .from('forum_topics')
        .select('*', { count: 'exact', head: true });

      if (topicsError) throw topicsError;

      // Buscar contagem total de posts
      const { count: postCount, error: postsError } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true });

      if (postsError) throw postsError;

      // Buscar contagem de usuários que participaram do fórum (usuários distintos)
      const { count: userCount, error: usersError } = await supabase
        .from('forum_topics')
        .select('user_id', { count: 'exact', head: true })
        .not('user_id', 'is', null);

      if (usersError) throw usersError;

      // Buscar contagem de tópicos resolvidos
      const { count: solvedCount, error: solvedError } = await supabase
        .from('forum_topics')
        .select('*', { count: 'exact', head: true })
        .eq('is_solved', true);

      if (solvedError) throw solvedError;

      return {
        topicCount: topicCount || 0,
        postCount: postCount || 0,
        userCount: userCount || 0,
        solvedCount: solvedCount || 0
      };
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-3">Estatísticas do Fórum</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center mb-2 h-10 w-10 rounded-full bg-primary/10">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold">{stats?.topicCount}</span>
            <span className="text-sm text-muted-foreground">Tópicos</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center mb-2 h-10 w-10 rounded-full bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold">{stats?.postCount}</span>
            <span className="text-sm text-muted-foreground">Respostas</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center mb-2 h-10 w-10 rounded-full bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold">{stats?.userCount}</span>
            <span className="text-sm text-muted-foreground">Participantes</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center mb-2 h-10 w-10 rounded-full bg-green-500/10">
              <MessageSquare className="h-5 w-5 text-green-500" />
            </div>
            <span className="text-xl font-bold">{stats?.solvedCount}</span>
            <span className="text-sm text-muted-foreground">Resolvidos</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
