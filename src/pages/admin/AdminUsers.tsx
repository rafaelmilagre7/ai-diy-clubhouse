
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

  // Função simplificada para abrir o modal de edição
  const handleEditRole = useCallback((user: UserProfile) => {
    // Limpar overlays existentes primeiro
    cleanupOverlays();
    
    // Configurar e abrir o modal
    setSelectedUser(user);
    setNewRole(user.role as 'admin' | 'member');
    
    // Pequeno delay para garantir limpeza antes de abrir
    setTimeout(() => {
      setEditRoleOpen(true);
    }, 50);
  }, [setSelectedUser, setNewRole, setEditRoleOpen, cleanupOverlays]);

  // Monitorar quando a página carrega para garantir limpeza inicial
  useEffect(() => {
    // Verificação inicial para remover qualquer overlay persistente
    cleanupOverlays();
    
    // Verificar overlays periodicamente (a cada 4 segundos) como garantia
    const cleanupInterval = setInterval(() => {
      const overlays = document.querySelectorAll('.MuiBackdrop-root, [data-state="open"].bg-black, .backdrop, [role="presentation"]');
      if (overlays.length > 0) {
        console.log(`Limpeza periódica: ${overlays.length} overlays encontrados`);
        cleanupOverlays();
      }
    }, 4000);
    
    // Adicionar listener para botões ou cliques que exigem limpeza
    const handleDocumentClick = (e: MouseEvent) => {
      // Verificar se depois de um clique ainda existem backdrops
      setTimeout(() => {
        const overlays = document.querySelectorAll('.MuiBackdrop-root, [data-state="open"].bg-black, .backdrop');
        if (overlays.length > 0 && !editRoleOpen) {
          console.log('Overlay detectado após clique. Limpando...');
          cleanupOverlays();
        }
      }, 300);
    };
    
    document.addEventListener('click', handleDocumentClick);
    
    return () => {
      clearInterval(cleanupInterval);
      document.removeEventListener('click', handleDocumentClick);
      cleanupOverlays();
    };
  }, [cleanupOverlays, editRoleOpen]);

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
      
      {selectedUser && (
        <UserRoleDialog
          open={editRoleOpen}
          onOpenChange={(open) => {
            if (!open) {
              // Se estiver fechando, primeiro limpar overlays
              cleanupOverlays();
              setTimeout(() => {
                setEditRoleOpen(false);
                // Segunda limpeza após fechar completamente
                setTimeout(cleanupOverlays, 100);
              }, 50);
            } else {
              setEditRoleOpen(open);
            }
          }}
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
