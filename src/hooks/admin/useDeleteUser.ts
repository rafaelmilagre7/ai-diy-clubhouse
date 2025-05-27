
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

      console.log("🗑️ Iniciando exclusão completa do usuário:", { userId, userEmail });

      // Registrar a ação no log de auditoria antes da exclusão
      await supabase.rpc('log_permission_change', {
        user_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: 'delete_user',
        target_user_id: userId,
        old_value: userEmail
      });

      console.log("📧 Chamando Edge Function para exclusão completa...");

      // Excluir o usuário usando a Edge Function melhorada
      const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        body: { 
          userId,
          forceDelete: false // Permitir falha se houver problemas
        }
      });

      if (error) {
        console.error("❌ Erro da Edge Function:", error);
        throw new Error(`Erro na Edge Function: ${error.message}`);
      }

      if (!data?.success) {
        console.error("❌ Edge Function reportou falha:", data);
        throw new Error(data?.error || 'Falha na exclusão do usuário');
      }

      console.log("✅ Usuário excluído completamente:", data);

      toast.success('Usuário excluído completamente', {
        description: `${userEmail} foi removido do sistema e todos os dados associados foram limpos. Agora é possível criar novos convites para este email.`
      });

      return true;
    } catch (err: any) {
      console.error('❌ Erro ao excluir usuário:', err);
      setError(err);
      
      // Toast de erro mais detalhado
      if (err.message?.includes('Edge Function')) {
        toast.error('Erro na exclusão do usuário', {
          description: 'Problema na comunicação com o sistema de exclusão. Verifique os logs e tente novamente.'
        });
      } else if (err.message?.includes('Permissão negada')) {
        toast.error('Permissão insuficiente', {
          description: 'Você não tem permissão para excluir usuários. Contate um administrador.'
        });
      } else {
        toast.error('Erro ao excluir usuário', {
          description: err.message || 'Não foi possível excluir o usuário. Tente novamente mais tarde.'
        });
      }
      
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
