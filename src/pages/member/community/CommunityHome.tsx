
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ForumLayout } from "@/components/community/ForumLayout";
import { TopicCard } from "@/components/community/TopicCard";
import { Button } from "@/components/ui/button";
import { PlusCircle, TrendingUp, MessageSquare, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

interface TopicWithDetails {
  id: string;
  title: string;
  content: string;
  created_at: string;
  view_count: number;
  reply_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  last_activity_at: string;
  profiles: {
    name: string;
    avatar_url: string;
  } | null;
  forum_categories: {
    id: string;
    name: string;
    slug: string;
    color: string;
  } | null;
}

interface CommunityStats {
  totalTopics: number;
  totalMessages: number;
  totalMembers: number;
}

const CommunityHome = () => {
  const [topics, setTopics] = useState<TopicWithDetails[]>([]);
  const [stats, setStats] = useState<CommunityStats>({
    totalTopics: 0,
    totalMessages: 0,
    totalMembers: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar tópicos recentes
        const { data: topicsData, error: topicsError } = await supabase
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
            last_activity_at,
            profiles!forum_topics_user_id_fkey (
              name,
              avatar_url
            ),
            forum_categories!forum_topics_category_id_fkey (
              id,
              name,
              slug,
              color
            )
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        if (topicsError) {
          console.error('Erro ao buscar tópicos:', topicsError);
        } else {
          // Transformar os dados para o formato esperado
          const transformedTopics: TopicWithDetails[] = (topicsData || []).map(topic => ({
            ...topic,
            profiles: Array.isArray(topic.profiles) 
              ? (topic.profiles.length > 0 ? topic.profiles[0] : null)
              : topic.profiles,
            forum_categories: Array.isArray(topic.forum_categories)
              ? (topic.forum_categories.length > 0 ? topic.forum_categories[0] : null)
              : topic.forum_categories
          }));
          
          setTopics(transformedTopics);
        }

        // Buscar estatísticas
        const [
          { count: topicsCount },
          { count: postsCount },
          { count: membersCount }
        ] = await Promise.all([
          supabase.from('forum_topics').select('*', { count: 'exact', head: true }),
          supabase.from('forum_posts').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true })
        ]);

        setStats({
          totalTopics: topicsCount || 0,
          totalMessages: postsCount || 0,
          totalMembers: membersCount || 0
        });

      } catch (error) {
        console.error('Erro ao carregar dados da comunidade:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <ForumLayout>
        <div className="space-y-8">
          {/* Header Skeleton */}
          <div className="text-center space-y-4">
            <Skeleton className="h-12 w-64 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-8 w-8 mb-4" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </Card>
            ))}
          </div>

          {/* Topics Skeleton */}
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </ForumLayout>
    );
  }

  return (
    <ForumLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm border border-white/10 mb-6 glow-card">
            <MessageSquare className="w-10 h-10 text-primary" />
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-4">
            Comunidade Viver de IA
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Conecte-se com outros membros, compartilhe experiências e tire suas dúvidas sobre IA
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl transition-all duration-300">
              <Link to="/comunidade/novo-topico">
                <PlusCircle className="w-5 h-5 mr-2" />
                Criar Tópico
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="border-primary/20 hover:bg-primary/5">
              <Link to="/comunidade/categorias">
                Ver Categorias
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-card/60 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-all duration-300 glow-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalTopics}</p>
                <p className="text-sm text-muted-foreground">Tópicos</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/60 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-all duration-300 glow-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20">
                <MessageSquare className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalMessages}</p>
                <p className="text-sm text-muted-foreground">Mensagens</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/60 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-all duration-300 glow-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalMembers}</p>
                <p className="text-sm text-muted-foreground">Membros</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Topics */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-foreground">Tópicos Recentes</h2>
            <Button asChild variant="outline">
              <Link to="/comunidade/populares">Ver Populares</Link>
            </Button>
          </div>

          {topics.length === 0 ? (
            <Card className="p-12 text-center bg-card/60 backdrop-blur-sm border-border/50">
              <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum tópico ainda</h3>
              <p className="text-muted-foreground mb-6">Seja o primeiro a iniciar uma discussão na comunidade!</p>
              <Button asChild>
                <Link to="/comunidade/novo-topico">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Criar Primeiro Tópico
                </Link>
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {topics.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={{
                    id: topic.id,
                    title: topic.title,
                    content: topic.content,
                    created_at: topic.created_at,
                    updated_at: topic.created_at,
                    user_id: '',
                    category_id: topic.forum_categories?.id || '',
                    view_count: topic.view_count,
                    reply_count: topic.reply_count,
                    is_pinned: topic.is_pinned,
                    is_locked: topic.is_locked,
                    is_solved: false,
                    last_activity_at: topic.last_activity_at,
                    profiles: topic.profiles ? {
                      id: '',
                      name: topic.profiles.name,
                      avatar_url: topic.profiles.avatar_url
                    } : null,
                    category: topic.forum_categories ? {
                      id: topic.forum_categories.id,
                      name: topic.forum_categories.name,
                      slug: topic.forum_categories.slug
                    } : null
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </ForumLayout>
  );
};

export default CommunityHome;
