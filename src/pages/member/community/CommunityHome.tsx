
import React, { useState } from "react";
import { ForumLayout } from "@/components/community/ForumLayout";
import { CategoryList } from "@/components/community/CategoryList";
import { ForumSearch } from "@/components/community/ForumSearch";
import { CreateTopicDialog } from "@/components/community/CreateTopicDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, BarChart, MessageSquare, Users, CheckCircle2 } from "lucide-react";
import { useForumTopics } from "@/hooks/community/useForumTopics";
import { useForumStats } from "@/hooks/useForumStats";

export const CommunityHome = () => {
  const [activeTab, setActiveTab] = useState<"all" | "my-topics">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"recentes" | "populares" | "sem-respostas" | "resolvidos">("recentes");
  const [isCreateTopicOpen, setIsCreateTopicOpen] = useState(false);

  const { topics, isLoading } = useForumTopics({
    activeTab,
    selectedFilter,
    searchQuery
  });

  const { topicCount, postCount, activeUserCount, solvedCount, isLoading: statsLoading } = useForumStats();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Aurora Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-secondary rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <ForumLayout
        sidebar={
          <div className="space-y-4">
            <Button 
              onClick={() => setIsCreateTopicOpen(true)}
              className="w-full"
              size="lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Tópico
            </Button>
            <CategoryList />
          </div>
        }
      >
        <div className="space-y-6 relative z-10">
          {/* Beautiful Header with Gradient */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg"></div>
                  <div className="relative bg-card/80 backdrop-blur-sm border border-primary/20 rounded-xl p-3">
                    <MessageSquare className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    Comunidade
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Conecte-se, aprenda e compartilhe conhecimento
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Beautiful Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
                  <div className="relative p-6">
                    <Skeleton className="h-12 w-12 rounded-xl mb-4" />
                    <Skeleton className="h-8 w-20 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </Card>
              ))
            ) : (
              <>
                <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-primary/20">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300"></div>
                  <div className="relative p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-xl blur-md group-hover:blur-lg transition-all duration-300"></div>
                        <div className="relative bg-primary/10 rounded-xl p-3 group-hover:bg-primary/20 transition-all duration-300">
                          <MessageSquare className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                      <BarChart className="h-5 w-5 text-primary/60" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                        {topicCount}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Tópicos Ativos
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-accent/20">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent/5 group-hover:from-accent/20 group-hover:to-accent/10 transition-all duration-300"></div>
                  <div className="relative p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-accent/20 rounded-xl blur-md group-hover:blur-lg transition-all duration-300"></div>
                        <div className="relative bg-accent/10 rounded-xl p-3 group-hover:bg-accent/20 transition-all duration-300">
                          <Users className="h-8 w-8 text-accent" />
                        </div>
                      </div>
                      <BarChart className="h-5 w-5 text-accent/60" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-3xl font-bold text-foreground group-hover:text-accent transition-colors duration-300">
                        {activeUserCount}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Membros Ativos
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-green-500/20">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-green-500/5 group-hover:from-green-500/20 group-hover:to-green-500/10 transition-all duration-300"></div>
                  <div className="relative p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-green-500/20 rounded-xl blur-md group-hover:blur-lg transition-all duration-300"></div>
                        <div className="relative bg-green-500/10 rounded-xl p-3 group-hover:bg-green-500/20 transition-all duration-300">
                          <CheckCircle2 className="h-8 w-8 text-green-500" />
                        </div>
                      </div>
                      <BarChart className="h-5 w-5 text-green-500/60" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-3xl font-bold text-foreground group-hover:text-green-500 transition-colors duration-300">
                        {solvedCount}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Tópicos Resolvidos
                      </p>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </div>

          <ForumSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
          />

          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-muted-foreground mt-2">Carregando tópicos...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topics && topics.length > 0 ? (
                  topics.map((topic: any) => (
                    <div key={topic.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <h3 className="font-medium text-lg">{topic.title}</h3>
                      <p className="text-muted-foreground text-sm mt-1">{topic.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Por {topic.profiles?.name || 'Usuário'}</span>
                        <span>{topic.reply_count || 0} respostas</span>
                        <span>{topic.view_count || 0} visualizações</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Nenhum tópico encontrado</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <CreateTopicDialog
            open={isCreateTopicOpen}
            onOpenChange={setIsCreateTopicOpen}
          />
        </div>
      </ForumLayout>
    </div>
  );
};

export default CommunityHome;
