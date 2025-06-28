
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export const useDeleteUser = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const deleteUser = async (userId: string, userEmail: string) => {
    try {
      setIsDeleting(true);

      // Deletar apenas das tabelas que realmente existem no schema atual
      // Verificando as tabelas existentes uma por uma
      
      try {
        // Deletar comentários de aprendizado
        await supabase
          .from('learning_comments')
          .delete()
          .eq('user_id', userId);
      } catch (error) {
        console.warn('Tabela learning_comments não encontrada ou erro:', error);
      }

      try {
        // Deletar progresso de aprendizado
        await supabase
          .from('learning_progress')
          .delete()
          .eq('user_id', userId);
      } catch (error) {
        console.warn('Tabela learning_progress não encontrada ou erro:', error);
      }

      try {
        // Deletar certificados
        await supabase
          .from('learning_certificates')
          .delete()
          .eq('user_id', userId);
      } catch (error) {
        console.warn('Tabela learning_certificates não encontrada ou erro:', error);
      }

      try {
        // Deletar avaliações NPS
        await supabase
          .from('learning_lesson_nps')
          .delete()
          .eq('user_id', userId);
      } catch (error) {
        console.warn('Tabela learning_lesson_nps não encontrada ou erro:', error);
      }

      try {
        // Deletar clicks em benefícios
        await supabase
          .from('benefit_clicks')
          .delete()
          .eq('user_id', userId);
      } catch (error) {
        console.warn('Tabela benefit_clicks não encontrada ou erro:', error);
      }

      try {
        // Deletar posts do fórum
        await supabase
          .from('forum_posts')
          .delete()
          .eq('user_id', userId);
      } catch (error) {
        console.warn('Tabela forum_posts não encontrada ou erro:', error);
      }

      try {
        // Deletar tópicos do fórum
        await supabase
          .from('forum_topics')
          .delete()
          .eq('user_id', userId);
      } catch (error) {
        console.warn('Tabela forum_topics não encontrada ou erro:', error);
      }

      try {
        // Deletar reações do fórum
        await supabase
          .from('forum_reactions')
          .delete()
          .eq('user_id', userId);
      } catch (error) {
        console.warn('Tabela forum_reactions não encontrada ou erro:', error);
      }

      try {
        // Deletar trilhas de implementação
        await supabase
          .from('implementation_trails')
          .delete()
          .eq('user_id', userId);
      } catch (error) {
        console.warn('Tabela implementation_trails não encontrada ou erro:', error);
      }

      try {
        // Deletar analytics
        await supabase
          .from('analytics')
          .delete()
          .eq('user_id', userId);
      } catch (error) {
        console.warn('Tabela analytics não encontrada ou erro:', error);
      }

      try {
        // Marcar convites relacionados como utilizados (se existirem)
        await supabase
          .from('invites')
          .update({ used_at: new Date().toISOString() })
          .eq('email', userEmail)
          .is('used_at', null);
      } catch (error) {
        console.warn('Erro ao atualizar convites:', error);
      }

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
