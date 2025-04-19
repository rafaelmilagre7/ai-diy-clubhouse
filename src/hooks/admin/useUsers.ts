
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "@/lib/supabase";

export const useUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [newRole, setNewRole] = useState<string>("");
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
      
      setUsers(data || []);
      setFilteredUsers(data || []);
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

  useEffect(() => {
    fetchUsers();
  }, [toast]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = users.filter(user => 
      (user.name || "").toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.company_name || "").toLowerCase().includes(query) ||
      (user.industry || "").toLowerCase().includes(query)
    );
    
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

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
      
      await supabase.auth.admin.updateUserById(selectedUser.id, {
        user_metadata: { role: newRole }
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

  return {
    users: filteredUsers,
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
