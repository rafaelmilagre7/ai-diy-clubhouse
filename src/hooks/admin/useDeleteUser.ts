
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useDeleteUser = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteUser = async (userId: string, userEmail: string) => {
    try {
      setIsDeleting(true);
      setError(null);

      // Registrar a ação no log de auditoria antes da exclusão
      await supabase.rpc('log_permission_change', {
        user_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: 'delete_user',
        target_user_id: userId,
        old_value: userEmail
      });

      // Excluir o usuário usando a função RPC (deve ser criada no lado do servidor)
      const { error } = await supabase.functions.invoke('admin-delete-user', {
        body: { userId }
      });

      if (error) {
        throw error;
      }

      toast.success('Usuário excluído com sucesso', {
        description: `O usuário ${userEmail} foi removido da plataforma.`
      });

      return true;
    } catch (err: any) {
      console.error('Erro ao excluir usuário:', err);
      setError(err);
      
      toast.error('Erro ao excluir usuário', {
        description: err.message || 'Não foi possível excluir o usuário. Tente novamente mais tarde.'
      });
      
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteUser,
    isDeleting,
    error
  };
};
