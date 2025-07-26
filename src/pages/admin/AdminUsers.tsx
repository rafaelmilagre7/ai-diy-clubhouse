import { useState } from "react";
import { useUsers } from "@/hooks/admin/useUsers";
import { UsersHeader } from "@/components/admin/users/UsersHeader";
import { UsersTable } from "@/components/admin/users/UsersTable";
import { UserRoleManager } from "@/components/admin/users/UserRoleManager";
import { UserResetDialog } from "@/components/admin/users/UserResetDialog";
import { UserProfile } from "@/lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, Users, Plus } from "lucide-react";
import { DeleteUserDialog } from "@/components/admin/users/DeleteUserDialog";
import { ResetPasswordDialog } from "@/components/admin/users/ResetPasswordDialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import { useQueryClient } from "@tanstack/react-query";

// Novos componentes do design system
import { AdminPageLayout } from "@/components/admin/layout/AdminPageLayout";
import { AdminBreadcrumb } from "@/components/admin/ui/AdminBreadcrumb";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { AdminStats } from "@/components/admin/ui/AdminStats";
import { AdminFilters } from "@/components/admin/ui/AdminFilters";

const AdminUsers = () => {
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
  const [filterRole, setFilterRole] = useState('');

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

  const handleRefresh = () => {
    toast.info("Atualizando lista de usuários...");
    fetchUsers();
  };

  const handleForceRefresh = async () => {
    toast.info("Forçando atualização dos dados...");
    await queryClient.invalidateQueries({ queryKey: ['users'] });
    await queryClient.invalidateQueries({ queryKey: ['user-roles'] });
    await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    fetchUsers();
  };

  // Verificação de acesso usando o contexto de auth
  if (!isAdmin) {
    return (
      <AdminPageLayout>
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acesso restrito</AlertTitle>
          <AlertDescription>
            Você não tem permissão para visualizar a lista de usuários.
          </AlertDescription>
        </Alert>
      </AdminPageLayout>
    );
  }

  // Loading state
  if (loading && !users.length) {
    return (
      <AdminPageLayout
        title="Usuários"
        subtitle="Gerencie usuários e permissões do sistema"
        icon={<Users />}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <AdminStats
              key={i}
              title="Carregando..."
              value="..."
              loading={true}
            />
          ))}
        </div>
      </AdminPageLayout>
    );
  }

  // Error state
  if (error && !users.length) {
    return (
      <AdminPageLayout
        title="Usuários"
        subtitle="Gerencie usuários e permissões do sistema"
        icon={<Users />}
        breadcrumb={<AdminBreadcrumb />}
      >
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar usuários</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>Ocorreu um problema ao carregar a lista de usuários:</p>
            <p className="font-mono text-sm bg-destructive/10 p-2 rounded">
              {error.message}
            </p>
            <div className="flex gap-2 mt-4">
              <AdminButton 
                icon={<RefreshCw />}
                onClick={handleRefresh} 
                variant="outline" 
                loading={isRefreshing}
                loadingText="Atualizando..."
              >
                Tentar novamente
              </AdminButton>
              
              <AdminButton onClick={handleForceRefresh}>
                Recarregar página
              </AdminButton>
            </div>
          </AlertDescription>
        </Alert>
      </AdminPageLayout>
    );
  }

  // Estatísticas dos usuários
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.user_roles?.name !== 'inactive').length;
  const adminUsers = users.filter(user => 
    user.user_roles?.name === 'admin' || user.email?.includes('@viverdeia.ai')
  ).length;
  const onboardingCompleted = users.filter(user => user.onboarding_completed).length;

  // Filtros
  const filterConfigs = [
    {
      key: 'search',
      label: 'Buscar',
      type: 'search' as const,
      placeholder: 'Buscar por nome ou email...'
    },
    {
      key: 'role',
      label: 'Role',
      type: 'select' as const,
      options: availableRoles.map(role => ({
        label: role.name,
        value: role.id
      }))
    }
  ];

  const filterValues = {
    search: searchQuery,
    role: filterRole
  };

  const handleFilterChange = (key: string, value: any) => {
    if (key === 'search') {
      setSearchQuery(value);
    } else if (key === 'role') {
      setFilterRole(value);
    }
  };

  const handleFilterReset = () => {
    setSearchQuery('');
    setFilterRole('');
  };

  const filteredUsers = users.filter(user => {
    if (filterRole && user.role_id !== filterRole) return false;
    return true;
  });

  return (
    <AdminPageLayout
      title="Usuários"
      subtitle={`Gerencie ${totalUsers} usuários e suas permissões no sistema`}
      icon={<Users />}
      breadcrumb={<AdminBreadcrumb />}
      actions={
        <div className="flex items-center gap-2">
          <AdminButton
            icon={<RefreshCw />}
            variant="outline"
            onClick={handleRefresh}
            loading={isRefreshing}
            loadingText="Atualizando..."
          >
            Atualizar
          </AdminButton>
          
          <AdminButton
            icon={<Plus />}
            onClick={() => {/* TODO: Implementar criação de usuário */}}
          >
            Novo Usuário
          </AdminButton>
        </div>
      }
    >
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStats
          title="Total de Usuários"
          value={totalUsers}
          icon={<Users />}
          change={{
            value: 12,
            period: 'últimos 30 dias',
            trend: 'up'
          }}
        />
        
        <AdminStats
          title="Usuários Ativos"
          value={activeUsers}
          icon={<Users />}
          variant="success"
          change={{
            value: 8,
            period: 'últimos 30 dias',
            trend: 'up'
          }}
        />
        
        <AdminStats
          title="Administradores"
          value={adminUsers}
          icon={<Users />}
          variant="warning"
        />
        
        <AdminStats
          title="Onboarding Completo"
          value={`${Math.round((onboardingCompleted / totalUsers) * 100)}%`}
          icon={<Users />}
          variant="info"
          change={{
            value: 15,
            period: 'últimos 30 dias',
            trend: 'up'
          }}
        />
      </div>

      {/* Filtros */}
      <AdminFilters
        filters={filterConfigs}
        values={filterValues}
        onChange={handleFilterChange}
        onReset={handleFilterReset}
        compact={true}
      />

      {/* Tabela de usuários */}
      <div className="border rounded-lg">
        <UsersTable 
          users={filteredUsers}
          loading={loading}
          canEditRoles={canAssignRoles}
          canDeleteUsers={canDeleteUsers}
          canResetPasswords={canResetPasswords}
          onEditRole={handleEditRole}
          onDeleteUser={handleDeleteUser}
          onResetPassword={handleResetPassword}
          onResetUser={handleResetUser}
          onRefresh={handleRefresh}
        />
      </div>
      
      {users.length > 0 && !isRefreshing && (
        <div className="text-sm text-muted-foreground text-right">
          {filteredUsers.length} de {users.length} usuários
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

      <UserResetDialog 
        open={resetUserDialogOpen}
        onOpenChange={setResetUserDialogOpen}
        user={selectedUser}
        onSuccess={() => {
          setTimeout(() => fetchUsers(), 500);
        }}
      />
    </AdminPageLayout>
  );
};

export default AdminUsers;
