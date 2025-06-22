
import { useState } from "react";
import { toast } from "sonner";
import { adminForceDeleteUser, type AdminForceDeleteResult } from "@/utils/adminForceDeleteUser";

export const useAdminUserDelete = () => {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteUser = async (userId: string, userEmail: string): Promise<boolean> => {
    try {
      setIsDeleting(true);
      
      console.log(`🗑️ [ADMIN DELETE] Iniciando exclusão total para: ${userEmail}`);
      
      // Usar a função unificada que chama a nova SQL function
      const result: AdminForceDeleteResult = await adminForceDeleteUser(userEmail);
      
      if (result.success) {
        const details = result.details;
        
        // Toast de sucesso com detalhes
        toast.success('✅ Usuário removido completamente!', {
          description: `${result.message} - ${details.total_records_deleted} registros removidos em ${details.affected_tables.length} tabelas`,
          duration: 8000
        });
        
        // Log detalhado para admin
        console.log('✅ Exclusão total concluída:', {
          email: userEmail,
          backupRecords: details.backup_records,
          affectedTables: details.affected_tables,
          authUserDeleted: details.auth_user_deleted,
          totalDeleted: details.total_records_deleted,
          timestamp: details.operation_timestamp
        });

        // Mostrar warnings se houver
        if (details.error_count > 0) {
          console.warn('⚠️ Avisos durante a exclusão:', details.error_messages);
          toast.warning('⚠️ Exclusão concluída com avisos', {
            description: `${details.error_count} avisos encontrados. Verifique o console para detalhes.`,
            duration: 6000
          });
        }
        
        // Aviso específico se auth.users não foi excluído
        if (!details.auth_user_deleted) {
          toast.info('ℹ️ Atenção: Exclusão de auth.users', {
            description: 'Usuário removido do sistema público. Para remover de auth.users, acesse o Dashboard do Supabase.',
            duration: 10000
          });
        }
        
        return true;
      } else {
        toast.error('❌ Erro na exclusão total', {
          description: result.message,
          duration: 8000
        });
        
        console.error('❌ Falha na exclusão total:', result);
        return false;
      }
    } catch (error: any) {
      console.error('❌ Erro ao excluir usuário:', error);
      toast.error("❌ Erro ao excluir usuário", {
        description: error.message || "Erro desconhecido",
        duration: 8000
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteUser,
    isDeleting
  };
};
