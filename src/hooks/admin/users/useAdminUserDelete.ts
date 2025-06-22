
import { useState } from "react";
import { toast } from "sonner";
import { adminForceDeleteUser } from "@/utils/adminForceDeleteUser";

export const useAdminUserDelete = () => {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteUser = async (userId: string, userEmail: string) => {
    try {
      setIsDeleting(true);
      
      console.log(`🗑️ [ADMIN DELETE] Iniciando exclusão total para: ${userEmail}`);
      
      // Usar a função real de exclusão total
      const result = await adminForceDeleteUser(userEmail);
      
      if (result.success) {
        toast.success('✅ Usuário removido completamente!', {
          description: `${result.message} - ${result.details.total_records_deleted} registros removidos`,
          duration: 5000
        });
        
        console.log('✅ Exclusão total concluída:', result);
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
