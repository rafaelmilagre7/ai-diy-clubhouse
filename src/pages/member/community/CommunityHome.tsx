
import { ForumHeader } from "@/components/community/ForumHeader";
import { ForumLayout } from "@/components/community/ForumLayout";
import { ForumStatistics } from "@/components/community/ForumStatistics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useForumStats } from "@/hooks/useForumStats";
import { useForumTopics } from "@/hooks/useForumTopics";
import { PlusCircle, MessageSquare, Users, TrendingUp, Clock, Pin } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const CommunityHome = () => {
  const [showNewTopicDialog, setShowNewTopicDialog] = useState(false);
  const { topicCount, postCount, activeUserCount, solvedCount } = useForumStats();
  const { data: topics = [], isLoading } = useForumTopics();

  const handleNewTopicClick = () => {
    setShowNewTopicDialog(true);
  };

  const sidebar = (
    <div className="space-y-6">
      {/* Estatísticas Rápidas */}
      <Card className="bg-gradient-to-br from-aurora/10 to-aurora-light/5 border-aurora/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-aurora" />
            Estatísticas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Tópicos</span>
            <Badge variant="secondary" className="bg-aurora/10 text-aurora border-aurora/20">
              {topicCount}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Posts</span>
            <Badge variant="secondary" className="bg-aurora/10 text-aurora border-aurora/20">
              {postCount}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Usuários Ativos</span>
            <Badge variant="secondary" className="bg-aurora/10 text-aurora border-aurora/20">
              {activeUserCount}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Resolvidos</span>
            <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
              {solvedCount}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={handleNewTopicClick}
            className="w-full bg-gradient-to-r from-aurora to-aurora-light hover:from-aurora-dark hover:to-aurora text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Novo Tópico
          </Button>
          <Button variant="outline" className="w-full border-aurora/20 hover:bg-aurora/5">
            <Users className="h-4 w-4 mr-2" />
            Ver Membros
          </Button>
        </CardContent>
      </Card>

      {/* Regras da Comunidade */}
      <Card className="bg-gradient-to-br from-muted/30 to-muted/10 border-muted/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Regras da Comunidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Seja respeitoso com todos os membros</p>
            <p>• Use títulos descritivos nos tópicos</p>
            <p>• Pesquise antes de criar novos tópicos</p>
            <p>• Compartilhe conhecimento e experiências</p>
            <p>• Mantenha discussões construtivas</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <ForumLayout sidebar={sidebar}>
      <div className="space-y-6">
        <ForumHeader 
          title="Comunidade VIVER DE IA"
          description="Compartilhe conhecimento, faça perguntas e conecte-se com outros membros da comunidade de Inteligência Artificial."
          showNewTopicButton={true}
          onNewTopicClick={handleNewTopicClick}
        />

        {/* Tópicos em Destaque */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Tópicos Recentes</h2>
            <Button variant="outline" size="sm">
              Ver Todos
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                      <div className="flex gap-2">
                        <div className="h-6 bg-muted rounded w-16"></div>
                        <div className="h-6 bg-muted rounded w-20"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {topics.slice(0, 5).map((topic) => (
                <Card key={topic.id} className="group hover:shadow-lg transition-all duration-200 hover:border-aurora/30 bg-gradient-to-r from-card via-card to-card/95">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          {topic.is_pinned && (
                            <Pin className="h-4 w-4 text-aurora" />
                          )}
                          <h3 className="font-semibold text-lg group-hover:text-aurora transition-colors">
                            {topic.title}
                          </h3>
                        </div>
                        
                        <p className="text-muted-foreground line-clamp-2">
                          {topic.content}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{topic.reply_count || 0} respostas</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {formatDistanceToNow(new Date(topic.created_at), {
                                addSuffix: true,
                                locale: ptBR
                              })}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="bg-aurora/10 text-aurora border-aurora/20">
                            {topic.category}
                          </Badge>
                          {topic.is_solved && (
                            <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                              Resolvido
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-4 text-right">
                        <div className="text-sm font-medium">{topic.author?.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(topic.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {!isLoading && topics.length === 0 && (
            <Card className="border-dashed border-2 border-muted">
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <CardTitle className="mb-2">Nenhum tópico ainda</CardTitle>
                <CardDescription className="mb-4">
                  Seja o primeiro a iniciar uma discussão na comunidade!
                </CardDescription>
                <Button 
                  onClick={handleNewTopicClick}
                  className="bg-gradient-to-r from-aurora to-aurora-light hover:from-aurora-dark hover:to-aurora text-white"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Criar Primeiro Tópico
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ForumLayout>
  );
};
