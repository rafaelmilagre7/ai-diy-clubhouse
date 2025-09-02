
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Search, 
  RefreshCw, 
  UserCheck, 
  UserPlus,
  Shield,
  Crown,
  AlertCircle
} from 'lucide-react';
import { useUsers } from '@/hooks/admin/useUsers';
import { useUserRoles } from '@/hooks/admin/useUserRoles';
import { useRoles, Role } from '@/hooks/admin/useRoles';
import { useDeleteUser } from '@/hooks/admin/useDeleteUser';
import { useToggleUserStatus } from '@/hooks/admin/useToggleUserStatus';
import { UserProfile } from '@/lib/supabase';
import { UsersTable } from '@/components/admin/users/UsersTable';
import { UserRoleDialog } from '@/components/admin/users/UserRoleDialog';
import { DeleteUserDialog } from '@/components/admin/users/DeleteUserDialog';
import { ResetPasswordDialog } from '@/components/admin/users/ResetPasswordDialog';
import { getUserRoleName } from '@/lib/supabase/types';
import { toast } from 'sonner';

export default function AdminUsers() {
  const { 
    users, 
    loading, 
    isRefreshing, 
    searchQuery, 
    setSearchQuery,
    fetchUsers,
    canManageUsers,
    canAssignRoles,
    canDeleteUsers,
    canResetPasswords
  } = useUsers();

  const { assignRoleToUser, isUpdating: isAssigningRole } = useUserRoles();
  const { roles } = useRoles();
  const { deleteUser } = useDeleteUser();
  const { toggleUserStatus } = useToggleUserStatus();
  
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [newRoleId, setNewRoleId] = useState<string>('');
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordResetDialog, setShowPasswordResetDialog] = useState(false);

  // Converter roles do useRoles para o formato esperado
  const availableRoles: Role[] = useMemo(() => {
    return roles.map(role => ({
      ...role,
      permissions: role.permissions || {}
    }));
  }, [roles]);

  // Handlers para todas as ações
  const handleEditRole = (user: UserProfile) => {
    setSelectedUser(user);
    setNewRoleId(user.role_id || '');
    setShowRoleDialog(true);
  };

  const handleDeleteUser = (user: UserProfile) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const handleResetPassword = (user: UserProfile) => {
    setSelectedUser(user);
    setShowPasswordResetDialog(true);
  };

  const handleResetUser = (user: UserProfile) => {
    toast.success(`Funcionalidade de reset do usuário ${user.name || user.email} será implementada em breve.`);
  };

  const handleToggleStatus = async (user: UserProfile) => {
    try {
      const currentStatus = (user.status || 'active') as string;
      await toggleUserStatus(user.id, user.email, currentStatus);
      fetchUsers(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const handleManageCourses = (user: UserProfile) => {
    toast.success(`Gerenciamento de cursos para ${user.name || user.email} será implementado em breve.`);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRoleId) return;
    
    try {
      await assignRoleToUser(selectedUser.id, newRoleId);
      setShowRoleDialog(false);
      setSelectedUser(null);
      setNewRoleId('');
      fetchUsers();
      toast.success('Papel do usuário atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar papel do usuário:', error);
      toast.error('Erro ao atualizar papel do usuário');
    }
  };

  const handleDeleteSuccess = () => {
    setShowDeleteDialog(false);
    setSelectedUser(null);
    fetchUsers();
  };

  if (!canManageUsers) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Acesso Negado</h3>
          <p className="mt-2 text-muted-foreground">
            Você não tem permissão para gerenciar usuários.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie usuários e suas permissões
          </p>
        </div>
        <Button
          onClick={fetchUsers}
          disabled={isRefreshing}
          size="sm"
          variant="outline"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Atualizando...' : 'Atualizar'}
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar usuários..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => getUserRoleName(u) === 'admin').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Formação</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => getUserRoleName(u) === 'formacao').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membros</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => {
                const role = getUserRoleName(u);
                return role === 'membro_club' || role === 'user' || !role;
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table with Cards Layout */}
      <UsersTable
        users={users}
        loading={loading}
        onEditRole={handleEditRole}
        onDeleteUser={handleDeleteUser}
        onResetPassword={handleResetPassword}
        onResetUser={handleResetUser}
        onToggleStatus={handleToggleStatus}
        onManageCourses={handleManageCourses}
        onRefresh={fetchUsers}
        canEditRoles={canAssignRoles}
        canDeleteUsers={canDeleteUsers}
        canResetPasswords={canResetPasswords}
        canResetUsers={canManageUsers}
        canToggleStatus={canManageUsers}
      />

      {/* Dialogs */}
      <UserRoleDialog
        open={showRoleDialog}
        onOpenChange={setShowRoleDialog}
        selectedUser={selectedUser}
        newRoleId={newRoleId}
        onRoleChange={setNewRoleId}
        onUpdateRole={handleUpdateRole}
        saving={isAssigningRole}
        availableRoles={availableRoles}
      />

      <DeleteUserDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        user={selectedUser}
        onSuccess={handleDeleteSuccess}
      />

      <ResetPasswordDialog
        open={showPasswordResetDialog}
        onOpenChange={setShowPasswordResetDialog}
        user={selectedUser}
      />
    </div>
  );
}
