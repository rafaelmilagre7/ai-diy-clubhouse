
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Eye, ThumbsUp, Pin, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
    name: string | null;
    avatar_url: string | null;
  } | null;
}

interface TopicCardProps {
  topic: Topic;
}

export const TopicCard = ({ topic }: TopicCardProps) => {
  const getInitials = (name: string | null) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Extrair uma prévia do conteúdo
  const getContentPreview = (content: string) => {
    return content.length > 120 ? content.substring(0, 120) + "..." : content;
  };
  
  return (
    <Card className="p-4 mb-3 hover:bg-accent/50 transition-all">
      <Link to={`/comunidade/topico/${topic.id}`} className="block">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={topic.profiles?.avatar_url || undefined} />
            <AvatarFallback>{getInitials(topic.profiles?.name)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex gap-2 flex-wrap items-center mb-1">
              <span className="font-medium text-sm text-muted-foreground">
                {topic.profiles?.name || "Usuário"}
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {format(new Date(topic.created_at), "d 'de' MMMM", {
                  locale: ptBR,
                })}
              </span>
              
              <div className="ml-auto flex items-center gap-2">
                {topic.is_pinned && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    <Pin className="h-3 w-3 mr-1" />
                    Fixo
                  </Badge>
                )}
                
                {topic.is_locked && (
                  <Badge variant="outline" className="bg-muted text-muted-foreground border-muted/50">
                    <Lock className="h-3 w-3 mr-1" />
                    Trancado
                  </Badge>
                )}
              </div>
            </div>
            
            <h3 className="text-lg font-semibold mb-2">{topic.title}</h3>
            
            <div className="text-muted-foreground text-sm mb-4">
              {getContentPreview(topic.content)}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>{topic.reply_count} respostas</span>
              </div>
              
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                <span>{topic.view_count} visualizações</span>
              </div>
              
              <div className="flex items-center">
                <ThumbsUp className="h-4 w-4 mr-1" />
                <span>0</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
};
