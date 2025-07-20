
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Users, MessageSquare, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { ForumSearch } from "@/components/community/ForumSearch";
import { useForumStats } from "@/hooks/useForumStats";
import { useForumTopics, TopicFilterType } from "@/hooks/community/useForumTopics";

console.log("CommunityHome: Componente iniciando...");

const ForumStatsComponent = () => {
  console.log("ForumStatsComponent: Renderizando...");
  
  const { stats, isLoading } = useForumStats();
  console.log("ForumStatsComponent: Stats recebidas", { stats, isLoading });

  if (isLoading) {
    console.log("ForumStatsComponent: Carregando stats...");
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carregando...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  console.log("ForumStatsComponent: Renderizando stats finais", stats);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Membros</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalMembers || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tópicos Ativos</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.activeTopics || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Problemas Resolvidos</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.solvedCount || 0}</div>
        </CardContent>
      </Card>
    </div>
  );
};

const CommunityHome = () => {
  console.log("CommunityHome: Componente principal renderizando...");
  
  const [activeTab, setActiveTab] = useState<"all" | "my-topics">("all");
  const [selectedFilter, setSelectedFilter] = useState<TopicFilterType>("recentes");
  const [searchQuery, setSearchQuery] = useState("");

  console.log("CommunityHome: Estado atual", { activeTab, selectedFilter, searchQuery });

  const { topics, isLoading, error, refetch } = useForumTopics({
    activeTab,
    selectedFilter,
    searchQuery
  });

  console.log("CommunityHome: Dados dos tópicos", { topics: topics?.length, isLoading, error });

  const handleRetry = () => {
    console.log("CommunityHome: Tentando recarregar tópicos...");
    refetch();
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Comunidade</h1>
          <p className="text-muted-foreground mt-2">
            Conecte-se com outros membros, compartilhe experiências e encontre soluções
          </p>
        </div>
        <Button asChild>
          <Link to="/comunidade/novo-topico/geral">
            <Plus className="h-4 w-4 mr-2" />
            Novo Tópico
          </Link>
        </Button>
      </div>

      <ForumStatsComponent />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "all" | "my-topics")}>
        <TabsList>
          <TabsTrigger value="all">Todos os Tópicos</TabsTrigger>
          <TabsTrigger value="my-topics">Meus Tópicos</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <ForumSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
          />

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                      <div className="h-3 bg-muted animate-pulse rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-red-500 mb-4">Erro ao carregar tópicos</p>
                <Button onClick={handleRetry}>Tentar Novamente</Button>
              </CardContent>
            </Card>
          ) : topics.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum tópico encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  Seja o primeiro a criar um tópico na comunidade!
                </p>
                <Button asChild>
                  <Link to="/comunidade/novo-topico/geral">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Tópico
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {topics.map((topic: any) => (
                <Card key={topic.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <Link 
                          to={`/comunidade/topico/${topic.id}`}
                          className="font-semibold hover:text-primary transition-colors"
                        >
                          {topic.title}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          Por {topic.profiles?.name || 'Usuário'} • {topic.reply_count} respostas • {topic.view_count} visualizações
                        </p>
                      </div>
                      {topic.is_solved && (
                        <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-topics">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Seus tópicos aparecerão aqui</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityHome;
