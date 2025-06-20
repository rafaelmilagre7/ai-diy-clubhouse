
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export const useDeleteUser = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const deleteUser = async (userId: string, userEmail: string) => {
    try {
      setIsDeleting(true);

      // 1. Primeiro, deletar o perfil do usuário na tabela profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId as any);

      if (profileError) {
        console.error('Erro ao deletar perfil:', profileError);
        throw new Error(`Erro ao deletar perfil: ${profileError.message}`);
      }

      // 2. Deletar registros relacionados ao usuário
      
      // Deletar notificações
      await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId as any);

      // Deletar progresso de implementações
      await supabase
        .from('progress')
        .delete()
        .eq('user_id', userId as any);

      // Deletar comentários
      await supabase
        .from('solution_comments')
        .delete()
        .eq('user_id', userId as any);

      // Deletar votos em sugestões
      await supabase
        .from('suggestion_votes')
        .delete()
        .eq('user_id', userId as any);

      // Deletar sugestões criadas pelo usuário
      await supabase
        .from('suggestions')
        .delete()
        .eq('user_id', userId as any);

      // Deletar analytics
      await supabase
        .from('analytics')
        .delete()
        .eq('user_id', userId as any);

      // Deletar dados de onboarding
      await supabase
        .from('onboarding_final')
        .delete()
        .eq('user_id', userId as any);

      // Deletar trails de implementação
      await supabase
        .from('implementation_trails')
        .delete()
        .eq('user_id', userId as any);

      // Deletar comentários de aprendizado
      await supabase
        .from('learning_comments')
        .delete()
        .eq('user_id', userId as any);

      // Deletar progresso de aprendizado
      await supabase
        .from('learning_progress')
        .delete()
        .eq('user_id', userId as any);

      // Deletar certificados
      await supabase
        .from('learning_certificates')
        .delete()
        .eq('user_id', userId as any);

      // Deletar avaliações NPS
      await supabase
        .from('learning_lesson_nps')
        .delete()
        .eq('user_id', userId as any);

      // Deletar clicks em benefícios
      await supabase
        .from('benefit_clicks')
        .delete()
        .eq('user_id', userId as any);

      // Deletar posts do fórum
      await supabase
        .from('forum_posts')
        .delete()
        .eq('user_id', userId as any);

      // Deletar tópicos do fórum
      await supabase
        .from('forum_topics')
        .delete()
        .eq('user_id', userId as any);

      // Deletar reações do fórum
      await supabase
        .from('forum_reactions')
        .delete()
        .eq('user_id', userId as any);

      // 3. Marcar convites relacionados como utilizados (se existirem)
      await supabase
        .from('invites')
        .update({ used_at: new Date().toISOString() } as any)
        .eq('email', userEmail as any)
        .is('used_at', null);

      // 4. Finalmente, deletar o usuário na auth (se possível via admin)
      // Nota: Este passo pode precisar ser feito via dashboard do Supabase
      // ou usando a API de admin do Supabase se configurada

      // 5. Deletar registro de profiles se ainda existir
      await supabase
        .from('profiles')
        .delete()
        .eq('email', userEmail as any);

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
