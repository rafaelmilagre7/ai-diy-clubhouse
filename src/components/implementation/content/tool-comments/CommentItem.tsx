
import React from 'react';
import { Comment } from '@/types/commentTypes';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare, Shield, ThumbsUp, Trash } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { Card } from '@/components/ui/card';
import { useLogging } from '@/hooks/useLogging';

interface CommentItemProps {
  comment: Comment;
  onReply: (comment: Comment) => void;
  onLike: (comment: Comment) => void;
  onDelete: (comment: Comment) => void;
}

export const CommentItem = ({ comment, onReply, onLike, onDelete }: CommentItemProps) => {
  const { user } = useAuth();
  const { log } = useLogging();
  const isAuthor = user?.id === comment.user_id;
  
  // Log para diagnóstico
  React.useEffect(() => {
    console.log('🔍 [CommentItem] Renderizando comentário:', { 
      commentId: comment.id, 
      hasProfile: !!comment.profiles,
      profileData: comment.profiles,
      userId: comment.user_id,
      currentUser: user?.id,
      isAuthor,
      avatarUrl: comment.profiles?.avatar_url,
      fullComment: comment
    });
  }, [comment, user?.id, isAuthor]);
  
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR
      });
    } catch (error) {
      return 'data desconhecida';
    }
  };
  
  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  // Dados do perfil com fallbacks para casos onde o relacionamento falha
  const profileName = comment.profiles?.name || 'Usuário';
  const profileRole = comment.profiles?.role;
  const profileAvatarUrl = comment.profiles?.avatar_url;

  return (
    <Card className="bg-[#151823] border-white/10 shadow-sm hover:shadow-md hover:border-white/20 transition-all duration-300">
      <div className="p-4 space-y-4">
        <div className="flex gap-4">
          <Avatar className="h-10 w-10 ring-2 ring-viverblue/10">
            <AvatarImage 
              src={profileAvatarUrl} 
              alt={profileName}
              className="object-cover"
              onError={() => console.log('Erro ao carregar avatar:', profileAvatarUrl)}
            />
            <AvatarFallback className="bg-viverblue/10 text-viverblue font-medium border border-viverblue/20">
              {getInitials(profileName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-textPrimary">{profileName}</span>
                  {profileRole === 'admin' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-viverblue/10 text-viverblue">
                      <Shield className="h-3 w-3 mr-1" />
                      ADMIN
                    </span>
                  )}
                </div>
                <p className="text-sm text-textSecondary">{formatDate(comment.created_at)}</p>
              </div>
              
              {isAuthor && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onDelete(comment)}
                  className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="text-textPrimary leading-relaxed">
              {comment.content}
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onLike(comment)}
                className={`text-xs hover:bg-viverblue/10 ${
                  comment.user_has_liked ? 'text-viverblue' : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                {comment.likes_count || 0}
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onReply(comment)}
                className="text-xs text-textSecondary hover:text-textPrimary hover:bg-viverblue/10"
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                Responder
              </Button>
              
              {isAuthor && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onDelete(comment)}
                  className="text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <Trash className="h-3.5 w-3.5 mr-1" />
                  Excluir
                </Button>
              )}
            </div>
            
            {comment.replies && comment.replies.length > 0 && (
              <div className="space-y-4 mt-4 pl-6 border-l-2 border-viverblue/10">
                {comment.replies.map(reply => {
                  // Log para diagnóstico de respostas
                  log('Dados de resposta:', { 
                    replyId: reply.id, 
                    hasProfile: !!reply.profiles,
                    profileData: reply.profiles || 'Perfil não disponível' 
                  });
                  
                  return (
                    <CommentItem 
                      key={reply.id} 
                      comment={reply} 
                      onReply={onReply} 
                      onLike={onLike} 
                      onDelete={onDelete}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
