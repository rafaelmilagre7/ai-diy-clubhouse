
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { Comment } from "@/types/learningTypes";

export const useLessonComments = (lessonId: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Buscar comentários da lição
  const { 
    data: comments = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['learning-comments', lessonId],
    queryFn: async () => {
      if (!lessonId) return [];
      
      try {
        // Buscar comentários principais (não respostas)
        const { data: rootComments, error: rootError } = await supabase
          .from('learning_comments')
          .select(`
            *,
            profiles:user_id(name, avatar_url, role)
          `)
          .eq('lesson_id', lessonId)
          .is('parent_id', null)
          .order('created_at', { ascending: false });
          
        if (rootError) throw rootError;
        
        // Garantir que rootComments seja um array
        const safeRootComments = Array.isArray(rootComments) ? rootComments : [];
        
        // Buscar respostas aos comentários
        const { data: replies, error: repliesError } = await supabase
          .from('learning_comments')
          .select(`
            *,
            profiles:user_id(name, avatar_url, role)
          `)
          .eq('lesson_id', lessonId)
          .not('parent_id', 'is', null)
          .order('created_at', { ascending: true });
          
        if (repliesError) throw repliesError;
        
        // Garantir que replies seja um array
        const safeReplies = Array.isArray(replies) ? replies : [];
        
        // Verificar se o usuário curtiu cada comentário
        let userLikes: Record<string, boolean> = {};
        
        if (user) {
          const { data: likesData } = await supabase
            .from('learning_comment_likes')
            .select('comment_id')
            .eq('user_id', user.id);
            
          if (likesData && Array.isArray(likesData)) {
            userLikes = likesData.reduce((acc, like) => {
              acc[like.comment_id] = true;
              return acc;
            }, {} as Record<string, boolean>);
          }
        }
        
        // Organizar comentários com suas respostas
        const organizedComments = safeRootComments.map((comment: Comment) => {
          const commentReplies = safeReplies.filter(
            (reply: Comment) => reply.parent_id === comment.id
          ).map((reply: Comment) => ({
            ...reply,
            user_has_liked: !!userLikes[reply.id]
          }));
          
          return {
            ...comment,
            replies: commentReplies,
            user_has_liked: !!userLikes[comment.id]
          };
        });
        
        return organizedComments;
      } catch (error) {
        console.error("Erro ao buscar comentários:", error);
        return [];
      }
    },
    enabled: !!lessonId
  });
  
  // Adicionar comentário
  const addComment = async (content: string, parentId: string | null = null) => {
    if (!user) {
      toast.error("Você precisa estar logado para comentar");
      return;
    }
    
    if (!content.trim()) {
      toast.error("O comentário não pode estar vazio");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { data, error } = await supabase
        .from('learning_comments')
        .insert({
          lesson_id: lessonId,
          user_id: user.id,
          content: content.trim(),
          parent_id: parentId,
          is_hidden: false
        })
        .select();
        
      if (error) throw error;
      
      toast.success(parentId ? "Resposta adicionada!" : "Comentário adicionado!");
      queryClient.invalidateQueries({ queryKey: ['learning-comments', lessonId] });
      
      return data;
    } catch (error: any) {
      console.error("Erro ao adicionar comentário:", error);
      toast.error(`Erro ao enviar comentário: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Excluir comentário
  const deleteComment = async (commentId: string) => {
    if (!user) {
      toast.error("Você precisa estar logado para excluir comentários");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('learning_comments')
        .delete()
        .eq('id', commentId);
        
      if (error) throw error;
      
      toast.success("Comentário excluído com sucesso");
      queryClient.invalidateQueries({ queryKey: ['learning-comments', lessonId] });
    } catch (error: any) {
      console.error("Erro ao excluir comentário:", error);
      toast.error(`Erro ao excluir comentário: ${error.message}`);
    }
  };
  
  // Curtir comentário
  const likeComment = async (commentId: string) => {
    if (!user) {
      toast.error("Você precisa estar logado para curtir comentários");
      return;
    }
    
    try {
      // Verificar se o usuário já curtiu este comentário
      const { data: existingLike } = await supabase
        .from('learning_comment_likes')
        .select('*')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (existingLike) {
        // Remover curtida
        await supabase
          .from('learning_comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
          
        // Decrementar contador de curtidas
        await supabase.rpc('decrement', {
          row_id: commentId,
          table_name: 'learning_comments',
          column_name: 'likes_count'
        });
      } else {
        // Adicionar curtida
        await supabase
          .from('learning_comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id
          });
          
        // Incrementar contador de curtidas
        await supabase.rpc('increment', {
          row_id: commentId,
          table_name: 'learning_comments',
          column_name: 'likes_count'
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['learning-comments', lessonId] });
    } catch (error: any) {
      console.error("Erro ao curtir comentário:", error);
      toast.error(`Erro ao curtir comentário: ${error.message}`);
    }
  };
  
  return {
    comments,
    isLoading,
    error,
    addComment,
    deleteComment,
    likeComment,
    isSubmitting
  };
};
