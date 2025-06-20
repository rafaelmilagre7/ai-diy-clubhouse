
import { useState } from "react";
import { toast } from "sonner";

export const useAdminUserDelete = () => {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteUser = async (userId: string, userEmail: string) => {
    try {
      setIsDeleting(true);
      
      // Simular exclusão de usuário
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Usuário ${userEmail} removido com sucesso!`);
      return true;
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error);
      toast.error("Erro ao excluir usuário");
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
