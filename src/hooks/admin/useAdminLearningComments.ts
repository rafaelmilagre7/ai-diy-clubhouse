import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface AdminLearningComment {
  id: string;
  content: string;
  user_id: string;
  lesson_id: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  admin_replied: boolean;
  user_name: string;
  user_avatar_url?: string;
  lesson_title: string;
  module_title: string;
  course_title: string;
  replies_count: number;
}

interface UseAdminLearningCommentsParams {
  status?: string;
  courseId?: string;
  lessonId?: string;
  search?: string;
  limit?: number;
}

export const useAdminLearningComments = (params: UseAdminLearningCommentsParams = {}) => {
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();
  const limit = params.limit || 20;

  const {
    data: commentsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["admin-learning-comments", params, page],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_admin_learning_comments", {
        p_limit: limit,
        p_offset: page * limit,
        p_course_id: params.courseId || null,
        p_lesson_id: params.lessonId || null,
        p_status: params.status || null
      });

      if (error) throw error;

      // Se temos busca por texto, filtrar localmente
      let filteredData = data || [];
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredData = filteredData.filter((comment: AdminLearningComment) =>
          comment.content.toLowerCase().includes(searchLower) ||
          comment.user_name.toLowerCase().includes(searchLower) ||
          comment.lesson_title.toLowerCase().includes(searchLower) ||
          comment.course_title.toLowerCase().includes(searchLower)
        );
      }

      return filteredData as AdminLearningComment[];
    },
    enabled: true
  });

  const comments = commentsData || [];
  const hasMore = comments.length === limit;

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, isLoading]);

  // Reset página quando parâmetros mudarem
  useEffect(() => {
    setPage(0);
  }, [params.status, params.courseId, params.lessonId, params.search]);

  const markAsReplied = useCallback(async (commentId: string) => {
    try {
      const { data, error } = await supabase.rpc("mark_comment_as_replied", {
        p_comment_id: commentId
      });

      if (error) throw error;

      if (data.success) {
        toast.success("Comentário marcado como respondido");
        queryClient.invalidateQueries({ queryKey: ["admin-learning-comments"] });
        queryClient.invalidateQueries({ queryKey: ["admin-comment-stats"] });
      } else {
        toast.error(data.message || "Erro ao marcar comentário");
      }
    } catch (error: any) {
      console.error("Erro ao marcar como respondido:", error);
      toast.error("Erro ao marcar comentário como respondido");
    }
  }, [queryClient]);

  const replyToComment = useCallback(async (commentId: string, content: string) => {
    try {
      // Buscar dados do comentário original
      const { data: originalComment } = await supabase
        .from("learning_comments")
        .select("lesson_id, user_id")
        .eq("id", commentId)
        .single();

      if (!originalComment) {
        throw new Error("Comentário original não encontrado");
      }

      // Inserir resposta
      const { error: insertError } = await supabase
        .from("learning_comments")
        .insert({
          content,
          lesson_id: originalComment.lesson_id,
          parent_id: commentId,
          user_id: supabase.auth.getUser().then(u => u.data.user?.id) // Admin atual
        });

      if (insertError) throw insertError;

      // Marcar comentário original como respondido
      await markAsReplied(commentId);

      toast.success("Resposta enviada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["admin-learning-comments"] });
    } catch (error: any) {
      console.error("Erro ao responder comentário:", error);
      toast.error("Erro ao enviar resposta");
      throw error;
    }
  }, [markAsReplied, queryClient]);

  const refreshComments = useCallback(() => {
    setPage(0);
    queryClient.invalidateQueries({ queryKey: ["admin-learning-comments"] });
  }, [queryClient]);

  return {
    comments,
    isLoading,
    error,
    markAsReplied,
    replyToComment,
    refreshComments,
    hasMore,
    loadMore
  };
};