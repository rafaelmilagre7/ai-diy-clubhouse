
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pin, Lock, CheckCircle, MessageCircle, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { CommunityTopic } from "@/types/communityTypes";
import { ModerationActions } from "./ModerationActions";
import { useReporting } from "@/hooks/community/useReporting";
import { useQueryClient } from "@tanstack/react-query";

interface TopicItemProps {
  topic: CommunityTopic;
}

export const TopicItem = ({ topic }: TopicItemProps) => {
  const { openReportModal } = useReporting();
  const queryClient = useQueryClient();
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  const handleModerationSuccess = () => {
    // Invalidar queries relacionadas para atualizar a UI e estatísticas
    queryClient.invalidateQueries({ queryKey: ['community-topics'] });
    queryClient.invalidateQueries({ queryKey: ['community-categories'] });
    queryClient.invalidateQueries({ queryKey: ['community-stats'] });
    
    console.log('Queries invalidadas após ação de moderação');
  };

  console.log("TopicItem: Gerando link para tópico:", topic.id, "URL será:", `/comunidade/topico/${topic.id}`);

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors relative">
      {/* Link envolvendo todo o conteúdo principal */}
      <Link
        to={`/comunidade/topico/${topic.id}`}
        className="flex flex-col sm:flex-row gap-4 flex-1 min-w-0 cursor-pointer"
      >
        {/* Avatar do Autor */}
        <div className="flex-shrink-0">
          <Avatar className="h-10 w-10">
            <AvatarImage src={topic.profiles?.avatar_url || ''} />
            <AvatarFallback className="bg-aurora-primary text-primary-foreground text-sm">
              {getInitials(topic.profiles?.name || 'Usuário')}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              {/* Título com badges */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h3 className="font-semibold text-foreground hover:text-aurora-primary transition-colors line-clamp-2 flex-1">
                  {topic.title}
                </h3>
                
                {topic.is_pinned && (
                  <Badge variant="secondary" className="gap-1 bg-operational/20 text-operational">
                    <Pin className="h-3 w-3" />
                    Fixado
                  </Badge>
                )}
                
                {topic.is_locked && (
                  <Badge variant="secondary" className="gap-1 bg-status-error/20 text-status-error">
                    <Lock className="h-3 w-3" />
                    Travado
                  </Badge>
                )}
                
                {topic.is_solved && (
                  <Badge variant="secondary" className="gap-1 bg-operational/20 text-operational">
                    <CheckCircle className="h-3 w-3" />
                    Resolvido
                  </Badge>
                )}
              </div>

              {/* Meta informações */}
              <div className="flex items-center text-sm text-muted-foreground gap-4 flex-wrap">
                <span>Por {topic.profiles?.name || 'Usuário'}</span>
                <span>{formatDate(topic.created_at)}</span>
                {topic.category && (
                  <Badge variant="outline" className="text-xs">
                    {topic.category.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{topic.reply_count || 0} respostas</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{topic.view_count || 0} visualizações</span>
            </div>
            {topic.last_activity_at && (
              <span className="text-xs">
                Última atividade: {formatDate(topic.last_activity_at)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Ações de Moderação - fora do link para não interferir */}
      <div className="absolute top-4 right-4 flex-shrink-0">
        <ModerationActions
          type="topic"
          itemId={topic.id}
          currentState={{
            isPinned: topic.is_pinned,
            isLocked: topic.is_locked,
            isHidden: false
          }}
          onReport={() => openReportModal('topic', topic.id, topic.user_id)}
          onSuccess={handleModerationSuccess}
        />
      </div>
    </div>
  );
};
