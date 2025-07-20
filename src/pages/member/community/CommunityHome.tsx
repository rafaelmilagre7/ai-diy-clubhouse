
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ForumSearch } from "@/components/community/ForumSearch";
import { useForumTopics, TopicFilterType } from "@/hooks/community/useForumTopics";
import { useForumStats } from "@/hooks/useForumStats";
import { 
  MessageSquare, 
  Users, 
  TrendingUp, 
  CheckCircle2,
  Clock,
  Eye,
  MessageCircle,
  PlusCircle,
  Pin
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const CommunityHome = () => {
  const [activeTab, setActiveTab] = useState<"all" | "my-topics">("all");
  const [selectedFilter, setSelectedFilter] = useState<TopicFilterType>("recentes");
  const [searchQuery, setSearchQuery] = useState("");

  const { topics, isLoading: topicsLoading } = useForumTopics({
    activeTab,
    selectedFilter,
    searchQuery
  });

  const { 
    topicCount, 
    postCount, 
    activeUserCount, 
    solvedCount, 
    isLoading: statsLoading 
  } = useForumStats();

  const formatDate = (date: string) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true, 
      locale: ptBR 
    });
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    gradient,
    isLoading 
  }: {
    title: string;
    value: number;
    icon: React.ComponentType<any>;
    gradient: string;
    isLoading: boolean;
  }) => (
    <div className="relative group">
      <div className={`absolute -inset-0.5 ${gradient} rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300`}></div>
      <Card className="relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:bg-card/80 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold">{value.toLocaleString()}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient.replace('bg-gradient-to-r', '')}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </Card>
    </div>
  );

  const TopicCard = ({ topic }: { topic: any }) => (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300"></div>
      <Card className="relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-4 hover:bg-card/80 transition-all duration-300">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {topic.is_pinned && (
                <Pin className="h-4 w-4 text-primary flex-shrink-0" />
              )}
              <Link 
                to={`/comunidade/topico/${topic.id}`}
                className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2 break-words"
              >
                {topic.title}
              </Link>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{topic.view_count || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                <span>{topic.reply_count || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatDate(topic.created_at)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center">
                  <span className="text-xs font-medium">
                    {topic.profiles?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {topic.profiles?.name || 'Usuário'}
                </span>
              </div>
              
              {topic.is_solved && (
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Resolvido
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const TopicSkeleton = () => (
    <Card className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-4">
      <div className="space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
    </Card>
  );

  const EmptyState = () => (
    <div className="relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur opacity-30"></div>
      <Card className="relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Nenhum tópico encontrado</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery 
              ? "Tente ajustar seus filtros de busca ou criar um novo tópico."
              : "Seja o primeiro a iniciar uma discussão na comunidade!"
            }
          </p>
          <Button asChild className="bg-gradient-to-r from-primary to-accent text-white border-0">
            <Link to="/comunidade/novo-topico">
              <PlusCircle className="h-4 w-4 mr-2" />
              Criar Tópico
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="relative mb-8">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur opacity-30"></div>
          <div className="relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Comunidade VIA Aurora
                </h1>
                <p className="text-muted-foreground mt-2">
                  Conecte-se, compartilhe conhecimento e cresça junto com nossa comunidade
                </p>
              </div>
              <Button asChild className="bg-gradient-to-r from-primary to-accent text-white border-0">
                <Link to="/comunidade/novo-topico">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Novo Tópico
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Tópicos"
            value={topicCount}
            icon={MessageSquare}
            gradient="bg-gradient-to-r from-blue-500 to-cyan-500"
            isLoading={statsLoading}
          />
          <StatCard
            title="Discussões"
            value={postCount}
            icon={MessageCircle}
            gradient="bg-gradient-to-r from-green-500 to-emerald-500"
            isLoading={statsLoading}
          />
          <StatCard
            title="Membros Ativos"
            value={activeUserCount}
            icon={Users}
            gradient="bg-gradient-to-r from-purple-500 to-pink-500"
            isLoading={statsLoading}
          />
          <StatCard
            title="Resolvidos"
            value={solvedCount}
            icon={CheckCircle2}
            gradient="bg-gradient-to-r from-orange-500 to-red-500"
            isLoading={statsLoading}
          />
        </div>

        {/* Content */}
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur opacity-30"></div>
          <div className="relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden">
            <div className="p-1 bg-gradient-to-r from-primary/10 via-transparent to-accent/10">
              <div className="bg-card/80 backdrop-blur-sm rounded-xl p-6">
                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                  <Button
                    variant={activeTab === "all" ? "default" : "outline"}
                    onClick={() => setActiveTab("all")}
                    className={activeTab === "all" ? "bg-gradient-to-r from-primary to-accent text-white border-0" : ""}
                  >
                    Todos os Tópicos
                  </Button>
                  <Button
                    variant={activeTab === "my-topics" ? "default" : "outline"}
                    onClick={() => setActiveTab("my-topics")}
                    className={activeTab === "my-topics" ? "bg-gradient-to-r from-primary to-accent text-white border-0" : ""}
                  >
                    Meus Tópicos
                  </Button>
                </div>

                {/* Search and Filters */}
                <ForumSearch
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedFilter={selectedFilter}
                  setSelectedFilter={setSelectedFilter}
                />

                {/* Topics List */}
                <div className="space-y-4">
                  {topicsLoading ? (
                    <>
                      {[...Array(5)].map((_, i) => (
                        <TopicSkeleton key={i} />
                      ))}
                    </>
                  ) : topics.length === 0 ? (
                    <EmptyState />
                  ) : (
                    topics.map((topic) => (
                      <TopicCard key={topic.id} topic={topic} />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
