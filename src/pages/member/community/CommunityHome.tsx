
import React, { memo, useMemo, useCallback, Suspense } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ForumLayout } from "@/components/community/ForumLayout";
import { CategoryList } from "@/components/community/CategoryList";
import { TopicList } from "@/components/community/TopicList";
import { ForumSearch } from "@/components/community/ForumSearch";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, Users, TrendingUp, PlusCircle } from "lucide-react";
import { useForumTopics, TopicFilterType } from "@/hooks/community/useForumTopics";
import { useForumStats } from "@/hooks/useForumStats";

// Componente simplificado para estatísticas sem memo para debug
const ForumStatsComponent = () => {
  console.log("ForumStatsComponent renderizando...");
  
  const { topicCount, postCount, activeUserCount, solvedCount, isLoading } = useForumStats();
  
  console.log("Stats carregadas:", { topicCount, postCount, activeUserCount, solvedCount, isLoading });

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
            <span className="text-xl font-bold">{topicCount}</span>
            <span className="text-sm text-muted-foreground">Tópicos</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center mb-2 h-10 w-10 rounded-full bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold">{postCount}</span>
            <span className="text-sm text-muted-foreground">Respostas</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center mb-2 h-10 w-10 rounded-full bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold">{activeUserCount}</span>
            <span className="text-sm text-muted-foreground">Participantes</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center mb-2 h-10 w-10 rounded-full bg-green-500/10">
              <MessageSquare className="h-5 w-5 text-green-500" />
            </div>
            <span className="text-xl font-bold">{solvedCount}</span>
            <span className="text-sm text-muted-foreground">Resolvidos</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente principal simplificado para debug
const CommunityHome = () => {
  console.log("CommunityHome renderizando...");
  
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Estados simplificados
  const searchQuery = searchParams.get("q") || "";
  const selectedFilter: TopicFilterType = (searchParams.get("filter") as TopicFilterType) || "recentes";
  const activeTab = searchParams.get("tab") || "todos";

  // Hooks
  const { topics, isLoading, error, refetch } = useForumTopics({
    searchQuery,
    filter: selectedFilter,
    categorySlug: activeTab !== "todos" ? activeTab : undefined,
  });

  console.log("Topics carregados:", { topics: topics?.length, isLoading, error });

  // Handlers
  const handleSearchChange = useCallback((value: string) => {
    console.log("Search mudou:", value);
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set("q", value);
    } else {
      newParams.delete("q");
    }
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const handleFilterChange = useCallback((filter: TopicFilterType) => {
    console.log("Filter mudou:", filter);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("filter", filter);
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const handleTabChange = useCallback((value: string) => {
    console.log("Tab mudou:", value);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("tab", value);
    newParams.delete("q"); // Limpar busca ao mudar tab
    newParams.set("filter", "recentes"); // Reset filter
    setSearchParams(newParams);
  }, [setSearchParams]);

  const handleNewTopic = useCallback(() => {
    console.log("Novo tópico clicado");
    navigate("/comunidade/novo-topico");
  }, [navigate]);

  // Sidebar content
  const sidebarContent = useMemo(() => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Categorias</h3>
        <Suspense fallback={<div>Carregando categorias...</div>}>
          <CategoryList />
        </Suspense>
      </div>
    </div>
  ), []);

  console.log("Renderizando CommunityHome completo");

  return (
    <ForumLayout sidebar={sidebarContent}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Comunidade VIA
            </h1>
            <p className="text-muted-foreground mt-2">
              Compartilhe conhecimento, faça perguntas e conecte-se com outros membros.
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Button onClick={handleNewTopic} className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>Novo Tópico</span>
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <ForumStatsComponent />

        {/* Busca */}
        <ForumSearch
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          selectedFilter={selectedFilter}
          setSelectedFilter={handleFilterChange}
        />

        {/* Tabs e Conteúdo */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="todos">Todos os Tópicos</TabsTrigger>
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="suporte">Suporte</TabsTrigger>
            <TabsTrigger value="recursos">Recursos</TabsTrigger>
          </TabsList>

          <TabsContent value="todos" className="mt-6">
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : error ? (
                <Card className="p-6 text-center">
                  <p className="text-muted-foreground mb-4">Erro ao carregar tópicos</p>
                  <Button onClick={refetch} variant="outline">
                    Tentar novamente
                  </Button>
                </Card>
              ) : (
                <div>
                  {topics && topics.length > 0 ? (
                    topics.map((topic) => (
                      <Card key={topic.id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-lg mb-2">{topic.title}</h3>
                            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                              {topic.content}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>Por {topic.user?.name || 'Usuário'}</span>
                              <span>•</span>
                              <span>{new Date(topic.created_at).toLocaleDateString()}</span>
                              {topic.category && (
                                <>
                                  <span>•</span>
                                  <Badge variant="secondary">{topic.category.name}</Badge>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MessageSquare className="h-4 w-4" />
                              <span>{topic.posts_count || 0}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <Card className="p-8 text-center">
                      <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Nenhum tópico encontrado</h3>
                      <p className="text-muted-foreground mb-4">
                        Seja o primeiro a iniciar uma discussão!
                      </p>
                      <Button onClick={handleNewTopic}>
                        Criar primeiro tópico
                      </Button>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Outras tabs usam TopicList quando disponível */}
          {["geral", "suporte", "recursos"].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-6">
              <Suspense fallback={<div>Carregando tópicos...</div>}>
                <TopicList 
                  categoryId={tab} 
                  categorySlug={tab}
                />
              </Suspense>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </ForumLayout>
  );
};

export default CommunityHome;
