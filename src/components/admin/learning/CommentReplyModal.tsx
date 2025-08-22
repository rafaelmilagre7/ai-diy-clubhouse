import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Send, User, Calendar, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CommentReplyModalProps {
  commentId: string;
  isOpen: boolean;
  onClose: () => void;
  onReply: (commentId: string, content: string) => Promise<void>;
}

interface CommentDetails {
  id: string;
  content: string;
  created_at: string;
  user_name: string;
  user_avatar_url?: string;
  lesson_title: string;
  module_title: string;
  course_title: string;
}

export const CommentReplyModal: React.FC<CommentReplyModalProps> = ({
  commentId,
  isOpen,
  onClose,
  onReply
}) => {
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: commentDetails, isLoading } = useQuery({
    queryKey: ["comment-details", commentId],
    queryFn: async (): Promise<CommentDetails> => {
      // Buscar comentário com dados do usuário
      const { data: comment, error: commentError } = await supabase
        .from("learning_comments")
        .select(`
          id,
          content,
          created_at,
          lesson_id,
          user_id
        `)
        .eq("id", commentId)
        .single();

      if (commentError) throw commentError;

      // Buscar dados do usuário
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, avatar_url")
        .eq("id", comment.user_id)
        .single();

      // Buscar dados da aula, módulo e curso
      const { data: lesson } = await supabase
        .from("learning_lessons")
        .select(`
          title,
          learning_modules (
            title,
            learning_courses (
              title
            )
          )
        `)
        .eq("id", comment.lesson_id)
        .single();

      return {
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        user_name: profile?.name || "Usuário",
        user_avatar_url: profile?.avatar_url,
        lesson_title: lesson?.title || "Aula",
        module_title: (lesson?.learning_modules as any)?.title || "Módulo",
        course_title: (lesson?.learning_modules as any)?.learning_courses?.title || "Curso"
      };
    },
    enabled: !!commentId && isOpen
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!replyContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      await onReply(commentId, replyContent.trim());
      setReplyContent("");
      onClose();
    } catch (error) {
      console.error("Erro ao enviar resposta:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form quando modal abrir
  useEffect(() => {
    if (isOpen) {
      setReplyContent("");
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Responder Comentário</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
              <div className="h-20 bg-muted rounded"></div>
            </div>
          </div>
        ) : commentDetails ? (
          <div className="space-y-4">
            {/* Comentário Original */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={commentDetails.user_avatar_url} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{commentDetails.user_name}</span>
                      <Badge variant="secondary" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(new Date(commentDetails.created_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      <span className="font-medium">{commentDetails.course_title}</span>
                      {" • "}
                      <span>{commentDetails.module_title}</span>
                      {" • "}
                      <span>{commentDetails.lesson_title}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm whitespace-pre-wrap">{commentDetails.content}</p>
                </div>
              </CardContent>
            </Card>

            {/* Form de Resposta */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="reply-content" className="text-sm font-medium mb-2 block">
                  Sua resposta:
                </label>
                <Textarea
                  id="reply-content"
                  placeholder="Digite sua resposta aqui..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={4}
                  className="resize-none"
                  disabled={isSubmitting}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={!replyContent.trim() || isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Enviar Resposta
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p>Erro ao carregar detalhes do comentário.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};