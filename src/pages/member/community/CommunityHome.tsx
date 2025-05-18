
import React, { useState } from "react";
import { ForumLayout } from "@/components/community/ForumLayout";
import { MessageSquare, Users, BarChart, Search, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useForumStats } from "@/hooks/useForumStats";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { CategoryCard } from "@/components/community/CategoryCard";
import { QuickPostEditor } from "@/components/community/QuickPostEditor";
import { TopicCard } from "@/components/community/TopicCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type TopicFilterType = "recentes" | "populares" | "sem-respostas" | "resolvidos";

const CommunityHome = () => {
  const [activeTab, setActiveTab] = useState<string>("todos");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<TopicFilterType>("recentes");
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

  // Buscar tópicos - Ajustado para usar a queryKey correta e garantir que tópicos apareçam
  const { data: topics, isLoading: topicsLoading } = useQuery({
    queryKey: ['communityTopics', selectedFilter, searchQuery, activeTab],
    queryFn: async () => {
      let query = supabase
        .from('forum_topics')
        .select(`
          *,
          profiles:user_id(*),
          category:category_id(id, name, slug)
        `)
        .order('is_pinned', { ascending: false });
        
      // Aplicar filtros de categoria apenas se não for "todos"
      if (activeTab !== "todos") {
        const category = categories?.find(c => c.slug === activeTab);
        if (category) {
          query = query.eq('category_id', category.id);
        }
      }
      
      // Aplicar filtros adicionais
      switch (selectedFilter) {
        case "recentes":
          query = query.order('last_activity_at', { ascending: false });
          break;
        case "populares":
          query = query.order('view_count', { ascending: false });
          break;
        case "sem-respostas":
          query = query.eq('reply_count', 0).order('created_at', { ascending: false });
          break;
      }
      
      // Aplicar filtro de busca
      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }
      
      // Limitar resultados
      query = query.limit(20);
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Erro ao buscar tópicos:", error);
        throw error;
      }
      
      console.log("Tópicos encontrados:", data?.length || 0);
      return data;
    },
    refetchOnWindowFocus: false,
  });

  // Preparar tabs para as categorias
  const renderCategoryTabs = () => {
    if (categoriesLoading) {
      return <Skeleton className="h-10 w-full" />;
    }

    return (
      <TabsList className="overflow-x-auto flex w-full h-auto p-1">
        <TabsTrigger value="todos" className="min-w-max">
          Todos os Tópicos
        </TabsTrigger>
        {categories?.map((category) => (
          <TabsTrigger key={category.id} value={category.slug} className="min-w-max">
            {category.name}
          </TabsTrigger>
        ))}
      </TabsList>
    );
  };

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
        
        {/* Estatísticas - mantemos isso para mostrar informações gerais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
        
        {/* Barra de pesquisa e filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Pesquisar tópicos..." 
              className="pl-10" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedFilter === "recentes" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("recentes")}
            >
              Recentes
            </Button>
            <Button
              variant={selectedFilter === "populares" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("populares")}
            >
              Populares
            </Button>
            <Button
              variant={selectedFilter === "sem-respostas" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("sem-respostas")}
            >
              Sem respostas
            </Button>
          </div>
        </div>
        
        {/* Tabs por categorias e conteúdo */}
        <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab} className="w-full">
          {renderCategoryTabs()}
          
          <TabsContent value={activeTab} className="mt-4">
            {topicsLoading ? (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="h-32 p-4 animate-pulse mb-4">
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
            ) : topics && topics.length > 0 ? (
              <div className="space-y-4">
                {topics.map((topic) => (
                  <TopicCard key={topic.id} topic={topic} />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-medium mb-2">
                  {searchQuery ? "Nenhum tópico encontrado" : "Nenhuma discussão iniciada ainda"}
                </h2>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? "Tente usar termos diferentes na sua busca."
                    : "Seja o primeiro a iniciar uma discussão nesta categoria."
                  }
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CommunityHome;
