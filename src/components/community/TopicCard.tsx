
import { Link } from "react-router-dom";
import { format, formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Eye, Pin, Lock, Clock, User, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Topic } from "@/types/forumTypes";
import { getInitials } from "@/utils/user";

interface TopicCardProps {
  topic: Topic;
  className?: string;
  compact?: boolean;
}

export const TopicCard = ({ topic, className = "", compact = false }: TopicCardProps) => {
  const getContentPreview = (content: string) => {
    if (!content) return "Sem conteúdo disponível";
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    return plainText.length > 120 ? plainText.substring(0, 120) + "..." : plainText;
  };
  
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

  const authorName = topic.profiles?.name || 'Usuário Anônimo';
  const categoryName = topic.category?.name || 'Sem categoria';
  const topicId = topic.id || '';
  const safeViewCount = Math.max(0, topic.view_count || 0);
  const safeReplyCount = Math.max(0, topic.reply_count || 0);
  
  // Verificar se o ID é válido antes de renderizar o link
  if (!topicId) {
    console.warn('Tópico sem ID válido:', topic);
    return (
      <Card className={`p-4 opacity-50 ${className}`}>
        <div className="text-center text-muted-foreground">
          <p>Tópico inválido</p>
        </div>
      </Card>
    );
  }
  
  console.log('🔗 TopicCard renderizado - ID:', topicId, 'Título:', topic.title);
  
  return (
    <Link 
      to={`/comunidade/topico/${topicId}`} 
      className="block w-full"
    >
      <Card className={`group p-4 hover:bg-accent/50 transition-all duration-200 border-l-4 cursor-pointer hover:shadow-md ${
        topic.is_pinned ? 'border-l-primary' : 'border-l-transparent'
      } ${className}`}>
        <div className="flex items-start gap-3 h-full">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={topic.profiles?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10">
              {topic.profiles?.name ? getInitials(topic.profiles.name) : <User className="h-5 w-5" />}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0 space-y-2">
            {/* Header com autor e tempo */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              <span className="font-medium text-foreground truncate">
                {authorName}
              </span>
              
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>{getRelativeTime(topic.created_at)}</span>
              </div>
              
              {topic.category && (
                <Badge variant="secondary" className="text-xs">
                  {categoryName}
                </Badge>
              )}
            </div>
            
            {/* Título com ícones */}
            <div className="space-y-1">
              <div className="flex items-start gap-2">
                <div className="flex items-center gap-1 shrink-0 mt-0.5">
                  {topic.is_pinned && <Pin className="h-3 w-3 text-primary" />}
                  {topic.is_locked && <Lock className="h-3 w-3 text-muted-foreground" />}
                  {topic.is_solved && <CheckCircle className="h-3 w-3 text-green-600" />}
                </div>
                <h3 className="text-base font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                  {topic.title || 'Tópico sem título'}
                </h3>
              </div>
              
              {/* Status badges */}
              <div className="flex items-center gap-1">
                {topic.is_solved && (
                  <Badge variant="default" className="bg-green-600 hover:bg-green-500 text-white text-xs">
                    Resolvido
                  </Badge>
                )}
                {topic.is_pinned && (
                  <Badge variant="outline" className="text-primary border-primary text-xs">
                    Fixo
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Preview do conteúdo */}
            {!compact && (
              <p className="text-muted-foreground text-sm line-clamp-2">
                {getContentPreview(topic.content)}
              </p>
            )}
            
            {/* Footer com estatísticas */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{safeReplyCount}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{safeViewCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
