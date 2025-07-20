
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      <div className="container mx-auto py-8 space-y-8">
        
        {/* Header com VIA Aurora Style - seguindo padrão das outras páginas */}
        <div className="relative overflow-hidden rounded-2xl bg-card/95 backdrop-blur-xl border border-border/30 p-8 shadow-2xl shadow-primary/5">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
          <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                Comunidade
              </h1>
              <p className="text-lg text-muted-foreground/80 max-w-2xl">
                Conecte-se com outros profissionais, compartilhe experiências e acelere sua jornada com IA
              </p>
            </div>

            {/* Search seguindo padrão das outras páginas */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 group-focus-within:opacity-100 transition duration-300"></div>
              <div className="relative bg-card/90 backdrop-blur-sm border border-border/40 rounded-xl p-1 shadow-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                  <Input
                    type="search"
                    placeholder="Buscar discussões..."
                    className="w-80 pl-10 bg-background/50 border-border/30 focus:border-primary/50 focus:bg-background/70 transition-all duration-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas seguindo padrão do dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative overflow-hidden rounded-2xl bg-card/95 backdrop-blur-xl border border-border/30 p-6 shadow-xl shadow-primary/5">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
            <div className="relative text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">
                  {statsLoading ? "..." : topicCount}
                </div>
                <div className="text-sm text-muted-foreground">Tópicos Ativos</div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-card/95 backdrop-blur-xl border border-border/30 p-6 shadow-xl shadow-primary/5">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
            <div className="relative text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">
                  {statsLoading ? "..." : activeUserCount}
                </div>
                <div className="text-sm text-muted-foreground">Membros Ativos</div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-card/95 backdrop-blur-xl border border-border/30 p-6 shadow-xl shadow-primary/5">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
            <div className="relative text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">
                  {statsLoading ? "..." : postCount}
                </div>
                <div className="text-sm text-muted-foreground">Discussões</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros seguindo padrão das outras páginas */}
        <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as "all" | "my-topics")} className="w-full">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-500"></div>
            
            <div className="relative bg-card/80 backdrop-blur-xl border border-border/30 rounded-2xl p-2 shadow-2xl shadow-primary/10">
              <TabsList className="bg-transparent p-0 h-auto w-full flex gap-2">
                <TabsTrigger 
                  value="all"
                  className="relative flex-1 px-6 py-4 text-sm font-medium transition-all duration-300 rounded-xl group
                           data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 
                           data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30
                           data-[state=active]:scale-105 data-[state=active]:border-0
                           hover:bg-muted/50 hover:scale-102 hover:text-foreground hover:shadow-md
                           text-muted-foreground border border-transparent"
                >
                  <span className="relative z-10">Todos os Tópicos</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="my-topics"
                  className="relative flex-1 px-6 py-4 text-sm font-medium transition-all duration-300 rounded-xl group
                           data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 
                           data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30
                           data-[state=active]:scale-105 data-[state=active]:border-0
                           hover:bg-muted/50 hover:scale-102 hover:text-foreground hover:shadow-md
                           text-muted-foreground border border-transparent"
                >
                  <span className="relative z-10">Meus Tópicos</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Filtros adicionais */}
          <div className="mt-6 flex flex-wrap gap-3">
            {filters.map((filter) => (
              <Button
                key={filter.key}
                variant={selectedFilter === filter.key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter(filter.key)}
                className={`transition-all duration-300 ${
                  selectedFilter === filter.key 
                    ? "bg-primary text-primary-foreground shadow-lg hover:shadow-xl" 
                    : "border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:border-border/80"
                }`}
              >
                <filter.icon className="h-4 w-4 mr-2" />
                <span className="font-medium">{filter.label}</span>
              </Button>
            ))}
          </div>

          {/* Conteúdo principal */}
          <TabsContent value="all" className="mt-8">
            <div className="relative overflow-hidden rounded-2xl bg-card/95 backdrop-blur-xl border border-border/30 shadow-xl shadow-primary/5">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
              
              <div className="relative p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-heading font-semibold text-foreground">Discussões da Comunidade</h2>
                    <p className="text-muted-foreground/80">Participe das conversas mais relevantes</p>
                  </div>
                  <Link to="/comunidade/novo-topico/geral">
                    <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300">
                      <Plus className="h-4 w-4 mr-2" />
                      <span className="font-semibold">Novo Tópico</span>
                    </Button>
                  </Link>
                </div>

                {topicsLoading ? (
                  <div className="text-center py-16">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Carregando discussões...</p>
                  </div>
                ) : topics.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="relative mx-auto w-16 h-16 mb-6">
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
                      <div className="relative p-3 bg-card border border-border rounded-2xl">
                        <MessageSquare className="w-10 h-10 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Nenhuma discussão encontrada</h3>
                    <p className="text-muted-foreground mb-6">Seja o primeiro a iniciar uma conversa!</p>
                    <Link to="/comunidade/novo-topico/geral">
                      <Button className="bg-primary text-primary-foreground">
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Primeiro Tópico
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topics.map((topic, index) => (
                      <Link key={topic.id} to={`/comunidade/topico/${topic.id}`}>
                        <div 
                          className="group relative animate-fade-in"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="relative overflow-hidden rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 hover:border-border transition-all duration-300 cursor-pointer p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-3">
                                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                                  {topic.title}
                                </h3>
                                <p className="text-muted-foreground line-clamp-2">
                                  {topic.content}
                                </p>
                                
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                      <span className="text-xs font-medium text-primary">
                                        {(topic.profiles?.name || 'U').charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <span>{topic.profiles?.name || 'Usuário'}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-1">
                                    <MessageSquare className="h-4 w-4" />
                                    <span>{topic.reply_count || 0} respostas</span>
                                  </div>
                                  
                                  <span>{new Date(topic.created_at).toLocaleDateString('pt-BR')}</span>
                                </div>
                              </div>
                              
                              <div className="flex flex-col items-end gap-2">
                                {topic.is_solved && (
                                  <Badge className="bg-green-500/20 text-green-700 border-green-300/50">
                                    ✓ Resolvido
                                  </Badge>
                                )}
                                <Badge variant="secondary" className="bg-muted text-muted-foreground">
                                  {topic.view_count || 0} visualizações
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="my-topics" className="mt-8">
            <div className="relative overflow-hidden rounded-2xl bg-card/95 backdrop-blur-xl border border-border/30 shadow-xl shadow-primary/5">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
              
              <div className="relative p-16 text-center">
                <div className="relative mx-auto w-16 h-16 mb-6">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
                  <div className="relative p-3 bg-card border border-border rounded-2xl">
                    <MessageSquare className="w-10 h-10 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Seus tópicos aparecerão aqui</h3>
                <p className="text-muted-foreground mb-6">Comece compartilhando seu conhecimento com a comunidade</p>
                <Link to="/comunidade/novo-topico/geral">
                  <Button className="bg-primary text-primary-foreground">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Meu Primeiro Tópico
                  </Button>
                </Link>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CommunityHome;
