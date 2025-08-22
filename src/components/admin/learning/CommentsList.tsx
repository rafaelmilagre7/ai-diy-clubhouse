import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MessageSquare, 
  Reply, 
  CheckCircle, 
  Clock, 
  ExternalLink,
  User,
  Calendar
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AdminLearningComment } from "@/hooks/admin/useAdminLearningComments";

interface CommentsListProps {
  comments: AdminLearningComment[];
  isLoading: boolean;
  onReply: (commentId: string) => void;
  onMarkAsReplied: (commentId: string) => void;
  hasMore: boolean;
  onLoadMore: () => void;
}

export const CommentsList: React.FC<CommentsListProps> = ({
  comments,
  isLoading,
  onReply,
  onMarkAsReplied,
  hasMore,
  onLoadMore
}) => {
  if (isLoading && comments.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (comments.length === 0 && !isLoading) {
    return (
      <Card>
        <CardContent className="pt-8 pb-8">
          <div className="text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Nenhum comentário encontrado</h3>
            <p>Não há comentários com os filtros aplicados.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <Card key={comment.id} className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={comment.user_avatar_url} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{comment.user_name}</h4>
                    <Badge
                      variant={comment.admin_replied ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {comment.admin_replied ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Respondido
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          Pendente
                        </>
                      )}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1 mb-1">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </div>
                    
                    <div className="text-xs">
                      <span className="font-medium">{comment.course_title}</span>
                      {" • "}
                      <span>{comment.module_title}</span>
                      {" • "}
                      <span>{comment.lesson_title}</span>
                    </div>
                  </div>
                </div>
              </div>

              {comment.replies_count > 0 && (
                <Badge variant="outline" className="gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {comment.replies_count} {comment.replies_count === 1 ? 'resposta' : 'respostas'}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="bg-muted/50 rounded-lg p-4 mb-4">
              <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onReply(comment.id)}
                  className="gap-2"
                >
                  <Reply className="h-4 w-4" />
                  Responder
                </Button>

                {!comment.admin_replied && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onMarkAsReplied(comment.id)}
                    className="gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Marcar como Respondido
                  </Button>
                )}
              </div>

              <Button asChild size="sm" variant="ghost" className="gap-2">
                <Link
                  to={`/formacao/lesson/${comment.lesson_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ver Aula
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Load More */}
      {hasMore && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Carregando...
              </>
            ) : (
              "Carregar Mais Comentários"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};