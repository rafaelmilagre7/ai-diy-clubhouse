
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: any;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('name');

      if (error) throw error;

      setRoles((data as any) || []);
    } catch (error) {
      console.error('Erro ao buscar papéis:', error);
      toast({
        title: "Erro ao carregar papéis",
        description: "Ocorreu um erro ao carregar a lista de papéis.",
        variant: "destructive",
      });
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createRole = async (roleData: Omit<Role, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setIsCreating(true);
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          ...roleData,
          permissions: roleData.permissions || {}
        } as any)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Papel criado",
        description: `O papel "${roleData.name}" foi criado com sucesso.`,
      });

      await fetchRoles();
      return data;
    } catch (error: any) {
      console.error('Erro ao criar papel:', error);
      toast({
        title: "Erro ao criar papel",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const updateRole = async (roleId: string, updates: Partial<Role>) => {
    try {
      setIsUpdating(true);
      const { data, error } = await supabase
        .from('user_roles')
        .update(updates as any)
        .eq('id', roleId as any)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Papel atualizado",
        description: "O papel foi atualizado com sucesso.",
      });

      await fetchRoles();
      return data;
    } catch (error: any) {
      console.error('Erro ao atualizar papel:', error);
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

  const deleteRole = async (roleId: string) => {
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId as any);

      if (error) throw error;

      toast({
        title: "Papel excluído",
        description: "O papel foi removido com sucesso.",
      });

      await fetchRoles();
    } catch (error: any) {
      console.error('Erro ao excluir papel:', error);
      toast({
        title: "Erro ao excluir papel",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    roles,
    loading,
    isCreating,
    isUpdating,
    isDeleting,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole
  };
};
