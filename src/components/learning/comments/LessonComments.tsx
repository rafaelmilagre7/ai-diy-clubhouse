
import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send, Loader2, ThumbsUp, Reply } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  profiles: {
    name: string;
    avatar_url: string;
  };
  likes_count: number;
  user_has_liked?: boolean;
  replies?: Comment[];
}

interface CommentItemProps {
  comment: Comment;
  onReply: (parentId: string) => void;
  isReply?: boolean;
  lessonId: string;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onReply, isReply = false, lessonId }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [liked, setLiked] = useState(comment.user_has_liked || false);
  const [likesCount, setLikesCount] = useState(comment.likes_count);

  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");
      
      if (liked) {
        // Remover like
        const { error } = await supabase
          .from('learning_comment_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('comment_id', comment.id);
        
        if (error) throw error;
      } else {
        // Adicionar like
        const { error } = await supabase
          .from('learning_comment_likes')
          .insert({
            comment_id: comment.id,
            user_id: user.id
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      // Atualizar estado local
      setLiked(!liked);
      setLikesCount(prev => liked ? prev - 1 : prev + 1);
      
      // Invalidar cache para recarregar comentários
      queryClient.invalidateQueries({ queryKey: ['lesson-comments', lessonId] });
    },
    onError: (error) => {
      console.error("Erro ao processar like:", error);
      toast.error("Não foi possível processar sua ação");
    }
  });

  const handleLike = () => {
    if (!user) {
      toast.error("Você precisa estar logado para curtir comentários");
      return;
    }
    
    toggleLikeMutation.mutate();
  };

  const formattedDate = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true,
    locale: ptBR
  });

  return (
    <div className={`${isReply ? 'pl-10 mt-4' : 'mb-6'}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          {comment.profiles?.avatar_url ? (
            <AvatarImage src={comment.profiles.avatar_url} alt={comment.profiles?.name || "Usuário"} />
          ) : (
            <AvatarFallback>{(comment.profiles?.name || "U")[0].toUpperCase()}</AvatarFallback>
          )}
        </Avatar>
        
        <div className="flex-1">
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex justify-between items-start">
              <span className="font-medium text-sm">
                {comment.profiles?.name || "Usuário"}
              </span>
              <span className="text-xs text-muted-foreground">{formattedDate}</span>
            </div>
            <p className="mt-1 text-sm whitespace-pre-wrap">{comment.content}</p>
          </div>
          
          <div className="flex gap-4 mt-1 ml-1">
            <button 
              onClick={handleLike}
              className={`flex items-center text-xs gap-1 ${liked ? 'text-primary' : 'text-muted-foreground'} hover:text-primary transition-colors`}
              disabled={toggleLikeMutation.isPending}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              {likesCount > 0 && <span>{likesCount}</span>}
            </button>
            
            {!isReply && (
              <button 
                onClick={() => onReply(comment.id)}
                className="flex items-center text-xs gap-1 text-muted-foreground hover:text-primary transition-colors"
              >
                <Reply className="h-3.5 w-3.5" />
                <span>Responder</span>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          {comment.replies.map(reply => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              onReply={onReply}
              isReply={true}
              lessonId={lessonId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface LessonCommentsProps {
  lessonId: string;
}

export const LessonComments: React.FC<LessonCommentsProps> = ({ lessonId }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Buscar comentários
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['lesson-comments', lessonId],
    queryFn: async () => {
      // Primeira busca: comentários principais
      const { data: topLevelComments, error } = await supabase
        .from('learning_comments')
        .select(`
          *,
          profiles:user_id(name, avatar_url)
        `)
        .eq('lesson_id', lessonId)
        .is('parent_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Segunda busca: respostas aos comentários
      const { data: replies, error: repliesError } = await supabase
        .from('learning_comments')
        .select(`
          *,
          profiles:user_id(name, avatar_url)
        `)
        .eq('lesson_id', lessonId)
        .not('parent_id', 'is', null)
        .order('created_at', { ascending: true });

      if (repliesError) throw repliesError;

      // Se o usuário estiver logado, buscar likes
      let userLikes: Record<string, boolean> = {};

      if (user) {
        const { data: likesData, error: likesError } = await supabase
          .from('learning_comment_likes')
          .select('comment_id')
          .eq('user_id', user.id);

        if (!likesError && likesData) {
          userLikes = likesData.reduce((acc, like) => {
            acc[like.comment_id] = true;
            return acc;
          }, {} as Record<string, boolean>);
        }
      }

      // Organizar comentários com suas respostas
      const commentMap: Record<string, Comment> = {};
      
      topLevelComments.forEach((comment) => {
        commentMap[comment.id] = {
          ...comment,
          profiles: comment.profiles || { name: 'Usuário', avatar_url: '' },
          user_has_liked: userLikes[comment.id] || false,
          replies: []
        };
      });

      replies.forEach((reply) => {
        if (reply.parent_id && commentMap[reply.parent_id]) {
          if (!commentMap[reply.parent_id].replies) {
            commentMap[reply.parent_id].replies = [];
          }
          
          commentMap[reply.parent_id].replies!.push({
            ...reply,
            profiles: reply.profiles || { name: 'Usuário', avatar_url: '' },
            user_has_liked: userLikes[reply.id] || false
          });
        }
      });

      return Object.values(commentMap);
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    enabled: !!lessonId
  });

  // Mutação para enviar comentário
  const addCommentMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");
      if (!comment.trim()) throw new Error("Comentário não pode estar vazio");
      
      const { data, error } = await supabase
        .from('learning_comments')
        .insert({
          lesson_id: lessonId,
          user_id: user.id,
          content: comment.trim(),
          parent_id: replyTo
        })
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setComment("");
      setReplyTo(null);
      queryClient.invalidateQueries({ queryKey: ['lesson-comments', lessonId] });
      toast.success(replyTo ? "Resposta enviada com sucesso!" : "Comentário enviado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao enviar comentário:", error);
      toast.error("Não foi possível enviar seu comentário");
    }
  });

  const handleReply = (parentId: string) => {
    setReplyTo(parentId);
    // Focar no textarea
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCommentMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <span>Comentários</span>
        </CardTitle>
      </CardHeader>
      
      {user ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{user?.email?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              {replyTo && (
                <div className="mb-2 flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">Respondendo a um comentário</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-5 text-xs" 
                    onClick={() => setReplyTo(null)}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
              
              <Textarea
                ref={textareaRef}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={replyTo ? "Escreva sua resposta..." : "Deixe seu comentário sobre esta aula..."}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              size="sm"
              disabled={!comment.trim() || addCommentMutation.isPending}
              className="gap-2"
            >
              {addCommentMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Enviar</span>
                </>
              )}
            </Button>
          </div>
        </form>
      ) : (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-muted-foreground">Faça login para deixar um comentário.</p>
          </CardContent>
        </Card>
      )}
      
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length > 0 ? (
          comments.map(comment => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              onReply={handleReply}
              lessonId={lessonId}
            />
          ))
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>Nenhum comentário ainda. Seja o primeiro a comentar!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonComments;
