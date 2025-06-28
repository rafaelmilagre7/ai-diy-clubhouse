
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export const useDeleteUser = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const deleteUser = async (userId: string, userEmail: string) => {
    try {
      setIsDeleting(true);

      // Lista de tabelas que realmente existem no schema atual e podem ter referências ao usuário
      const existingTablesToClean = [
        'analytics',
        'forum_posts', 
        'forum_topics'
      ];

      let totalDeleted = 0;

      // Deletar de cada tabela existente com tratamento de erro individual
      for (const tableName of existingTablesToClean) {
        try {
          const { error } = await supabase
            .from(tableName as any)
            .delete()
            .eq('user_id', userId);

          if (error) {
            console.warn(`Erro ao deletar de ${tableName}:`, error);
          } else {
            console.log(`✅ Limpeza concluída para ${tableName}`);
            totalDeleted++;
          }
        } catch (error) {
          console.warn(`Erro ao acessar tabela ${tableName}:`, error);
        }
      }

      // Atualizar convites relacionados (se a tabela existir)
      try {
        const { error: inviteError } = await supabase
          .from('invites')
          .update({ used_at: new Date().toISOString() })
          .eq('email', userEmail)
          .is('used_at', null);

        if (!inviteError) {
          console.log('✅ Convites atualizados');
        }
      } catch (err) {
        console.warn('Tabela invites pode não existir:', err);
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
        description: "O usuário e dados relacionados foram removidos com sucesso.",
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
