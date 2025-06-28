
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export const useDeleteUser = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const deleteUser = async (userId: string, userEmail: string) => {
    try {
      setIsDeleting(true);

      // Deletar apenas das tabelas que realmente existem no schema
      
      // Deletar comentários de aprendizado (existe)
      await supabase
        .from('learning_comments')
        .delete()
        .eq('user_id', userId);

      // Deletar progresso de aprendizado (existe)
      await supabase
        .from('learning_progress')
        .delete()
        .eq('user_id', userId);

      // Deletar certificados (existe)
      await supabase
        .from('learning_certificates')
        .delete()
        .eq('user_id', userId);

      // Deletar avaliações NPS (existe)
      await supabase
        .from('learning_lesson_nps')
        .delete()
        .eq('user_id', userId);

      // Deletar clicks em benefícios (existe)
      await supabase
        .from('benefit_clicks')
        .delete()
        .eq('user_id', userId);

      // Deletar posts do fórum (existe)
      await supabase
        .from('forum_posts')
        .delete()
        .eq('user_id', userId);

      // Deletar tópicos do fórum (existe)
      await supabase
        .from('forum_topics')
        .delete()
        .eq('user_id', userId);

      // Deletar reações do fórum (existe)
      await supabase
        .from('forum_reactions')
        .delete()
        .eq('user_id', userId);

      // Deletar trilhas de implementação (existe)
      await supabase
        .from('implementation_trails')
        .delete()
        .eq('user_id', userId);

      // Deletar analytics (existe)
      await supabase
        .from('analytics')
        .delete()
        .eq('user_id', userId);

      // Marcar convites relacionados como utilizados (se existirem)
      await supabase
        .from('invites')
        .update({ used_at: new Date().toISOString() })
        .eq('email', userEmail)
        .is('used_at', null);

      // Finalmente, deletar o perfil do usuário
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('Erro ao deletar perfil:', profileError);
        throw new Error(`Erro ao deletar perfil: ${profileError.message}`);
      }

      toast({
        title: "Usuário excluído",
        description: "O usuário e todos os dados relacionados foram removidos com sucesso.",
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        title: "Erro ao excluir usuário",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteUser, isDeleting };
};
