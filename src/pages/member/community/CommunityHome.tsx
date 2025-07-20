
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  MessageSquare, 
  BookOpen, 
  Search, 
  TrendingUp,
  Clock,
  Eye,
  MessageCircle,
  Pin,
  Lock,
  User
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getContentPreview } from "@/components/community/utils/contentUtils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

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
    avatar_url: string | null;
  } | null;
  forum_categories: {
    id: string;
    name: string;
    slug: string;
    description: string;
    color: string;
  } | null;
}

const CommunityHome = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Buscar estatísticas
  const { data: stats } = useQuery({
    queryKey: ['community-stats'],
    queryFn: async () => {
      const [topicsResult, postsResult, usersResult] = await Promise.all([
        supabase.from('forum_topics').select('*', { count: 'exact', head: true }),
        supabase.from('forum_posts').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
      ]);

      return {
        topics: topicsResult.count || 0,
        posts: postsResult.count || 0,
        users: usersResult.count || 0
      };
    }
  });

  // Buscar tópicos recentes
  const { data: recentTopics, isLoading: topicsLoading } = useQuery({
    queryKey: ['recent-topics', searchQuery],
    queryFn: async () => {
      let query = supabase
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
            description,
            color
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TopicWithDetails[];
    }
  });

  return (
    <div className="min-h-screen">
      {/* Aurora Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-accent/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-secondary/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm border border-white/10 mb-6">
            <Users className="w-10 h-10 text-primary" />
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-4">
            Comunidade
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Conecte-se, compartilhe conhecimento e cresça junto com outros profissionais de IA
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={() => navigate('/comunidade/novo-topico')}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Iniciar Discussão
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/comunidade/categorias')}
              className="border-primary/20 hover:bg-primary/5 px-6 py-3 rounded-xl"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Ver Categorias
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-card/60 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                {stats?.topics || 0}
              </div>
              <div className="text-sm text-muted-foreground">Tópicos Ativos</div>
            </CardContent>
          </Card>

          <Card className="bg-card/60 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 text-accent mb-4">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                {stats?.posts || 0}
              </div>
              <div className="text-sm text-muted-foreground">Mensagens</div>
            </CardContent>
          </Card>

          <Card className="bg-card/60 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/10 text-secondary mb-4">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                {stats?.users || 0}
              </div>
              <div className="text-sm text-muted-foreground">Membros</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-card/60 backdrop-blur-sm border-border/50 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar discussões..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-border/50">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Populares
                </Button>
                <Button variant="outline" size="sm" className="border-border/50">
                  <Clock className="w-4 h-4 mr-1" />
                  Recentes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Topics */}
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <MessageSquare className="w-6 h-6 mr-2 text-primary" />
              Discussões Recentes
            </h2>

            {topicsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex gap-4 p-4 rounded-lg bg-muted/50">
                      <div className="w-10 h-10 bg-muted rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-muted rounded-md w-3/4 mb-2"></div>
                        <div className="h-4 bg-muted rounded-md w-full mb-2"></div>
                        <div className="h-3 bg-muted rounded-md w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentTopics && recentTopics.length > 0 ? (
              <div className="space-y-4">
                {recentTopics.map((topic) => (
                  <Link
                    key={topic.id}
                    to={`/comunidade/topico/${topic.id}`}
                    className="block group"
                  >
                    <Card className="bg-background/50 border-border/50 hover:bg-background/80 hover:border-border/80 transition-all duration-300 hover:shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {topic.is_pinned && (
                                  <Pin className="w-4 h-4 text-primary" />
                                )}
                                {topic.is_locked && (
                                  <Lock className="w-4 h-4 text-muted-foreground" />
                                )}
                                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                  {topic.title}
                                </h3>
                              </div>
                              
                              {topic.forum_categories && (
                                <Badge 
                                  variant="secondary" 
                                  className="text-xs"
                                  style={{ 
                                    backgroundColor: `${topic.forum_categories.color}20`,
                                    color: topic.forum_categories.color,
                                    borderColor: `${topic.forum_categories.color}40`
                                  }}
                                >
                                  {topic.forum_categories.name}
                                </Badge>
                              )}
                            </div>

                            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                              {getContentPreview(topic.content, 150)}
                            </p>

                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {topic.profiles?.name || 'Usuário'}
                                </span>
                                
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {topic.view_count}
                                </span>
                                
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="w-3 h-3" />
                                  {topic.reply_count}
                                </span>
                              </div>

                              <span>
                                {formatDistanceToNow(new Date(topic.created_at), {
                                  addSuffix: true,
                                  locale: ptBR
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhuma discussão encontrada</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery ? 'Tente usar termos diferentes na sua busca.' : 'Seja o primeiro a iniciar uma discussão!'}
                </p>
                <Button onClick={() => navigate('/comunidade/novo-topico')}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Criar Primeiro Tópico
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommunityHome;
