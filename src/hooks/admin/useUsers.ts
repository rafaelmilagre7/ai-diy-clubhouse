
import { useState, useEffect } from 'react';
import { supabase, UserProfile } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const useUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [newRole, setNewRole] = useState<'admin' | 'member'>('member');
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setUsers(data as UserProfile[]);
    } catch (error: any) {
      console.error("Erro ao buscar usuários:", error.message);
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole || newRole === selectedUser.role) {
      setEditRoleOpen(false);
      return;
    }
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", selectedUser.id);
      
      if (error) throw error;
      
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === selectedUser.id ? { ...user, role: newRole } : user
        )
      );
      
      toast({
        title: "Função atualizada",
        description: `A função do usuário ${selectedUser.name || selectedUser.email} foi atualizada para ${newRole === "admin" ? "Administrador" : "Membro"}.`,
      });
    } catch (error: any) {
      console.error("Erro ao atualizar função:", error.message);
      toast({
        title: "Erro ao atualizar função",
        description: error.message || "Não foi possível atualizar a função do usuário.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
      setEditRoleOpen(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
