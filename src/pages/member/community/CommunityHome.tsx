
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Users, TrendingUp, Search, Plus, Filter } from 'lucide-react';
import { useForumTopics } from '@/hooks/community/useForumTopics';
import { useForumStats } from '@/hooks/community/useForumStats';
import { Link } from 'react-router-dom';

const CommunityHome = () => {
  const [activeTab, setActiveTab] = useState<"all" | "my-topics">("all");
  const [selectedFilter, setSelectedFilter] = useState<"recentes" | "populares" | "sem-respostas" | "resolvidos">("recentes");
  const [searchQuery, setSearchQuery] = useState("");

  // Usar o hook com os parâmetros necessários
  const { topics, isLoading: topicsLoading } = useForumTopics({
    activeTab,
    selectedFilter,
    searchQuery
  });
  
  const { topicCount, postCount, activeUserCount, isLoading: statsLoading } = useForumStats();

  const filters = [
    { key: "recentes" as const, label: "Recentes", icon: TrendingUp },
    { key: "populares" as const, label: "Populares", icon: Users },
    { key: "sem-respostas" as const, label: "Sem Respostas", icon: MessageSquare },
    { key: "resolvidos" as const, label: "Resolvidos", icon: Plus }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-aurora-50/30 to-aurora-100/20">
      <div className="container mx-auto px-4 py-8 space-y-8">
        
        {/* Header da Comunidade */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-aurora-500/10 via-aurora-400/10 to-aurora-600/10 rounded-full border border-aurora-200/30">
            <MessageSquare className="h-6 w-6 text-aurora-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-aurora-600 via-aurora-700 to-aurora-800 bg-clip-text text-transparent">
              Comunidade VIVER DE IA
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Conecte-se com outros profissionais, compartilhe experiências e acelere sua jornada com Inteligência Artificial.
          </p>
        </div>

        {/* Estatísticas da Comunidade */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="group hover:shadow-lg transition-all duration-300 border-aurora-200/30 hover:border-aurora-300/50 bg-gradient-to-br from-background to-aurora-50/20">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-aurora-500/20 to-aurora-600/20 mb-4 group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="h-6 w-6 text-aurora-600" />
              </div>
              <div className="text-2xl font-bold text-aurora-700 mb-1">
                {statsLoading ? "..." : topicCount}
              </div>
              <div className="text-sm text-muted-foreground">Tópicos Ativos</div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-aurora-200/30 hover:border-aurora-300/50 bg-gradient-to-br from-background to-aurora-50/20">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-aurora-500/20 to-aurora-600/20 mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6 text-aurora-600" />
              </div>
              <div className="text-2xl font-bold text-aurora-700 mb-1">
                {statsLoading ? "..." : activeUserCount}
              </div>
              <div className="text-sm text-muted-foreground">Membros Ativos</div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-aurora-200/30 hover:border-aurora-300/50 bg-gradient-to-br from-background to-aurora-50/20">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-aurora-500/20 to-aurora-600/20 mb-4 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-6 w-6 text-aurora-600" />
              </div>
              <div className="text-2xl font-bold text-aurora-700 mb-1">
                {statsLoading ? "..." : postCount}
              </div>
              <div className="text-sm text-muted-foreground">Discussões</div>
            </CardContent>
          </Card>
        </div>

        {/* Conteúdo Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Área de Tópicos */}
          <div className="lg:col-span-3">
            <Card className="border-aurora-200/30 bg-gradient-to-br from-background to-aurora-50/10">
              <CardHeader className="border-b border-aurora-200/20">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-aurora-800">Discussões da Comunidade</CardTitle>
                    <CardDescription>Participe das conversas e compartilhe conhecimento</CardDescription>
                  </div>
                  <Link to="/comunidade/novo-topico/geral">
                    <Button className="bg-gradient-to-r from-aurora-500 to-aurora-600 hover:from-aurora-600 hover:to-aurora-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Tópico
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                {/* Busca e Filtros */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar discussões..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-aurora-200/50 focus:border-aurora-400 focus:ring-aurora-400/20"
                    />
                  </div>
                  <div className="flex gap-2">
                    {filters.map((filter) => (
                      <Button
                        key={filter.key}
                        variant={selectedFilter === filter.key ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedFilter(filter.key)}
                        className={selectedFilter === filter.key 
                          ? "bg-gradient-to-r from-aurora-500 to-aurora-600 text-white" 
                          : "border-aurora-200 text-aurora-700 hover:bg-aurora-50"
                        }
                      >
                        <filter.icon className="h-4 w-4 mr-1" />
                        {filter.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "all" | "my-topics")}>
                  <TabsList className="bg-aurora-50 border-aurora-200/50">
                    <TabsTrigger value="all" className="data-[state=active]:bg-aurora-500 data-[state=active]:text-white">
                      Todos os Tópicos
                    </TabsTrigger>
                    <TabsTrigger value="my-topics" className="data-[state=active]:bg-aurora-500 data-[state=active]:text-white">
                      Meus Tópicos
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="mt-6">
                    {topicsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin w-8 h-8 border-2 border-aurora-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Carregando discussões...</p>
                      </div>
                    ) : topics.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="w-16 h-16 text-aurora-300 mx-auto mb-4" />
                        <p className="text-muted-foreground">Nenhuma discussão encontrada.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {topics.map((topic) => (
                          <Link key={topic.id} to={`/comunidade/topico/${topic.id}`}>
                            <Card className="group hover:shadow-md transition-all duration-300 border-aurora-200/30 hover:border-aurora-300/50 cursor-pointer">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-aurora-800 group-hover:text-aurora-600 transition-colors mb-2">
                                      {topic.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                      {topic.content}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        {topic.profiles?.name || 'Usuário'}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <MessageSquare className="h-3 w-3" />
                                        {topic.reply_count || 0} respostas
                                      </span>
                                      <span>{new Date(topic.created_at).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-2">
                                    {topic.is_solved && (
                                      <Badge className="bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-700 border-green-300/50">
                                        Resolvido
                                      </Badge>
                                    )}
                                    <Badge className="bg-gradient-to-r from-aurora-500/20 to-aurora-600/20 text-aurora-700 border-aurora-300/50">
                                      {topic.view_count || 0} visualizações
                                    </Badge>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="my-topics" className="mt-6">
                    <div className="text-center py-8">
                      <MessageSquare className="w-16 h-16 text-aurora-300 mx-auto mb-4" />
                      <p className="text-muted-foreground">Seus tópicos aparecerão aqui.</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Categorias Populares */}
            <Card className="border-aurora-200/30 bg-gradient-to-br from-background to-aurora-50/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-aurora-800">Categorias Populares</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { name: "Implementação de IA", count: 12, color: "aurora" },
                  { name: "Ferramentas", count: 8, color: "blue" },
                  { name: "Estratégia", count: 6, color: "green" },
                  { name: "Automação", count: 4, color: "purple" }
                ].map((category) => (
                  <Link key={category.name} to={`/comunidade/categoria/${category.name.toLowerCase()}`}>
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-aurora-50/50 transition-colors cursor-pointer group">
                      <span className="text-sm text-aurora-700 group-hover:text-aurora-600">{category.name}</span>
                      <Badge variant="secondary" className="text-xs bg-aurora-100 text-aurora-600">
                        {category.count}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* Membros Ativos */}
            <Card className="border-aurora-200/30 bg-gradient-to-br from-background to-aurora-50/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-aurora-800">Membros Ativos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3].map((member) => (
                  <div key={member} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-aurora-400 to-aurora-500 flex items-center justify-center text-white text-sm font-semibold">
                      M{member}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-aurora-700">Membro {member}</div>
                      <div className="text-xs text-muted-foreground">Online agora</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityHome;
