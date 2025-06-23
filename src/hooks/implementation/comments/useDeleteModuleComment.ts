
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { getUserRoleName } from "@/lib/supabase/types";

export const useDeleteModuleComment = () => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, userId }: { commentId: string; userId: string }) => {
      if (!user) throw new Error("User not authenticated");
      
      // Check if user is admin or comment owner
      const isAdmin = getUserRoleName(profile) === 'admin';
      const isOwner = user.id === userId;
      
      if (!isAdmin && !isOwner) {
        throw new Error("You don't have permission to delete this comment");
      }

      const { error } = await supabase
        .from("implementation_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
      
      return { commentId };
    },
    onSuccess: () => {
      toast.success("Comentário excluído com sucesso");
      queryClient.invalidateQueries({ queryKey: ["module-comments"] });
    },
    onError: (error: any) => {
      console.error("Error deleting comment:", error);
      toast.error("Erro ao excluir comentário");
    },
  });
};
