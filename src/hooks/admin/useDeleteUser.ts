
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useDeleteUser = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteUser = async (userId: string, userEmail: string, softDelete: boolean = false) => {
    try {
      setIsDeleting(true);
      setError(null);

      console.log("🗑️ Iniciando exclusão do usuário:", { userId, userEmail, softDelete });

      const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        body: { 
          userId,
          forceDelete: true, // Forçar delete mesmo com erros menores
          softDelete
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

      console.log("✅ Usuário processado:", data);

      if (softDelete) {
        toast.success('Dados do usuário limpos (soft delete)', {
          description: `${userEmail} teve seus dados limpos. Agora é possível reenviar convites.`
        });
      } else {
        toast.success('Usuário excluído completamente', {
          description: `${userEmail} foi removido do sistema. Agora é possível criar novos convites.`
        });
      }

      return true;
    } catch (err: any) {
      console.error('❌ Erro ao processar usuário:', err);
      setError(err);
      
      toast.error('Erro ao processar usuário', {
        description: err.message || 'Não foi possível processar o usuário. Tente novamente.'
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
