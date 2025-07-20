
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Eye, Clock, Users, TrendingUp, Pin, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getContentPreview } from "@/components/community/utils/contentUtils";

interface CommunityStats {
  total_topics: number;
  total_posts: number;
  total_users: number;
  active_users_today: number;
}

interface Topic {
  id: string;
  title: string;
  content: string;
  created_at: string;
  view_count: number;
  reply_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  profiles: {
    name: string;
    avatar_url: string | null;
  } | null;
  category: {
    name: string;
    slug: string;
  } | null;
}

const CommunityHome = () => {
  // Buscar estatísticas da comunidade
  const { data: stats } = useQuery({
    queryKey: ['communityStats'],
    queryFn: async (): Promise<CommunityStats> => {
      // Contagem de tópicos
      const { count: topicsCount } = await supabase
        .from('forum_topics')
        .select('*', { count: 'exact', head: true });

      // Contagem de posts
      const { count: postsCount } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true });

      // Contagem de usuários
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      return {
        total_topics: topicsCount || 0,
        total_posts: postsCount || 0,
        total_users: usersCount || 0,
        active_users_today: 0 // Placeholder por enquanto
      };
    }
  });

  // Buscar tópicos recentes
  const { data: recentTopics } = useQuery({
    queryKey: ['recentTopics'],
    queryFn: async (): Promise<Topic[]> => {
      const { data, error } = await supabase
        .from('forum_topics')
        .select(`
          id,
          title,
          content,
          created_at,
          view_count,
          reply_count,
          is_pinned,
          is_locked,
          profiles:user_id (name, avatar_url),
          category:category_id (name, slug)
        `)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data || [];
    }
  });

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Comunidade Viver de IA</h1>
        <p className="text-muted-foreground">
          Conecte-se, aprenda e compartilhe conhecimento com nossa comunidade de especialistas em IA.
        </p>
      </div>

      {/* Estatísticas da Comunidade */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats?.total_topics || 0}</p>
                <p className="text-sm text-muted-foreground">Tópicos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats?.total_posts || 0}</p>
                <p className="text-sm text-muted-foreground">Respostas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats?.total_users || 0}</p>
                <p className="text-sm text-muted-foreground">Membros</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats?.active_users_today || 0}</p>
                <p className="text-sm text-muted-foreground">Ativos hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tópicos Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Discussões Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTopics?.map((topic) => (
              <Link
                key={topic.id}
                to={`/comunidade/topico/${topic.id}`}
                className="block p-4 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={topic.profiles?.avatar_url || undefined} />
                    <AvatarFallback>{getInitials(topic.profiles?.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate flex-1">
                        {topic.is_pinned && <Pin className="h-4 w-4 inline mr-1 text-primary" />}
                        {topic.is_locked && <Lock className="h-4 w-4 inline mr-1 text-muted-foreground" />}
                        {topic.title}
                      </h3>
                      {topic.category && (
                        <Badge variant="outline" className="shrink-0">
                          {topic.category.name}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {getContentPreview(topic.content, 150)}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Por {topic.profiles?.name || 'Usuário'}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(topic.created_at), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{topic.reply_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{topic.view_count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {(!recentTopics || recentTopics.length === 0) && (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Nenhum tópico encontrado ainda.</p>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <Link 
              to="/comunidade/categorias" 
              className="text-primary hover:underline font-medium"
            >
              Ver todas as discussões →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityHome;
