
import React, { useState, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { ForumLayout } from "@/components/community/ForumLayout";
import { ForumHeader } from "@/components/community/ForumHeader";
import { ForumSearch } from "@/components/community/ForumSearch";
import { TopicCard } from "@/components/community/TopicCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, Users, TrendingUp, PlusCircle } from "lucide-react";
import { useForumTopics, TopicFilterType } from "@/hooks/community/useForumTopics";
import { useForumStats } from "@/hooks/community/useForumStats";

// Componente otimizado para estatísticas em tempo real
const OptimizedForumStats = memo(() => {
  const { topicCount, postCount, activeUserCount, solvedCount, isLoading } = useForumStats();

  if (isLoading) {
    return (
      <Card className="relative overflow-hidden">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg blur opacity-30"></div>
        <CardContent className="relative bg-card/80 backdrop-blur-sm p-6">
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg blur opacity-30"></div>
      <CardContent className="relative bg-card/80 backdrop-blur-sm p-6">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Estatísticas da Comunidade
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2 h-10 w-10 rounded-full bg-primary/10 mx-auto">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div className="text-2xl font-bold">{topicCount}</div>
            <div className="text-sm text-muted-foreground">Tópicos</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2 h-10 w-10 rounded-full bg-accent/10 mx-auto">
              <MessageSquare className="h-5 w-5 text-accent" />
            </div>
            <div className="text-2xl font-bold">{postCount}</div>
            <div className="text-sm text-muted-foreground">Respostas</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2 h-10 w-10 rounded-full bg-blue-500/10 mx-auto">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{activeUserCount}</div>
            <div className="text-sm text-muted-foreground">Participantes</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2 h-10 w-10 rounded-full bg-green-500/10 mx-auto">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{solvedCount}</div>
            <div className="text-sm text-muted-foreground">Resolvidos</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

OptimizedForumStats.displayName = 'OptimizedForumStats';

// Componente principal otimizado
export const CommunityHome = memo(() => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"all" | "my-topics">("all");
  const [selectedFilter, setSelectedFilter] = useState<TopicFilterType>("recentes");
  const [searchQuery, setSearchQuery] = useState("");

  // Memoizar parâmetros da query para evitar re-renders desnecessários
  const queryParams = useMemo(() => ({
    activeTab,
    selectedFilter,
    searchQuery: searchQuery.trim()
  }), [activeTab, selectedFilter, searchQuery]);

  const { topics, isLoading, error } = useForumTopics(queryParams);

  // Memoizar sidebar content
  const sidebarContent = useMemo(() => (
    <div className="space-y-6">
      <OptimizedForumStats />
      
      <Card className="relative overflow-hidden">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/20 to-primary/20 rounded-lg blur opacity-30"></div>
        <CardContent className="relative bg-card/80 backdrop-blur-sm p-6">
          <h3 className="text-lg font-medium mb-4">Categorias Populares</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                Geral
              </Badge>
              <span className="text-sm text-muted-foreground">12 tópicos</span>
            </div>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                Implementação
              </Badge>
              <span className="text-sm text-muted-foreground">8 tópicos</span>
            </div>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                Dúvidas
              </Badge>
              <span className="text-sm text-muted-foreground">15 tópicos</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg blur opacity-30"></div>
        <CardContent className="relative bg-card/80 backdrop-blur-sm p-6">
          <h3 className="text-lg font-medium mb-4">Contribua</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Compartilhe suas experiências e ajude outros membros!
          </p>
          <Button 
            className="w-full"
            onClick={() => navigate("/comunidade/novo-topico/geral")}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Criar Tópico
          </Button>
        </CardContent>
      </Card>
    </div>
  ), [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <ForumLayout sidebar={sidebarContent}>
        <div className="space-y-6">
          <ForumHeader
            title="Comunidade VIA"
            description="Conecte-se, compartilhe conhecimento e cresça junto com outros empreendedores."
            showNewTopicButton={true}
            onNewTopicClick={() => navigate("/comunidade/novo-topico/geral")}
          />

          <ForumSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
          />

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "all" | "my-topics")}>
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="all">Todos os Tópicos</TabsTrigger>
              <TabsTrigger value="my-topics">Meus Tópicos</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <Card className="p-8 text-center">
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Erro ao carregar os tópicos. Tente novamente.
                    </p>
                    <Button onClick={() => window.location.reload()}>
                      Recarregar
                    </Button>
                  </CardContent>
                </Card>
              ) : topics.length === 0 ? (
                <Card className="p-8 text-center">
                  <CardContent>
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhum tópico encontrado</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery ? "Tente ajustar sua pesquisa." : "Seja o primeiro a iniciar uma conversa!"}
                    </p>
                    <Button onClick={() => navigate("/comunidade/novo-topico/geral")}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Criar Primeiro Tópico
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {topics.map((topic) => (
                    <TopicCard key={topic.id} topic={topic} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </ForumLayout>
    </div>
  );
});

CommunityHome.displayName = 'CommunityHome';
