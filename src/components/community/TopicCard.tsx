
import { Link } from "react-router-dom";
import { format, formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Eye, Pin, Lock, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Topic } from "@/types/forumTypes";
import { getInitials } from "@/utils/user";

interface TopicCardProps {
  topic: Topic;
  className?: string;
  compact?: boolean;
}

export const TopicCard = ({ topic, className = "", compact = false }: TopicCardProps) => {
  // Função para extrair prévia do conteúdo
  const getContentPreview = (content: string) => {
    if (!content) return "Sem conteúdo disponível";
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    return plainText.length > 120 ? plainText.substring(0, 120) + "..." : plainText;
  };
  
  // Função para calcular tempo relativo com fallback
  const getRelativeTime = (date: string) => {
    try {
      return formatDistance(new Date(date), new Date(), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch (error) {
      return 'há algum tempo';
    }
  };

  // Valores com fallback
  const authorName = topic.profiles?.name || 'Usuário Anônimo';
  const categoryName = topic.category?.name || 'Sem categoria';
  const topicId = topic.id || '';
  const safeViewCount = Math.max(0, topic.view_count || 0);
  const safeReplyCount = Math.max(0, topic.reply_count || 0);
  
  return (
    <Card className={`p-4 mb-3 hover:bg-accent/50 transition-all ${className}`}>
      <Link 
        to={topicId ? `/comunidade/topico/${topicId}` : '#'} 
        className="block"
        onClick={(e) => {
          if (!topicId) {
            e.preventDefault();
            console.warn('Tópico sem ID válido:', topic);
          }
        }}
      >
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={topic.profiles?.avatar_url || undefined} />
            <AvatarFallback>
              {topic.profiles?.name ? getInitials(topic.profiles.name) : <User className="h-5 w-5" />}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1 flex-wrap">
              <span className="font-medium truncate">
                {authorName}
              </span>
              
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>{getRelativeTime(topic.created_at)}</span>
              </div>
              
              {topic.category && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {categoryName}
                </Badge>
              )}
            </div>
            
            <h3 className="text-lg font-semibold mb-1 line-clamp-1 flex items-center gap-2">
              {topic.is_pinned && <Pin className="h-3 w-3 text-primary" />}
              {topic.is_locked && <Lock className="h-3 w-3 text-muted-foreground" />}
              <span className="truncate">{topic.title || 'Tópico sem título'}</span>
              {topic.is_solved && (
                <Badge className="bg-green-600 hover:bg-green-500 text-white text-xs">
                  Resolvido
                </Badge>
              )}
            </h3>
            
            {!compact && (
              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                {getContentPreview(topic.content)}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>{safeReplyCount}</span>
              </div>
              
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                <span>{safeViewCount}</span>
              </div>
              
              <div className="flex items-center ml-auto">
                {topic.last_activity_at && 
                 new Date(topic.last_activity_at).getTime() !== new Date(topic.created_at).getTime() && (
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
