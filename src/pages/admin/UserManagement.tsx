import { useState } from "react";
import { useUsers } from "@/hooks/admin/useUsers";
import { UsersHeader } from "@/components/admin/users/UsersHeader";
import { UsersTable } from "@/components/admin/users/UsersTable";
import { UserRoleManager } from "@/components/admin/users/UserRoleManager";
import { UserResetDialog } from "@/components/admin/users/UserResetDialog";
import { UserProfile } from "@/lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { DeleteUserDialog } from "@/components/admin/users/DeleteUserDialog";
import { ToggleUserStatusDialog } from "@/components/admin/users/ToggleUserStatusDialog";
import { ResetPasswordDialog } from "@/components/admin/users/ResetPasswordDialog";
import { UserCourseAccessManager } from "@/components/admin/users/UserCourseAccessManager";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

const UserManagement = () => {
  const {
    users,
    availableRoles,
    loading,
    isRefreshing,
    searchQuery,
    setSearchQuery,
    selectedUser,
    setSelectedUser,
    fetchUsers,
    canManageUsers,
    canAssignRoles,
    canDeleteUsers,
    canResetPasswords,
    error
  } = useUsers();

  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  
  const [roleManagerOpen, setRoleManagerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [resetUserDialogOpen, setResetUserDialogOpen] = useState(false);
  const [toggleStatusDialogOpen, setToggleStatusDialogOpen] = useState(false);
  const [courseAccessDialogOpen, setCourseAccessDialogOpen] = useState(false);

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

  const handleResetUser = (user: UserProfile) => {
    setSelectedUser(user);
    setResetUserDialogOpen(true);
  };

  const handleToggleStatus = (user: UserProfile) => {
    setSelectedUser(user);
    setToggleStatusDialogOpen(true);
  };

  const handleManageCourses = (user: UserProfile) => {
    setSelectedUser(user);
    setCourseAccessDialogOpen(true);
  };

  const handleRefresh = () => {
    toast.info("Atualizando lista de usuários...");
    fetchUsers();
  };

  const handleForceRefresh = async () => {
    toast.info("Forçando atualização dos dados...");
    // Invalidar todas as queries relacionadas a usuários
    await queryClient.invalidateQueries({ queryKey: ['users'] });
    await queryClient.invalidateQueries({ queryKey: ['user-roles'] });
    await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    fetchUsers();
  };

  // Verificação de acesso usando o contexto de auth
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

  // Loading state
  if (loading && !users.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="animate-spin w-8 h-8 border-4 border-viverblue border-t-transparent rounded-full"></div>
        <div className="text-foreground font-medium">Carregando usuários...</div>
        <div className="text-sm text-muted-foreground">
          Isso pode levar alguns instantes.
        </div>
      </div>
    );
  }

  // Error state
  if (error && !users.length) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar usuários</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>Ocorreu um problema ao carregar a lista de usuários:</p>
          <p className="font-mono text-sm bg-destructive/10 p-2 rounded">
            {error.message}
          </p>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleRefresh} variant="outline" disabled={isRefreshing}>
              {isRefreshing ? (
                <>
                  <RefreshCw className="animate-spin mr-2 h-4 w-4" /> Atualizando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" /> Tentar novamente
                </>
              )}
            </Button>
            
            <Button onClick={handleForceRefresh} variant="default">
              Recarregar página
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <UsersHeader 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />
      
      <div className="border rounded-lg">
        <UsersTable 
          users={users}
          loading={loading}
          canEditRoles={canAssignRoles}
          canDeleteUsers={canDeleteUsers}
          canResetPasswords={canResetPasswords}
          onEditRole={handleEditRole}
          onDeleteUser={handleDeleteUser}
          onResetPassword={handleResetPassword}
           onResetUser={handleResetUser}
           onToggleStatus={handleToggleStatus}
           onManageCourses={handleManageCourses}
           onRefresh={handleRefresh}
           canResetUsers={canManageUsers}
           canToggleStatus={canManageUsers}
         />
      </div>
      
      {users.length > 0 && !isRefreshing && (
        <div className="text-sm text-muted-foreground text-right">
          {users.length} usuários carregados
        </div>
      )}
      
      {/* Diálogos */}
      {canAssignRoles && (
        <UserRoleManager 
          open={roleManagerOpen}
          onOpenChange={setRoleManagerOpen}
          user={selectedUser}
          availableRoles={availableRoles}
          onSuccess={() => {
            setTimeout(() => fetchUsers(), 500);
          }}
        />
      )}
      
      {canDeleteUsers && (
        <DeleteUserDialog 
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          user={selectedUser}
          onSuccess={fetchUsers}
        />
      )}
      
      {canResetPasswords && (
        <ResetPasswordDialog 
          open={resetPasswordDialogOpen}
          onOpenChange={setResetPasswordDialogOpen}
          user={selectedUser}
        />
      )}
      
      {canManageUsers && (
        <ToggleUserStatusDialog 
          open={toggleStatusDialogOpen}
          onOpenChange={setToggleStatusDialogOpen}
          user={selectedUser}
          onSuccess={fetchUsers}
        />
      )}

      <UserResetDialog 
        open={resetUserDialogOpen}
        onOpenChange={setResetUserDialogOpen}
        user={selectedUser}
        onSuccess={() => {
          setTimeout(() => fetchUsers(), 500);
        }}
      />

      {selectedUser && (
        <UserCourseAccessManager
          isOpen={courseAccessDialogOpen}
          onClose={() => setCourseAccessDialogOpen(false)}
          user={selectedUser}
        />
      )}
    </div>
  );
};

export default UserManagement;
