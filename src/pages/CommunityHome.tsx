
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Plus, 
  Eye,
  Clock,
  CheckCircle2,
  Pin
} from "lucide-react";
import { CommunityStats } from "@/components/community/CommunityStats";
import { CommunitySidebar } from "@/components/community/CommunitySidebar";
import { CategoryTabs } from "@/components/community/CategoryTabs";
import { CommunityFilters, FilterType } from "@/components/community/CommunityFilters";
import { ForumTopic, ForumCategory } from "@/types/forumTypes";

const CommunityHome = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("recentes");

  // Buscar categorias
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['forumCategories'],
    queryFn: async () => {
      const { data } = await supabase
        .from('forum_categories')
        .select(`
          *,
          forum_topics(count)
        `)
        .eq('is_active', true)
        .order('order_index');
      
      return data?.map(category => ({
        ...category,
        topic_count: category.forum_topics?.[0]?.count || 0
      })) || [];
    }
  });

  // Buscar tópicos com filtros
  const { data: topics, isLoading: topicsLoading } = useQuery({
    queryKey: ['forumTopics', searchQuery, activeFilter],
    queryFn: async () => {
      let query = supabase
        .from('forum_topics')
        .select(`
          *,
          forum_categories(name, slug, icon),
          profiles(name, avatar_url),
          forum_replies(count)
        `);

      // Aplicar filtros
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }

      switch (activeFilter) {
        case "populares":
          query = query.order('views', { ascending: false });
          break;
        case "sem-respostas":
          query = query.eq('reply_count', 0);
          break;
        case "resolvidos":
          query = query.eq('is_solved', true);
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data } = await query.limit(20);
      return data || [];
    }
  });

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Agora há pouco";
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d atrás`;
    
    return postDate.toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header com Gradiente */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b border-border/50 mb-8">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                💬 Comunidade VIVER DE IA
              </h1>
              <p className="text-muted-foreground text-lg">
                Conecte-se, aprenda e compartilhe conhecimento com outros membros
              </p>
            </div>
            <Button asChild className="gap-2 shadow-lg hover:shadow-xl transition-all">
              <Link to="/comunidade/novo-topico">
                <Plus className="h-4 w-4" />
                Novo Tópico
              </Link>
            </Button>
          </div>
          
          {/* Estatísticas Visuais */}
          <CommunityStats />
        </div>
      </div>

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Conteúdo Principal */}
          <div className="lg:col-span-3 space-y-6">
            {/* Filtros Avançados */}
            <CommunityFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />

            {/* Sistema de Abas por Categoria */}
            <Tabs defaultValue="todos" className="w-full">
              <CategoryTabs categories={categories} isLoading={categoriesLoading} />
              
              <TabsContent value="todos" className="mt-6">
                <div className="space-y-4">
                  {topicsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </CardContent>
                      </Card>
                    ))
                  ) : topics?.length === 0 ? (
                    <Card className="text-center py-12">
                      <CardContent>
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Nenhum tópico encontrado</h3>
                        <p className="text-muted-foreground mb-4">
                          {searchQuery 
                            ? `Não encontramos tópicos para "${searchQuery}"`
                            : "Seja o primeiro a iniciar uma discussão!"
                          }
                        </p>
                        <Button asChild>
                          <Link to="/comunidade/novo-topico">
                            <Plus className="h-4 w-4 mr-2" />
                            Criar Primeiro Tópico
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    topics?.map((topic) => (
                      <Card key={topic.id} className="hover:shadow-md transition-all duration-200 group">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-10 w-10 ring-2 ring-border">
                              <AvatarImage src={topic.profiles?.avatar_url} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {topic.profiles?.name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    {topic.is_pinned && (
                                      <Pin className="h-4 w-4 text-primary" />
                                    )}
                                    <Link 
                                      to={`/comunidade/topico/${topic.id}`}
                                      className="font-semibold text-foreground hover:text-primary transition-colors group-hover:text-primary"
                                    >
                                      {topic.title}
                                    </Link>
                                    {topic.is_solved && (
                                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span>por {topic.profiles?.name || 'Usuário'}</span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {formatTimeAgo(topic.created_at)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Eye className="h-3 w-3" />
                                      {topic.views || 0}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MessageSquare className="h-3 w-3" />
                                      {topic.forum_replies?.[0]?.count || 0}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  {topic.forum_categories && (
                                    <Badge variant="secondary" className="gap-1">
                                      <span>{topic.forum_categories.icon || '📁'}</span>
                                      {topic.forum_categories.name}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Abas por Categoria */}
              {categories?.map((category) => (
                <TabsContent key={category.slug} value={category.slug} className="mt-6">
                  <div className="space-y-4">
                    {/* Aqui você pode filtrar os tópicos por categoria específica */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <span className="text-2xl">{category.icon || '📁'}</span>
                          {category.name}
                        </CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </CardHeader>
                    </Card>
                    
                    {/* Mostrar tópicos filtrados por esta categoria */}
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Tópicos desta categoria aparecerão aqui</p>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <CommunitySidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityHome;
