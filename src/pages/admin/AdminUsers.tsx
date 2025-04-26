
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
    cleanupOverlays, 
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

  // Função robusta para garantir que o modal seja fechado corretamente
  const handleCloseModal = useCallback(() => {
    console.log('Fechando modal através do handleCloseModal em AdminUsers');
    setEditRoleOpen(false);
    
    // Sequência de limpeza com timeouts para garantir que tudo seja removido
    setTimeout(() => {
      cleanupOverlays();
      
      // Verificação adicional após um tempo para garantir limpeza completa
      setTimeout(() => {
        const remainingBackdrops = document.querySelectorAll('.MuiBackdrop-root, [data-state="open"].bg-black');
        if (remainingBackdrops.length > 0) {
          console.log(`Ainda existem ${remainingBackdrops.length} backdrops. Removendo forçadamente.`);
          remainingBackdrops.forEach(el => el.remove());
        }
        
        // Restaurar scroll e interatividade se necessário
        if (document.body.style.overflow === 'hidden' ||
            document.body.hasAttribute('aria-hidden') ||
            document.body.style.pointerEvents === 'none') {
          document.body.style.overflow = '';
          document.body.style.paddingRight = '';
          document.body.style.pointerEvents = '';
          document.body.removeAttribute('aria-hidden');
          console.log('Restauração forçada da interatividade da página');
        }
      }, 300);
    }, 100);
  }, [setEditRoleOpen, cleanupOverlays]);

  // Garantir limpeza se o componente desmontar enquanto o modal estiver aberto
  useEffect(() => {
    return () => {
      if (editRoleOpen) {
        console.log('AdminUsers desmontado com modal aberto, forçando limpeza');
        setTimeout(cleanupOverlays, 10);
      }
    };
  }, [editRoleOpen, cleanupOverlays]);

  // Verificação adicional para remover qualquer backdrop ou overlay que possa estar travando a página
  useEffect(() => {
    const cleanBodyAfterInteraction = () => {
      // Se houver alguma interação do usuário e ainda tiver backdrops, remove-los
      const backdrops = document.querySelectorAll('.MuiBackdrop-root, [data-state="open"].bg-black');
      if (backdrops.length > 0) {
        console.log('Limpeza forçada após interação do usuário');
        backdrops.forEach(el => el.remove());
        document.body.style.overflow = '';
        document.body.style.pointerEvents = '';
        document.body.removeAttribute('aria-hidden');
      }
    };

    // Adiciona listeners para detectar interação do usuário
    document.addEventListener('click', cleanBodyAfterInteraction);
    document.addEventListener('keydown', cleanBodyAfterInteraction);

    return () => {
      document.removeEventListener('click', cleanBodyAfterInteraction);
      document.removeEventListener('keydown', cleanBodyAfterInteraction);
    };
  }, []);

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
      
      {/* O modal é renderizado condicionalmente */}
      {selectedUser && (
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
