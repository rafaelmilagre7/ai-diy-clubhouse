
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ForumLayout } from "@/components/community/ForumLayout";
import { ForumHeader } from "@/components/community/ForumHeader";
import { PlusCircle, MessageSquare, Eye, Clock, Pin, Lock } from "lucide-react";
import { format, formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getContentPreview } from "@/components/community/utils/contentUtils";
import { getInitials } from "@/utils/user";

interface Topic {
  id: string;
  title: string;
  content: string;
  created_at: string;
  view_count: number;
  reply_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  last_activity_at: string;
  profiles: {
    name: string;
    avatar_url?: string;
  } | null;
  category: {
    name: string;
    color?: string;
  } | null;
}

const CommunityHome = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentTopics();
  }, []);

  const fetchRecentTopics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("forum_topics")
        .select(`
          id,
          title,
          content,
          created_at,
          view_count,
          reply_count,
          is_pinned,
          is_locked,
          last_activity_at,
          profiles!forum_topics_author_id_fkey (
            name,
            avatar_url
          ),
          forum_categories!forum_topics_category_id_fkey (
            name,
            color
          )
        `)
        .order("is_pinned", { ascending: false })
        .order("last_activity_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      
      // Transformar dados para o formato correto do tipo Topic
      const transformedData = (data || []).map(topic => ({
        ...topic,
        profiles: Array.isArray(topic.profiles) ? topic.profiles[0] || null : topic.profiles,
        category: Array.isArray(topic.category) ? topic.category[0] || null : topic.category
      }));
      
      setTopics(transformedData);
    } catch (error) {
      console.error("Erro ao carregar tópicos:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRelativeTime = (date: string) => {
    return formatDistance(new Date(date), new Date(), {
      addSuffix: true,
      locale: ptBR,
    });
  };

  const TopicCard = ({ topic }: { topic: Topic }) => (
    <Card className="p-4 mb-3 hover:bg-accent/50 transition-all duration-200 border-border/30 bg-card/60 backdrop-blur-sm">
      <Link to={`/comunidade/topico/${topic.id}`} className="block">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={topic.profiles?.avatar_url || undefined} />
            <AvatarFallback>{getInitials(topic.profiles?.name)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1 flex-wrap">
              <span className="font-medium truncate">
                {topic.profiles?.name || "Usuário"}
              </span>
              
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>{getRelativeTime(topic.created_at)}</span>
              </div>
              
              {topic.category && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {topic.category.name}
                </Badge>
              )}
            </div>
            
            <h3 className="text-lg font-semibold mb-1 line-clamp-1">
              {topic.is_pinned && <Pin className="h-3 w-3 inline mr-1 text-primary" />}
              {topic.is_locked && <Lock className="h-3 w-3 inline mr-1 text-muted-foreground" />}
              {topic.title}
            </h3>
            
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {getContentPreview(topic.content)}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>{topic.reply_count}</span>
              </div>
              
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                <span>{topic.view_count}</span>
              </div>
              
              <div className="flex items-center ml-auto">
                {new Date(topic.last_activity_at).getTime() !== new Date(topic.created_at).getTime() && (
                  <span className="text-xs">
                    Última atividade {getRelativeTime(topic.last_activity_at)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container px-4 py-6 mx-auto max-w-7xl">
        {/* Header Elegante */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Comunidade VIVER DE IA
          </h1>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Conecte-se, compartilhe conhecimento e cresça junto com nossa comunidade de empreendedores de IA
          </p>
          
          <Button 
            asChild 
            size="lg"
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Link to="/comunidade/novo-topico" className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              <span>Criar Novo Tópico</span>
            </Link>
          </Button>
        </div>

        {/* Layout Principal com Glassmorphism */}
        <ForumLayout>
          <div className="space-y-6">
            {/* Seção de Tópicos Recentes */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                Discussões Recentes
              </h2>
              
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i} className="p-4 animate-pulse bg-card/40">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 bg-muted rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-1/4" />
                          <div className="h-5 bg-muted rounded w-3/4" />
                          <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : topics.length > 0 ? (
                <div className="space-y-2">
                  {topics.map((topic) => (
                    <TopicCard key={topic.id} topic={topic} />
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center bg-card/40 backdrop-blur-sm border-border/30">
                  <div className="text-muted-foreground mb-4">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Nenhum tópico encontrado</h3>
                    <p>Seja o primeiro a iniciar uma discussão na comunidade!</p>
                  </div>
                  <Button asChild className="mt-4">
                    <Link to="/comunidade/novo-topico">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Criar Primeiro Tópico
                    </Link>
                  </Button>
                </Card>
              )}
            </div>

            {/* Links de Navegação */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <Card className="p-4 hover:bg-accent/50 transition-all duration-200 bg-card/60 backdrop-blur-sm border-border/30">
                <Link to="/comunidade/categorias" className="block">
                  <h3 className="font-semibold mb-2">Explorar Categorias</h3>
                  <p className="text-sm text-muted-foreground">
                    Navegue pelas diferentes áreas de discussão
                  </p>
                </Link>
              </Card>
              
              <Card className="p-4 hover:bg-accent/50 transition-all duration-200 bg-card/60 backdrop-blur-sm border-border/30">
                <Link to="/comunidade/populares" className="block">
                  <h3 className="font-semibold mb-2">Tópicos Populares</h3>
                  <p className="text-sm text-muted-foreground">
                    Veja as discussões mais engajadas
                  </p>
                </Link>
              </Card>
              
              <Card className="p-4 hover:bg-accent/50 transition-all duration-200 bg-card/60 backdrop-blur-sm border-border/30">
                <Link to="/comunidade/regras" className="block">
                  <h3 className="font-semibold mb-2">Regras da Comunidade</h3>
                  <p className="text-sm text-muted-foreground">
                    Conheça nossas diretrizes e boas práticas
                  </p>
                </Link>
              </Card>
            </div>
          </div>
        </ForumLayout>
      </div>
    </div>
  );
};

export default CommunityHome;
