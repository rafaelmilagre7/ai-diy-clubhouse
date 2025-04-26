
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { isSuperAdmin } from "@/contexts/auth/utils/profileUtils/roleValidation";
import { useUsers } from "@/hooks/admin/useUsers";
import { UsersHeader } from "@/components/admin/users/UsersHeader";
import { UsersTable } from "@/components/admin/users/UsersTable";
import { UserRoleDialog } from "@/components/admin/users/UserRoleDialog";
import { UserProfile } from "@/lib/supabase";

const AdminUsers = () => {
  const { user } = useAuth();
  const {
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
  } = useUsers();

  const [isAdminMaster, setIsAdminMaster] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setIsAdminMaster(isSuperAdmin(user.email));
    }
  }, [user]);

  const handleEditRole = (user: UserProfile) => {
    setSelectedUser(user);
    setNewRole(user.role as 'admin' | 'member');
    setEditRoleOpen(true);
  };

  // Função para garantir que o modal seja fechado corretamente
  const handleCloseModal = useCallback(() => {
    console.log('Fechando modal através do handleCloseModal');
    setEditRoleOpen(false);
    
    // Limpar backdrops persistentes após um pequeno delay
    setTimeout(() => {
      const backdrops = document.querySelectorAll('.bg-black[data-state="open"], .MuiBackdrop-root');
      backdrops.forEach(el => {
        if (el.parentNode) {
          console.log('Removendo backdrop persistente');
          el.parentNode.removeChild(el);
        }
      });
      
      // Restaurar scroll se necessário
      if (document.body.style.overflow === 'hidden') {
        document.body.style.overflow = '';
      }
    }, 150);
  }, [setEditRoleOpen]);

  return (
    <div className="space-y-6">
      <UsersHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={fetchUsers}
        loading={loading}
      />
      
      <div className="border rounded-lg">
        <UsersTable
          users={users}
          loading={loading}
          isAdminMaster={isAdminMaster}
          onEditRole={handleEditRole}
        />
      </div>
      
      {/* O modal deve ser renderizado apenas quando necessário */}
      {editRoleOpen && (
        <UserRoleDialog
          open={editRoleOpen}
          onOpenChange={handleCloseModal}
          selectedUser={selectedUser}
          newRole={newRole}
          onRoleChange={(value) => setNewRole(value as 'admin' | 'member')}
          onUpdateRole={handleUpdateRole}
          saving={saving}
        />
      )}
    </div>
  );
};

export default AdminUsers;
