
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ForumLayout } from "@/components/community/ForumLayout";
import { ForumSearch } from "@/components/community/ForumSearch";
import { ForumSidebar } from "@/components/community/ForumSidebar";
import { useForumTopics } from "@/hooks/community/useForumTopics";
import { useForumStats } from "@/hooks/useForumStats";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, 
  MessageSquare, 
  Users, 
  TrendingUp,
  PlusCircle,
  Pin,
  Lock,
  Eye,
  Clock,
  Sparkles
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getInitials } from "@/utils/user";

export const CommunityHome = () => {
  const [activeTab, setActiveTab] = useState<"all" | "my-topics">("all");
  const [selectedFilter, setSelectedFilter] = useState<"recentes" | "populares" | "sem-respostas" | "resolvidos">("recentes");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { topics, isLoading } = useForumTopics({
    activeTab,
    selectedFilter,
    searchQuery
  });
  
  const { topicCount, postCount, activeUserCount, isLoading: statsLoading } = useForumStats();

  const renderTopicSkeletons = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="p-6 animate-pulse bg-card/40 backdrop-blur-sm border border-border/30">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-muted/60"></div>
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-muted/60 rounded-md w-3/4"></div>
              <div className="h-4 bg-muted/60 rounded-md w-full"></div>
              <div className="h-4 bg-muted/60 rounded-md w-1/2"></div>
              <div className="flex gap-4 mt-4">
                <div className="h-4 w-16 bg-muted/60 rounded-md"></div>
                <div className="h-4 w-16 bg-muted/60 rounded-md"></div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <Card className="p-12 text-center bg-card/40 backdrop-blur-sm border border-border/30">
      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 rounded-full blur-xl opacity-50"></div>
        <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-6 relative" />
      </div>
      <h3 className="text-xl font-semibold mb-3 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
        {searchQuery ? "Nenhum tópico encontrado" : "Nenhuma discussão iniciada ainda"}
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {searchQuery 
          ? "Tente usar termos diferentes na sua busca ou explore outras categorias." 
          : "Seja o primeiro a iniciar uma discussão interessante na nossa comunidade."
        }
      </p>
      <Button asChild className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
        <Link to="/comunidade/novo-topico">
          <PlusCircle className="h-4 w-4 mr-2" />
          Criar Primeiro Tópico
        </Link>
      </Button>
    </Card>
  );

  const renderTopicCard = (topic: any) => (
    <div key={topic.id} className="group relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <Card className="relative p-6 bg-card/60 backdrop-blur-sm border border-border/40 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
        <Link to={`/comunidade/topico/${topic.id}`} className="block">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
                <AvatarImage src={topic.profiles?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-medium">
                  {getInitials(topic.profiles?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-card animate-pulse"></div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2 flex-wrap">
                <span className="font-medium truncate text-foreground">
                  {topic.profiles?.name || "Usuário"}
                </span>
                
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatDistanceToNow(new Date(topic.created_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </span>
                </div>
                
                {topic.category && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 transition-colors">
                    {topic.category.name}
                  </Badge>
                )}
              </div>
              
              <h3 className="text-lg font-semibold mb-2 line-clamp-1 group-hover:text-primary transition-colors duration-300">
                <div className="flex items-center gap-2">
                  {topic.is_pinned && <Pin className="h-4 w-4 text-primary flex-shrink-0" />}
                  {topic.is_locked && <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                  <span className="truncate">{topic.title}</span>
                </div>
              </h3>
              
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
                {topic.content ? topic.content.replace(/<[^>]*>/g, '').substring(0, 120) + "..." : ""}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1 hover:text-primary transition-colors">
                    <MessageSquare className="h-4 w-4" />
                    <span>{topic.reply_count || 0}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 hover:text-primary transition-colors">
                    <Eye className="h-4 w-4" />
                    <span>{topic.view_count || 0}</span>
                  </div>
                </div>
                
                {topic.is_solved && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Resolvido
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Link>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Aurora Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2s"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4s"></div>
      </div>

      <ForumLayout
        sidebar={<ForumSidebar />}
      >
        <div className="space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 rounded-2xl blur-xl opacity-50"></div>
              <div className="relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-md"></div>
                    <MessageSquare className="h-8 w-8 text-primary relative" />
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
                    Comunidade VIA
                  </h1>
                </div>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Conecte-se, compartilhe conhecimento e cresça junto com nossa comunidade de empreendedores
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tópicos */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/40 to-primary/20 rounded-2xl blur opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Card className="relative p-6 bg-card/80 backdrop-blur-sm border border-primary/30 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Tópicos Ativos</p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <p className="text-3xl font-bold text-primary">{topicCount}</p>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-md"></div>
                    <BarChart className="h-8 w-8 text-primary relative" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Respostas */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-secondary/40 to-secondary/20 rounded-2xl blur opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Card className="relative p-6 bg-card/80 backdrop-blur-sm border border-secondary/30 hover:border-secondary/50 transition-all duration-300 hover:shadow-xl hover:shadow-secondary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Respostas</p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <p className="text-3xl font-bold text-secondary">{postCount}</p>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-secondary/20 rounded-full blur-md"></div>
                    <MessageSquare className="h-8 w-8 text-secondary relative" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Membros */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/40 to-accent/20 rounded-2xl blur opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Card className="relative p-6 bg-card/80 backdrop-blur-sm border border-accent/30 hover:border-accent/50 transition-all duration-300 hover:shadow-xl hover:shadow-accent/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Membros Ativos</p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <p className="text-3xl font-bold text-accent-foreground">{activeUserCount}</p>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-accent/20 rounded-full blur-md"></div>
                    <Users className="h-8 w-8 text-accent-foreground relative" />
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Search and Filters */}
          <ForumSearch
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {/* Topics List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Últimas Discussões
              </h2>
              <Button asChild className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                <Link to="/comunidade/novo-topico">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Novo Tópico
                </Link>
              </Button>
            </div>

            {isLoading ? (
              renderTopicSkeletons()
            ) : topics.length === 0 ? (
              renderEmptyState()
            ) : (
              <div className="space-y-4">
                {topics.map(renderTopicCard)}
              </div>
            )}
          </div>
        </div>
      </ForumLayout>
    </div>
  );
};
