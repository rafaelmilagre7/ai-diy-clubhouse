
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { Comment } from "@/types/learningTypes";
import { useLogging } from "@/hooks/useLogging";

export const useLessonComments = (lessonId: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { log, logError } = useLogging();
  
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
        log('Buscando comentários da aula', { lessonId });
        
        // Buscar comentários principais (não respostas)
        // Usamos join manual em vez do select * para garantir que os dados do perfil sejam obtidos
        const { data: rootComments, error: rootError } = await supabase
          .from('learning_comments')
          .select(`
            *,
            profiles:user_id (
              id,
              name,
              email,
              avatar_url,
              role
            )
          `)
          .eq('lesson_id', lessonId)
          .is('parent_id', null)
          .order('created_at', { ascending: false });
          
        if (rootError) {
          console.error('Query error (root):', rootError);
          logError('Erro ao buscar comentários principais', rootError);
          throw rootError;
        }
        
        // Debug para verificar a estrutura dos dados retornados
        console.log('Root comments data:', rootComments);
        
        // Garantir que rootComments seja um array
        const safeRootComments = Array.isArray(rootComments) ? rootComments : [];
        
        // Buscar respostas aos comentários
        const { data: replies, error: repliesError } = await supabase
          .from('learning_comments')
          .select(`
            *,
            profiles:user_id (
              id,
              name,
              email,
              avatar_url,
              role
            )
          `)
          .eq('lesson_id', lessonId)
          .not('parent_id', 'is', null)
          .order('created_at', { ascending: true });
          
        if (repliesError) {
          console.error('Query error (replies):', repliesError);
          logError('Erro ao buscar respostas', repliesError);
          throw repliesError;
        }
        
        // Garantir que replies seja um array
        const safeReplies = Array.isArray(replies) ? replies : [];
        
        log('Busca de comentários e respostas concluída', { 
          commentCount: safeRootComments.length, 
          replyCount: safeReplies.length 
        });
        
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
        console.error('Error fetching comments:', error);
        logError("Erro ao buscar comentários da aula", error);
        throw error;
      }
    },
    enabled: !!lessonId,
    retry: 1
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
      log('Adicionando comentário à aula', { lessonId, hasParentId: !!parentId });
      
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
        
      if (error) {
        console.error('Insert error:', error);
        logError('Erro ao adicionar comentário à aula', error);
        throw error;
      }
      
      toast.success(parentId ? "Resposta adicionada!" : "Comentário adicionado!");
      log('Comentário adicionado com sucesso', { commentId: data?.[0]?.id });
      
      // Invalidar cache para forçar atualização
      queryClient.invalidateQueries({ queryKey: ['learning-comments', lessonId] });
      
      return data;
    } catch (error: any) {
      logError("Erro ao adicionar comentário à aula", error);
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
      log('Excluindo comentário da aula', { commentId, lessonId });
      
      const { error } = await supabase
        .from('learning_comments')
        .delete()
        .eq('id', commentId);
        
      if (error) {
        console.error('Delete error:', error);
        logError('Erro ao excluir comentário da aula', error);
        throw error;
      }
      
      toast.success("Comentário excluído com sucesso");
      queryClient.invalidateQueries({ queryKey: ['learning-comments', lessonId] });
    } catch (error: any) {
      logError("Erro ao excluir comentário da aula", error);
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
      log('Processando curtida em comentário de aula', { commentId, lessonId });
      
      // Verificar se o usuário já curtiu este comentário
      const { data: existingLike } = await supabase
        .from('learning_comment_likes')
        .select('*')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (existingLike) {
        log('Removendo curtida existente', { likeId: existingLike.id });
        
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
        log('Adicionando nova curtida');
        
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
      console.error('Like error:', error);
      logError("Erro ao curtir comentário da aula", error);
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
