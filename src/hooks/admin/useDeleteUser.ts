
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { showModernLoading, showModernSuccess, showModernError, showModernWarning, dismissModernToast } from '@/lib/toast-helpers';

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

  const deleteUser = async (userId: string, userEmail: string, softDelete: boolean = false, isCompleteDelete: boolean = true) => {
    const loadingToastId = showModernLoading(
      'Excluindo usuário',
      `Removendo ${userEmail} da plataforma...`
    );
    
    try {
      setIsDeleting(true);
      setError(null);
      setDeleteResult(null);

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
          userEmail,
          forceDelete: true, // Sempre forçar delete 
          softDelete,
          isCompleteDelete, // Nova opção para exclusão completa
          deleteFromAuth: isCompleteDelete // Deletar também do sistema de auth
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

      setDeleteResult(data as DeleteResult);
      dismissModernToast(loadingToastId);

      // Toast detalhado baseado no resultado
      if (isCompleteDelete && !softDelete) {
        const authStatus = data.details.authUserDeleted ? "Auth removido" : "Auth mantido";
        const profileStatus = data.details.profileDeleted ? "Perfil excluído" : "Perfil mantido";
        
        showModernSuccess(
          '🔥 Usuário excluído completamente!',
          `${userEmail} foi removido totalmente. ${authStatus}, ${profileStatus}. ${data.details.tablesAffected.length} tabelas limpas. Email liberado!`,
          { duration: 10000 }
        );
      } else if (softDelete) {
        showModernSuccess(
          '🧹 Dados limpos (soft delete)',
          `${userEmail} foi resetado. ${data.details.tablesAffected.length} tabelas limpas.`,
          { duration: 6000 }
        );
      } else {
        const authStatus = data.details.authUserDeleted ? "Auth removido" : "Auth mantido";
        const profileStatus = data.details.profileDeleted ? "Perfil removido" : "Perfil mantido";
        
        showModernSuccess(
          '💥 Usuário processado',
          `${userEmail} processado. ${authStatus}, ${profileStatus}. ${data.details.tablesAffected.length} tabelas limpas.`,
          { duration: 8000 }
        );
      }

      // Toast adicional com detalhes técnicos se houver erros
      if (data.details.errors.length > 0) {
        showModernWarning(
          'Exclusão com avisos',
          `${data.details.errors.length} avisos durante exclusão. Verifique logs.`,
          { duration: 5000 }
        );
      }

      return true;
    } catch (err: any) {
      console.error('❌ Erro ao processar usuário:', err);
      setError(err);
      
      dismissModernToast(loadingToastId);
      showModernError(
        'Erro ao processar usuário',
        err.message || 'Não foi possível processar. Verifique os logs.',
        { duration: 8000 }
      );
      
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
          resolve(false);
          return;
        }

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
