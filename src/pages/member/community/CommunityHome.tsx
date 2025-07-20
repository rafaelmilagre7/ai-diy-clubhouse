import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, MessageSquare, Eye, Calendar, CheckCircle2, Users, BookOpen } from "lucide-react";
import { useForumStats } from "@/hooks/useForumStats";
import { useForumTopics, TopicFilterType } from "@/hooks/community/useForumTopics";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

const CommunityHome = () => {
  const { topicCount, postCount, activeUserCount, solvedCount, isLoading: statsLoading } = useForumStats();
  const [activeTab, setActiveTab] = useState<"all" | "my-topics">("all");
  const [selectedFilter, setSelectedFilter] = useState<TopicFilterType>("recentes");
  const [searchQuery, setSearchQuery] = useState("");

  const { topics, isLoading: topicsLoading, refetch } = useForumTopics({
    activeTab,
    selectedFilter,
    searchQuery
  });

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR
      });
    } catch {
      return "Data inválida";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-aurora-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-aurora-900 mb-2">
              Comunidade VIA Aurora
            </h1>
            <p className="text-aurora-600">
              Conecte-se, compartilhe conhecimento e construa junto
            </p>
          </div>
          <Button className="bg-aurora-600 hover:bg-aurora-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Novo Tópico
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-aurora-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-aurora-600 text-sm font-medium">Membros Ativos</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-aurora-900">{activeUserCount}</p>
                  )}
                </div>
                <div className="h-12 w-12 bg-aurora-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-aurora-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-aurora-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-aurora-600 text-sm font-medium">Tópicos Ativos</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-aurora-900">{topicCount}</p>
                  )}
                </div>
                <div className="h-12 w-12 bg-aurora-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-aurora-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-aurora-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-aurora-600 text-sm font-medium">Respostas</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-aurora-900">{postCount}</p>
                  )}
                </div>
                <div className="h-12 w-12 bg-aurora-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-aurora-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-aurora-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-aurora-600 text-sm font-medium">Resolvidos</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-aurora-900">{solvedCount}</p>
                  )}
                </div>
                <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Forum Content */}
        <Card className="border-aurora-200">
          <CardHeader className="border-b border-aurora-100">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <CardTitle className="text-xl text-aurora-900">Discussões</CardTitle>
              
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-aurora-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar discussões..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-aurora-200 focus:border-aurora-500"
                  />
                </div>
                
                <Select value={selectedFilter} onValueChange={(value) => setSelectedFilter(value as TopicFilterType)}>
                  <SelectTrigger className="w-full sm:w-48 border-aurora-200">
                    <SelectValue placeholder="Filtrar por..." />
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
          </CardHeader>

          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "all" | "my-topics")}>
              <TabsList className="grid w-full grid-cols-2 bg-aurora-50 border-b border-aurora-100 rounded-none h-12">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-white data-[state=active]:text-aurora-900 data-[state=active]:border-b-2 data-[state=active]:border-aurora-600"
                >
                  Todas as Discussões
                </TabsTrigger>
                <TabsTrigger 
                  value="my-topics" 
                  className="data-[state=active]:bg-white data-[state=active]:text-aurora-900 data-[state=active]:border-b-2 data-[state=active]:border-aurora-600"
                >
                  Minhas Discussões
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0">
                <div className="divide-y divide-aurora-100">
                  {topicsLoading ? (
                    <div className="space-y-4 p-6">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-start space-x-4">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : topics.length > 0 ? (
                    topics.map((topic: any) => (
                      <div key={topic.id} className="p-6 hover:bg-aurora-25 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start space-x-4 flex-1">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={topic.profiles?.avatar_url} />
                              <AvatarFallback className="bg-aurora-100 text-aurora-700">
                                {topic.profiles?.name?.charAt(0) || "?"}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-aurora-900 hover:text-aurora-700 truncate">
                                  {topic.title}
                                </h3>
                                {topic.is_solved && (
                                  <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Resolvido
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-aurora-600 text-sm mb-2 line-clamp-2">
                                {topic.content}
                              </p>
                              
                              <div className="flex items-center gap-4 text-xs text-aurora-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatTimeAgo(topic.created_at)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="h-3 w-3" />
                                  {topic.reply_count || 0} respostas
                                </span>
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {topic.view_count || 0} visualizações
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center">
                      <MessageSquare className="h-12 w-12 text-aurora-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-aurora-900 mb-2">
                        Nenhuma discussão encontrada
                      </h3>
                      <p className="text-aurora-600 mb-4">
                        {searchQuery ? "Tente ajustar sua busca ou criar um novo tópico." : "Seja o primeiro a iniciar uma discussão!"}
                      </p>
                      <Button className="bg-aurora-600 hover:bg-aurora-700 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Primeiro Tópico
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="my-topics" className="mt-0">
                <div className="p-12 text-center">
                  <MessageSquare className="h-12 w-12 text-aurora-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-aurora-900 mb-2">
                    Suas discussões aparecerão aqui
                  </h3>
                  <p className="text-aurora-600 mb-4">
                    Você ainda não criou nenhuma discussão.
                  </p>
                  <Button className="bg-aurora-600 hover:bg-aurora-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Discussão
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommunityHome;
