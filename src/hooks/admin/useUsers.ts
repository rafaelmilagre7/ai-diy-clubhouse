
import { useState, useEffect, useCallback } from 'react';
import { supabase, UserProfile } from '@/lib/supabase';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useUsers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [newRole, setNewRole] = useState<'admin' | 'member'>('member');
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();
  
  // Usar React Query para buscar usuários com cache otimizado
  const { 
    data: users = [], 
    isLoading: loading,
    refetch: fetchUsers
  } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data as UserProfile[];
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
  });

  // Usar mutation para atualizar papel do usuário
  const updateUserRole = useMutation({
    mutationFn: async ({ 
      userId, 
      role 
    }: { 
      userId: string; 
      role: 'admin' | 'member'; 
    }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", userId);
      
      if (error) throw error;
      
      return { userId, role };
    },
    onSuccess: (data) => {
      // Invalidar queries para forçar atualização dos dados
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      
      // Fechar modal primeiro
      setEditRoleOpen(false);
      
      // Mostrar toast após fechar modal
      toast.success("Função atualizada", {
        description: `A função do usuário foi atualizada para ${
          data.role === "admin" ? "Administrador" : "Membro"
        }.`
      });
    },
    onError: (error: any) => {
      // Fechar modal antes de mostrar erro
      setEditRoleOpen(false);
      
      toast.error("Erro ao atualizar função", {
        description: error.message || "Não foi possível atualizar a função do usuário."
      });
    },
    onSettled: () => {
      setSaving(false);
    }
  });

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole || newRole === selectedUser.role || saving) {
      setEditRoleOpen(false);
      return;
    }
    
    setSaving(true);
    updateUserRole.mutate({
      userId: selectedUser.id,
      role: newRole
    });
  };

  return {
    users,
    loading,
    searchQuery,
    setSearchQuery,
    fetchUsers,
    selectedUser,
    setSelectedUser,
    editRoleOpen,
    setEditRoleOpen,
    newRole,
    setNewRole,
    saving,
    handleUpdateRole,
  };
};
