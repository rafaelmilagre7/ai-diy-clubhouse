
import { useState, useEffect } from "react";
import { useUsers } from "@/hooks/admin/useUsers";
import { UsersHeader } from "@/components/admin/users/UsersHeader";
import { UsersTable } from "@/components/admin/users/UsersTable";
import { UserRoleManager } from "@/components/admin/users/UserRoleManager";
import { UserProfile } from "@/lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ShieldAlert } from "lucide-react";
import { DeleteUserDialog } from "@/components/admin/users/DeleteUserDialog";
import { ResetPasswordDialog } from "@/components/admin/users/ResetPasswordDialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";

const AdminUsers = () => {
  // Usando diretamente o hook useUsers sem depender do PermissionGuard
  const {
    users,
    availableRoles,
    loading,
    searchQuery,
    setSearchQuery,
    selectedUser,
    setSelectedUser,
    fetchUsers,
    canManageUsers,
    canAssignRoles,
    canDeleteUsers,
    canResetPasswords,
  } = useUsers();

  const { isAdmin } = useAuth();
  const [roleManagerOpen, setRoleManagerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [loadTimeout, setLoadTimeout] = useState(false);

  // Efeito para detectar timeout de carregamento
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        console.log("Timeout atingido no carregamento de usuários");
        setLoadTimeout(true);
        toast.error("Tempo limite excedido ao carregar usuários", {
          description: "Tentando carregar com dados de fallback"
        });
      }, 5000); // 5 segundos de timeout
      
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Efeito para atualizar a lista quando o contador mudar
  useEffect(() => {
    fetchUsers();
  }, [refreshCounter, fetchUsers]);

  const handleEditRole = (user: UserProfile) => {
    setSelectedUser(user);
    setRoleManagerOpen(true);
  };

  const handleDeleteUser = (user: UserProfile) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleResetPassword = (user: UserProfile) => {
    setSelectedUser(user);
    setResetPasswordDialogOpen(true);
  };

  const handleRefresh = () => {
    setRefreshCounter(prev => prev + 1);
    toast.info("Atualizando lista de usuários...");
  };

  // Verificação direta de permissão de admin, sem usar o PermissionGuard
  if (!isAdmin) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Acesso restrito</AlertTitle>
        <AlertDescription>
          Você não tem permissão para visualizar a lista de usuários.
        </AlertDescription>
      </Alert>
    );
  }

  // Se o carregamento demorar demais, mostrar feedback
  if (loading && !loadTimeout) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="animate-spin w-8 h-8 border-4 border-viverblue border-t-transparent rounded-full"></div>
        <div>Carregando usuários...</div>
      </div>
    );
  }

  // Se houve timeout mas o usuário é admin, mostrar interface com aviso
  return (
    <div className="space-y-6">
      {loadTimeout && (
        <div className="flex items-center gap-2 py-2 px-4 bg-amber-50 border border-amber-200 rounded-md mb-4">
          <ShieldAlert className="h-5 w-5 text-amber-600" />
          <p className="text-sm text-amber-700">
            Houve um problema ao verificar permissões específicas, mas o acesso foi concedido devido ao seu papel de administrador.
          </p>
        </div>
      )}
      
      <UsersHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <div className="border rounded-lg">
        <UsersTable
          users={users}
          loading={loading}
          canEditRoles={canAssignRoles || isAdmin}
          canDeleteUsers={canDeleteUsers || isAdmin}
          canResetPasswords={canResetPasswords || isAdmin}
          onEditRole={handleEditRole}
          onDeleteUser={handleDeleteUser}
          onResetPassword={handleResetPassword}
          onRefresh={handleRefresh}
        />
      </div>
      
      {(canAssignRoles || isAdmin) && (
        <UserRoleManager
          open={roleManagerOpen}
          onOpenChange={setRoleManagerOpen}
          user={selectedUser}
          availableRoles={availableRoles}
          onSuccess={() => {
            // Atualizar lista após alterar papel
            setTimeout(() => fetchUsers(), 500);
          }}
        />
      )}
      
      {(canDeleteUsers || isAdmin) && (
        <DeleteUserDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          user={selectedUser}
          onSuccess={fetchUsers}
        />
      )}
      
      {(canResetPasswords || isAdmin) && (
        <ResetPasswordDialog
          open={resetPasswordDialogOpen}
          onOpenChange={setResetPasswordDialogOpen}
          user={selectedUser}
        />
      )}
    </div>
  );
};

export default AdminUsers;
