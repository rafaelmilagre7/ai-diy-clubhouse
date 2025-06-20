
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export const useUserRoles = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const updateUserRole = async (userId: string, roleId: string) => {
    try {
      setIsUpdating(true);

      const { error } = await supabase
        .from('profiles')
        .update({ role_id: roleId } as any)
        .eq('id', userId as any);

      if (error) throw error;

      toast({
        title: "Papel atualizado",
        description: "O papel do usuário foi atualizado com sucesso.",
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar papel do usuário:', error);
      toast({
        title: "Erro ao atualizar papel",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const assignRoleToUser = async (userId: string, roleId: string) => {
    return await updateUserRole(userId, roleId);
  };

  const getUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          role_id,
          user_roles (
            id,
            name,
            description
          )
        `)
        .eq('id', userId as any)
        .single();

      if (error) throw error;

      const profile = data as any;
      return {
        roleId: profile.role_id,
        roleName: profile.user_roles?.name || null,
        roleDescription: profile.user_roles?.description || null
      };
    } catch (error: any) {
      console.error('Erro ao buscar papel do usuário:', error);
      return {
        roleId: null,
        roleName: null,
        roleDescription: null
      };
    }
  };

  return { 
    updateUserRole, 
    assignRoleToUser, 
    getUserRole, 
    isUpdating 
  };
};
