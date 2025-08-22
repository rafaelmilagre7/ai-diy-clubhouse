import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface CommentStats {
  total_comments: number;
  replied_comments: number;
  pending_comments: number;
  reply_rate: number;
}

export const useCommentStats = () => {
  const {
    data: stats,
    isLoading,
    error
  } = useQuery({
    queryKey: ["admin-comment-stats"],
    queryFn: async (): Promise<CommentStats> => {
      const { data, error } = await supabase.rpc("get_admin_comment_stats");

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      return data as CommentStats;
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
    staleTime: 20000 // Considerar stale após 20 segundos
  });

  return {
    stats: stats || {
      total_comments: 0,
      replied_comments: 0,
      pending_comments: 0,
      reply_rate: 0
    },
    isLoading,
    error
  };
};