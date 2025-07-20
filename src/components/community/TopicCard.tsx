
import { Link } from "react-router-dom";
import { format, formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Eye, ThumbsUp, Pin, Lock, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Topic } from "@/types/forumTypes";
import { getInitials } from "@/utils/user";
import { getContentPreview } from "./utils/contentUtils";

interface TopicCardProps {
  topic: Topic;
  className?: string;
  compact?: boolean;
}

export const TopicCard = ({ topic, className = "", compact = false }: TopicCardProps) => {
  // Calcular tempo relativo
  const getRelativeTime = (date: string) => {
    return formatDistance(new Date(date), new Date(), {
      addSuffix: true,
      locale: ptBR,
    });
  };
  
  return (
    <Card className={`p-4 mb-3 hover:bg-accent/50 transition-all ${className}`}>
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
            
            {!compact && (
              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                {getContentPreview(topic.content)}
              </p>
            )}
            
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
};
