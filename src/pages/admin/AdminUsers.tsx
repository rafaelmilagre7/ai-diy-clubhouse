
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

  const handleEditRole = useCallback((user: UserProfile) => {
    // Limpar overlays existentes antes de abrir novo modal
    cleanupOverlays();
    
    // Pequeno timeout para garantir limpeza antes de abrir
    setTimeout(() => {
      setSelectedUser(user);
      setNewRole(user.role as 'admin' | 'member');
      setEditRoleOpen(true);
    }, 50);
  }, [setSelectedUser, setNewRole, setEditRoleOpen, cleanupOverlays]);

  // Função robusta para garantir que o modal seja fechado corretamente
  const handleCloseModal = useCallback(() => {
    console.log('Fechando modal através do handleCloseModal em AdminUsers');
    
    // Primeiro limpamos qualquer backdrop ou overlay
    cleanupOverlays();
    
    // Depois fechamos o modal
    setTimeout(() => {
      setEditRoleOpen(false);
      
      // Verificação adicional para garantir limpeza completa
      setTimeout(() => {
        cleanupOverlays();
        
        // Última verificação para remoção forçada se necessário
        setTimeout(() => {
          const remainingBackdrops = document.querySelectorAll('.MuiBackdrop-root, [data-state="open"].bg-black');
          if (remainingBackdrops.length > 0) {
            console.log(`Ainda existem ${remainingBackdrops.length} backdrops. Remoção forçada.`);
            remainingBackdrops.forEach(el => el.remove());
          }
          
          // Restaurar scroll e interatividade
          document.body.style.overflow = '';
          document.body.style.paddingRight = '';
          document.body.style.pointerEvents = '';
          document.body.removeAttribute('aria-hidden');
        }, 200);
      }, 200);
    }, 50);
  }, [setEditRoleOpen, cleanupOverlays]);

  // Garantir limpeza se o componente desmontar enquanto o modal estiver aberto
  useEffect(() => {
    return () => {
      if (editRoleOpen) {
        console.log('AdminUsers desmontado com modal aberto, forçando limpeza');
        cleanupOverlays();
      }
    };
  }, [editRoleOpen, cleanupOverlays]);

  // Verificar e corrigir problemas de interação após renderização e interações do usuário
  useEffect(() => {
    // Função para verificar e limpar overlays após interações
    const checkAndCleanupAfterInteraction = () => {
      // Verificar se ainda há backdrops após uma interação do usuário
      const backdrops = document.querySelectorAll('.MuiBackdrop-root, [data-state="open"].bg-black');
      if (backdrops.length > 0 || document.body.style.overflow === 'hidden') {
        console.log('Limpeza após interação do usuário detectada');
        cleanupOverlays();
      }
    };
    
    // Listeners para detectar interações
    document.addEventListener('click', checkAndCleanupAfterInteraction);
    document.addEventListener('keydown', checkAndCleanupAfterInteraction);
    
    // Verificação periódica como fallback (a cada 2 segundos)
    const fallbackInterval = setInterval(() => {
      const backdrops = document.querySelectorAll('.MuiBackdrop-root, [data-state="open"].bg-black');
      if (backdrops.length > 0 || document.body.style.overflow === 'hidden') {
        console.log('Limpeza periódica pelo fallback');
        cleanupOverlays();
      }
    }, 2000);
    
    return () => {
      document.removeEventListener('click', checkAndCleanupAfterInteraction);
      document.removeEventListener('keydown', checkAndCleanupAfterInteraction);
      clearInterval(fallbackInterval);
    };
  }, [cleanupOverlays]);

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
      
      {/* O modal é renderizado condicionalmente e com garantias de limpeza */}
      {selectedUser && (
        <UserRoleDialog
          open={editRoleOpen}
          onOpenChange={(open) => {
            if (!open) {
              // Se estiver fechando, limpar overlays primeiro
              cleanupOverlays();
              setTimeout(() => setEditRoleOpen(false), 50);
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
