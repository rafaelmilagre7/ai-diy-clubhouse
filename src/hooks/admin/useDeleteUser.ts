
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface DeleteResult {
  success: boolean;
  message: string;
  details: {
    profileDeleted: boolean;
    authUserDeleted: boolean;
    relatedDataCleared: boolean;
    tablesAffected: string[];
    errors: any[];
  };
  userId: string;
  userEmail?: string;
}

export const useDeleteUser = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [deleteResult, setDeleteResult] = useState<DeleteResult | null>(null);

  const deleteUser = async (userId: string, userEmail: string, softDelete: boolean = false) => {
    try {
      setIsDeleting(true);
      setError(null);
      setDeleteResult(null);

      console.log("🗑️ Iniciando exclusão do usuário:", { userId, userEmail, softDelete });

      // Buscar token de autenticação para a requisição segura
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: { 
          userId,
          forceDelete: true, // Sempre forçar delete para contornar erros menores
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

      console.log("✅ Usuário processado com sucesso:", data);
      setDeleteResult(data as DeleteResult);

      // Toast detalhado baseado no resultado
      if (softDelete) {
        toast.success('🧹 Dados do usuário limpos (soft delete)', {
          description: `${userEmail} foi resetado. ${data.details.tablesAffected.length} tabelas limpas. Agora é possível reenviar convites.`,
          duration: 6000
        });
      } else {
        const authStatus = data.details.authUserDeleted ? "✅ Auth removido" : "⚠️ Auth mantido";
        const profileStatus = data.details.profileDeleted ? "✅ Perfil removido" : "⚠️ Perfil mantido";
        
        toast.success('💥 Usuário excluído completamente', {
          description: `${userEmail} foi removido. ${authStatus}, ${profileStatus}. ${data.details.tablesAffected.length} tabelas limpas.`,
          duration: 8000
        });
      }

      // Toast adicional com detalhes técnicos se houver erros
      if (data.details.errors.length > 0) {
        toast.warning('⚠️ Exclusão com avisos', {
          description: `${data.details.errors.length} avisos durante a exclusão. Verifique os logs para detalhes.`,
          duration: 5000
        });
        console.warn("Erros durante exclusão:", data.details.errors);
      }

      return true;
    } catch (err: any) {
      console.error('❌ Erro ao processar usuário:', err);
      setError(err);
      
      toast.error('❌ Erro ao processar usuário', {
        description: err.message || 'Não foi possível processar o usuário. Verifique os logs e tente novamente.',
        duration: 10000
      });
      
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  // Função para verificar se um usuário pode receber novos convites
  const canReceiveNewInvite = (email: string): Promise<boolean> => {
    return new Promise(async (resolve) => {
      try {
        // Verificar se existe convite pendente
        const { data: existingInvite } = await supabase
          .from('invites')
          .select('id, used_at, expires_at')
          .eq('email', email)
          .is('used_at', null)
          .gt('expires_at', new Date().toISOString())
          .maybeSingle();

        if (existingInvite) {
          console.log("❌ Convite pendente encontrado:", existingInvite);
          resolve(false);
          return;
        }

        // Verificar se usuário ainda existe no sistema
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('email', email)
          .maybeSingle();

        if (existingProfile) {
          console.log("❌ Usuário ainda existe no sistema:", existingProfile);
          resolve(false);
          return;
        }

        console.log("✅ Email limpo, pode receber novo convite");
        resolve(true);
      } catch (error) {
        console.error("Erro ao verificar email:", error);
        resolve(false);
      }
    });
  };

  return {
    deleteUser,
    canReceiveNewInvite,
    isDeleting,
    error,
    deleteResult
  };
};
