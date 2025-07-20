
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Eye, Pin, Lock, Plus, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { format, formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getContentPreview } from "@/components/community/utils/contentUtils";

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
  };
  category?: {
    name: string;
    color?: string;
  };
}

export default function CommunityHome() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
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
          profiles:user_id (
            name,
            avatar_url
          ),
          category:category_id (
            name,
            color
          )
        `)
        .order("is_pinned", { ascending: false })
        .order("last_activity_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setTopics(data || []);
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

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Comunidade</h1>
          <p className="text-muted-foreground">
            Conecte-se, compartilhe experiências e aprenda com outros membros
          </p>
        </div>
        <Button asChild>
          <Link to="/comunidade/novo-topico">
            <Plus className="h-4 w-4 mr-2" />
            Novo Tópico
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {topics.map((topic) => (
          <Card key={topic.id} className="p-4 hover:bg-accent/50 transition-all">
            <Link to={`/comunidade/topico/${topic.id}`} className="block">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={topic.profiles?.avatar_url} />
                  <AvatarFallback>
                    {getInitials(topic.profiles?.name)}
                  </AvatarFallback>
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
                      <Badge 
                        variant="outline" 
                        className="bg-primary/10 text-primary border-primary/20"
                      >
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
                      <span>{topic.reply_count || 0}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      <span>{topic.view_count || 0}</span>
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
        ))}
        
        {topics.length === 0 && (
          <Card className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Nenhum tópico encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Seja o primeiro a iniciar uma discussão!
            </p>
            <Button asChild>
              <Link to="/comunidade/novo-topico">
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Tópico
              </Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
