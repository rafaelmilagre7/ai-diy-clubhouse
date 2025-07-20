
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, TrendingUp, MessageSquare, Eye, Users, BookOpen, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForumTopics, TopicFilterType } from "@/hooks/community/useForumTopics";
import { useForumCategories } from "@/hooks/community/useForumCategories";
import { Topic, ForumCategory } from "@/types/forumTypes";
import { getContentPreview } from "@/components/community/utils/contentUtils";
import { formatRelativeTime, getInitials } from "@/components/community/utils/formatUtils";

export default function CommunityHome() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<TopicFilterType>("recentes");
  const [activeTab, setActiveTab] = useState<"all" | "my-topics">("all");

  const { categories } = useForumCategories();
  const { topics, isLoading: topicsLoading } = useForumTopics({
    activeTab,
    selectedFilter,
    searchQuery
  });

  // Query separada para estatísticas da comunidade
  const { data: communityStats } = useQuery({
    queryKey: ['communityStats'],
    queryFn: async () => {
      const [topicsResult, categoriesResult] = await Promise.all([
        supabase.from('forum_topics').select('id').eq('is_pinned', false),
        supabase.from('forum_categories').select('id').eq('is_active', true)
      ]);

      return {
        totalTopics: topicsResult.data?.length || 0,
        totalCategories: categoriesResult.data?.length || 0,
        totalMembers: 150, // Placeholder
        totalSolutions: 45  // Placeholder
      };
    }
  });

  // Query corrigida para tópicos em destaque
  const { data: featuredTopics = [] } = useQuery({
    queryKey: ['featuredTopics'],
    queryFn: async () => {
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
          user_id,
          category_id,
          profiles!forum_topics_user_id_fkey (
            name,
            avatar_url
          ),
          forum_categories!forum_topics_category_id_fkey (
            name,
            slug
          )
        `)
        .eq('is_pinned', true)
        .limit(3);

      if (error) {
        console.error("Erro ao buscar tópicos em destaque:", error);
        return [];
      }

      // Mapear os dados para o formato correto do tipo Topic
      return (data || []).map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        created_at: item.created_at,
        updated_at: item.created_at, // Usando created_at como fallback
        user_id: item.user_id,
        category_id: item.category_id,
        view_count: item.view_count || 0,
        reply_count: item.reply_count || 0,
        is_pinned: item.is_pinned || false,
        is_locked: item.is_locked || false,
        is_solved: false, // Valor padrão
        last_activity_at: item.created_at,
        profiles: item.profiles ? {
          id: item.user_id,
          name: item.profiles.name || 'Usuário',
          avatar_url: item.profiles.avatar_url,
          role: undefined,
          user_id: item.user_id
        } : null,
        category: item.forum_categories ? {
          id: item.category_id,
          name: item.forum_categories.name,
          slug: item.forum_categories.slug,
          description: undefined,
          topic_count: undefined,
          color: undefined,
          icon: undefined,
          order: undefined
        } : null
      })) as Topic[];
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header da Comunidade */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Comunidade Viver de IA
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Conecte-se, aprenda e cresça junto com uma comunidade de profissionais apaixonados por inteligência artificial.
          </p>

          {/* Estatísticas da Comunidade */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 text-center border-primary/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold text-primary">{communityStats?.totalTopics || 0}</span>
              </div>
              <p className="text-sm text-muted-foreground">Tópicos</p>
            </Card>
            <Card className="p-4 text-center border-primary/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold text-primary">{communityStats?.totalCategories || 0}</span>
              </div>
              <p className="text-sm text-muted-foreground">Categorias</p>
            </Card>
            <Card className="p-4 text-center border-primary/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold text-primary">{communityStats?.totalMembers || 0}</span>
              </div>
              <p className="text-sm text-muted-foreground">Membros</p>
            </Card>
            <Card className="p-4 text-center border-primary/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold text-primary">{communityStats?.totalSolutions || 0}</span>
              </div>
              <p className="text-sm text-muted-foreground">Soluções</p>
            </Card>
          </div>
        </div>

        {/* Busca e Filtros */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Pesquisar tópicos, perguntas, soluções..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" className="px-6">
              Buscar
            </Button>
            <Button asChild variant="default" className="px-6">
              <Link to="/comunidade/novo-topico">
                <Plus className="h-4 w-4 mr-2" />
                Novo Tópico
              </Link>
            </Button>
          </form>

          <div className="flex flex-wrap gap-4 items-center">
            <Select value={selectedFilter} onValueChange={(value) => setSelectedFilter(value as TopicFilterType)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recentes">Mais Recentes</SelectItem>
                <SelectItem value="populares">Mais Populares</SelectItem>
                <SelectItem value="sem-respostas">Sem Respostas</SelectItem>
                <SelectItem value="resolvidos">Resolvidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Conteúdo Principal */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "all" | "my-topics")}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">Todos os Tópicos</TabsTrigger>
                <TabsTrigger value="my-topics">Meus Tópicos</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                {/* Tópicos em Destaque */}
                {featuredTopics.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Tópicos em Destaque
                    </h2>
                    <div className="space-y-4">
                      {featuredTopics.map((topic) => (
                        <Card key={topic.id} className="p-6 hover:shadow-md transition-shadow border-primary/20">
                          <Link to={`/comunidade/topico/${topic.id}`} className="block">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-12 w-12 shrink-0">
                                <AvatarImage src={topic.profiles?.avatar_url || undefined} />
                                <AvatarFallback>{getInitials(topic.profiles?.name)}</AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                  <span className="font-medium">{topic.profiles?.name || "Usuário"}</span>
                                  <span>•</span>
                                  <span>{formatRelativeTime(topic.created_at)}</span>
                                  {topic.category && (
                                    <>
                                      <span>•</span>
                                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                        {topic.category.name}
                                      </Badge>
                                    </>
                                  )}
                                </div>
                                
                                <h3 className="text-xl font-semibold mb-2 text-foreground hover:text-primary transition-colors">
                                  {topic.title}
                                </h3>
                                
                                <p className="text-muted-foreground mb-3 line-clamp-2">
                                  {getContentPreview(topic.content)}
                                </p>
                                
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <MessageSquare className="h-4 w-4" />
                                    <span>{topic.reply_count}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Eye className="h-4 w-4" />
                                    <span>{topic.view_count}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lista de Tópicos */}
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Discussões Recentes</h2>
                  {topicsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Card key={i} className="p-6">
                          <div className="animate-pulse">
                            <div className="flex items-start gap-4">
                              <div className="h-12 w-12 bg-muted rounded-full"></div>
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-muted rounded w-3/4"></div>
                                <div className="h-3 bg-muted rounded w-1/2"></div>
                                <div className="h-3 bg-muted rounded w-full"></div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {topics.map((topic) => (
                        <Card key={topic.id} className="p-6 hover:shadow-md transition-shadow">
                          <Link to={`/comunidade/topico/${topic.id}`} className="block">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-10 w-10 shrink-0">
                                <AvatarImage src={topic.profiles?.avatar_url || undefined} />
                                <AvatarFallback>{getInitials(topic.profiles?.name)}</AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                  <span className="font-medium truncate">{topic.profiles?.name || "Usuário"}</span>
                                  <span>•</span>
                                  <span>{formatRelativeTime(topic.created_at)}</span>
                                  {topic.category && (
                                    <>
                                      <span>•</span>
                                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                        {topic.category.name}
                                      </Badge>
                                    </>
                                  )}
                                </div>
                                
                                <h3 className="text-lg font-semibold mb-1 line-clamp-1 text-foreground hover:text-primary transition-colors">
                                  {topic.title}
                                </h3>
                                
                                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                                  {getContentPreview(topic.content)}
                                </p>
                                
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <MessageSquare className="h-4 w-4" />
                                    <span>{topic.reply_count}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Eye className="h-4 w-4" />
                                    <span>{topic.view_count}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="my-topics">
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum tópico criado ainda</h3>
                  <p className="text-muted-foreground mb-4">Que tal começar uma discussão interessante?</p>
                  <Button asChild>
                    <Link to="/comunidade/novo-topico">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Tópico
                    </Link>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Categorias */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Categorias</h3>
              <div className="space-y-3">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/comunidade/categoria/${category.slug}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full shrink-0" 
                        style={{ backgroundColor: category.color || '#6366f1' }}
                      />
                      <span className="font-medium group-hover:text-primary transition-colors">
                        {category.name}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {category.topic_count || 0}
                    </Badge>
                  </Link>
                ))}
              </div>
            </Card>

            {/* Ações Rápidas */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Ações Rápidas</h3>
              <div className="space-y-3">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/comunidade/novo-topico">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Discussão
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/comunidade/topicos">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Ver Todos os Tópicos
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
