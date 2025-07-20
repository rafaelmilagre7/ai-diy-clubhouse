
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
    <div className="relative min-h-screen overflow-hidden">
      {/* Background com gradientes avançados */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-aurora-50/40 to-viverblue-50/30"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--aurora-500)_0%,_transparent_50%)] opacity-10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--viverblue-500)_0%,_transparent_50%)] opacity-5"></div>
      
      <div className="relative container mx-auto px-4 py-12 space-y-12">
        
        {/* Hero Section Premium */}
        <div className="text-center space-y-8">
          {/* Glow effect backdrop */}
          <div className="absolute left-1/2 top-20 -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-aurora-500/20 to-viverblue-500/20 rounded-full blur-3xl opacity-30"></div>
          
          <div className="relative">
            {/* Badge de destaque */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-aurora-500/10 via-viverblue-500/10 to-aurora-600/10 rounded-full border border-aurora-200/40 backdrop-blur-sm mb-6">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-aurora-500 to-viverblue-500 animate-pulse"></div>
              <span className="text-sm font-medium bg-gradient-to-r from-aurora-600 to-viverblue-600 bg-clip-text text-transparent">
                Centro de Conhecimento IA
              </span>
            </div>
            
            {/* Título principal */}
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              <span className="block bg-gradient-to-r from-aurora-600 via-viverblue-600 to-aurora-700 bg-clip-text text-transparent">
                Comunidade
              </span>
              <span className="block text-3xl md:text-4xl font-semibold text-aurora-800 mt-2">
                VIVER DE IA
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
              Conecte-se com uma rede exclusiva de profissionais de IA, compartilhe insights valiosos e acelere sua transformação digital.
            </p>
            
            {/* CTA Button */}
            <Link to="/comunidade/novo-topico/geral">
              <Button size="lg" className="group relative bg-gradient-to-r from-aurora-500 to-viverblue-500 hover:from-aurora-600 hover:to-viverblue-600 text-white shadow-2xl hover:shadow-aurora-500/25 transition-all duration-500 px-8 py-4 text-lg font-semibold rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-aurora-400 to-viverblue-400 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                <span className="relative flex items-center gap-3">
                  <Plus className="h-5 w-5" />
                  Iniciar Nova Discussão
                </span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Estatísticas Premium com glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              icon: MessageSquare, 
              value: statsLoading ? "..." : topicCount, 
              label: "Tópicos Ativos",
              gradient: "from-aurora-500/20 to-aurora-600/20",
              glow: "shadow-aurora-500/10"
            },
            { 
              icon: Users, 
              value: statsLoading ? "..." : activeUserCount, 
              label: "Experts Conectados",
              gradient: "from-viverblue-500/20 to-viverblue-600/20",
              glow: "shadow-viverblue-500/10"
            },
            { 
              icon: TrendingUp, 
              value: statsLoading ? "..." : postCount, 
              label: "Casos de Sucesso",
              gradient: "from-aurora-500/20 to-viverblue-500/20",
              glow: "shadow-aurora-500/10"
            }
          ].map((stat, index) => (
            <div key={index} className="group relative">
              {/* Glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} rounded-2xl blur opacity-20 group-hover:opacity-40 transition-all duration-500`}></div>
              
              <Card className={`relative h-full bg-card/60 backdrop-blur-xl border-aurora-200/30 hover:border-aurora-300/50 ${stat.glow} hover:shadow-2xl transition-all duration-500`}>
                <CardContent className="p-8 text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${stat.gradient} mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    <stat.icon className="h-8 w-8 text-aurora-600" />
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-aurora-600 to-viverblue-600 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-base font-medium text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Layout Principal sem sidebar extra */}
        <div className="max-w-6xl mx-auto">
          <Card className="relative bg-card/60 backdrop-blur-xl border-aurora-200/30 overflow-hidden">
            {/* Header premium */}
            <div className="relative bg-gradient-to-r from-aurora-500/5 via-viverblue-500/5 to-aurora-600/5 border-b border-aurora-200/20">
              <div className="absolute inset-0 bg-gradient-to-r from-aurora-500/10 to-viverblue-500/10 opacity-50"></div>
              <CardHeader className="relative">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-aurora-600 to-viverblue-600 bg-clip-text text-transparent">
                      Discussões da Comunidade
                    </CardTitle>
                    <CardDescription className="text-base">
                      Participe das conversas mais relevantes do mercado de IA
                    </CardDescription>
                  </div>
                  <Link to="/comunidade/novo-topico/geral">
                    <Button size="lg" className="group bg-gradient-to-r from-aurora-500 to-viverblue-500 hover:from-aurora-600 hover:to-viverblue-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-6 py-3 rounded-xl">
                      <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                      <span className="font-semibold">Novo Tópico</span>
                    </Button>
                  </Link>
                </div>
              </CardHeader>
            </div>
            
            <CardContent className="p-8">
              {/* Controles aprimorados */}
              <div className="space-y-6 mb-8">
                {/* Busca premium */}
                <div className="relative max-w-2xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-aurora-500/20 to-viverblue-500/20 rounded-xl blur opacity-30"></div>
                  <div className="relative bg-background/80 backdrop-blur-sm rounded-xl border border-aurora-200/50 p-1">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-aurora-500 h-5 w-5" />
                      <Input
                        placeholder="Buscar discussões, tópicos, especialistas..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 pr-4 py-3 text-lg bg-transparent border-0 focus:ring-2 focus:ring-aurora-400/20 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Filtros modernos */}
                <div className="flex flex-wrap gap-3">
                  {filters.map((filter) => (
                    <Button
                      key={filter.key}
                      variant={selectedFilter === filter.key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFilter(filter.key)}
                      className={`group transition-all duration-300 ${
                        selectedFilter === filter.key 
                          ? "bg-gradient-to-r from-aurora-500 to-viverblue-500 text-white shadow-lg hover:shadow-xl border-0" 
                          : "border-aurora-200/50 text-aurora-700 hover:bg-aurora-50/50 hover:border-aurora-300/50 hover:shadow-md"
                      }`}
                    >
                      <filter.icon className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                      <span className="font-medium">{filter.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Tabs refinadas */}
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "all" | "my-topics")}>
                <TabsList className="bg-aurora-50/50 border border-aurora-200/30 p-1 rounded-xl backdrop-blur-sm">
                  <TabsTrigger 
                    value="all" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-aurora-500 data-[state=active]:to-viverblue-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg px-6 py-2 font-medium"
                  >
                    Todos os Tópicos
                  </TabsTrigger>
                  <TabsTrigger 
                    value="my-topics" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-aurora-500 data-[state=active]:to-viverblue-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg px-6 py-2 font-medium"
                  >
                    Meus Tópicos
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-8">
                  {topicsLoading ? (
                    <div className="text-center py-16">
                      <div className="relative mx-auto w-12 h-12 mb-6">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-aurora-500 to-viverblue-500 opacity-20"></div>
                        <div className="animate-spin w-12 h-12 border-2 border-transparent border-t-aurora-500 border-r-viverblue-500 rounded-full"></div>
                      </div>
                      <p className="text-lg text-muted-foreground">Carregando discussões da comunidade...</p>
                    </div>
                  ) : topics.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="relative mx-auto w-24 h-24 mb-6">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-aurora-500/20 to-viverblue-500/20"></div>
                        <MessageSquare className="w-24 h-24 text-aurora-300 mx-auto" />
                      </div>
                      <h3 className="text-xl font-semibold text-aurora-700 mb-2">Nenhuma discussão encontrada</h3>
                      <p className="text-muted-foreground mb-6">Seja o primeiro a iniciar uma conversa!</p>
                      <Link to="/comunidade/novo-topico/geral">
                        <Button className="bg-gradient-to-r from-aurora-500 to-viverblue-500 text-white">
                          <Plus className="h-4 w-4 mr-2" />
                          Criar Primeiro Tópico
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {topics.map((topic, index) => (
                        <Link key={topic.id} to={`/comunidade/topico/${topic.id}`}>
                          <div className="group relative animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                            {/* Glow effect hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-aurora-500/10 to-viverblue-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            <Card className="relative bg-card/80 backdrop-blur-sm border-aurora-200/30 hover:border-aurora-300/50 hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden">
                              {/* Header gradient */}
                              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-aurora-500 via-viverblue-500 to-aurora-600"></div>
                              
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 space-y-3">
                                    <h3 className="text-xl font-bold text-aurora-800 group-hover:text-aurora-600 transition-colors line-clamp-2">
                                      {topic.title}
                                    </h3>
                                    <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                                      {topic.content}
                                    </p>
                                    
                                    {/* Metadata com design premium */}
                                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                      <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-aurora-400 to-viverblue-400 flex items-center justify-center text-white text-xs font-semibold">
                                          {(topic.profiles?.name || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-medium">{topic.profiles?.name || 'Usuário'}</span>
                                      </div>
                                      
                                      <div className="flex items-center gap-1">
                                        <MessageSquare className="h-4 w-4 text-aurora-500" />
                                        <span>{topic.reply_count || 0} respostas</span>
                                      </div>
                                      
                                      <span>{new Date(topic.created_at).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                  </div>
                                  
                                  {/* Badges laterais */}
                                  <div className="flex flex-col items-end gap-3">
                                    {topic.is_solved && (
                                      <Badge className="bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-700 border-green-300/50 font-medium px-3 py-1">
                                        ✓ Resolvido
                                      </Badge>
                                    )}
                                    <Badge className="bg-gradient-to-r from-aurora-500/20 to-viverblue-500/20 text-aurora-700 border-aurora-300/50 font-medium px-3 py-1">
                                      {topic.view_count || 0} visualizações
                                    </Badge>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="my-topics" className="mt-8">
                  <div className="text-center py-16">
                    <div className="relative mx-auto w-24 h-24 mb-6">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-aurora-500/20 to-viverblue-500/20"></div>
                      <MessageSquare className="w-24 h-24 text-aurora-300 mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-aurora-700 mb-2">Seus tópicos aparecerão aqui</h3>
                    <p className="text-muted-foreground mb-6">Comece compartilhando seu conhecimento com a comunidade</p>
                    <Link to="/comunidade/novo-topico/geral">
                      <Button className="bg-gradient-to-r from-aurora-500 to-viverblue-500 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Meu Primeiro Tópico
                      </Button>
                    </Link>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CommunityHome;
