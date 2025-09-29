
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle,
  RefreshCw, 
  Download
} from 'lucide-react';
import { useUsers } from '@/hooks/admin/useUsers';
import { useUserExport } from '@/hooks/admin/useUserExport';
import { useUserRoles } from '@/hooks/admin/useUserRoles';
import { useRoles, Role } from '@/hooks/admin/useRoles';
import { useDeleteUser } from '@/hooks/admin/useDeleteUser';
import { useToggleUserStatus } from '@/hooks/admin/useToggleUserStatus';
import { UserProfile } from '@/lib/supabase';
import { UsersTable } from '@/components/admin/users/UsersTable';
import { UserRoleDialog } from '@/components/admin/users/UserRoleDialog';
import { DeleteUserDialog } from '@/components/admin/users/DeleteUserDialog';
import { ResetPasswordDialog } from '@/components/admin/users/ResetPasswordDialog';
import { UserCourseAccessManager } from '@/components/admin/users/UserCourseAccessManager';
import { AdvancedUserFilters } from '@/components/admin/users/AdvancedUserFilters';
import { EnhancedUserStats } from '@/components/admin/users/EnhancedUserStats';
import { getUserRoleName } from '@/lib/supabase/types';
import { toast } from 'sonner';

export default function AdminUsers() {
  const { 
    users, 
    stats,
    loading, 
    isRefreshing, 
    searchQuery, 
    setSearchQuery,
    filterType,
    setFilterType,
    organizationFilter,
    setOrganizationFilter,
    // Novos filtros avançados
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    onboardingFilter,
    setOnboardingFilter,
    dateFilter,
    setDateFilter,
    fetchUsers,
    // Paginação
    currentPage,
    totalUsers,
    pageSize,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    canGoNext,
    canGoPrev,
    // Permissões
    canManageUsers,
    canAssignRoles,
    canDeleteUsers,
    canResetPasswords
  } = useUsers();

  const { exportUsers, isExporting } = useUserExport();
  const { assignRoleToUser, isUpdating: isAssigningRole } = useUserRoles();
  const { roles } = useRoles();
  const { deleteUser } = useDeleteUser();
  const { toggleUserStatus } = useToggleUserStatus();
  
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [newRoleId, setNewRoleId] = useState<string>('');
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordResetDialog, setShowPasswordResetDialog] = useState(false);
  const [showCourseManagerDialog, setShowCourseManagerDialog] = useState(false);
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);

  // Converter roles do useRoles para o formato esperado
  const availableRoles: Role[] = useMemo(() => {
    return roles.map(role => ({
      ...role,
      permissions: role.permissions || {}
    }));
  }, [roles]);

  // Obter organizações únicas para o filtro
  const organizations = useMemo(() => {
    const orgs = users
      .filter(u => u.organization?.id)
      .map(u => ({ id: u.organization!.id, name: u.organization!.name }))
      .filter((org, index, arr) => arr.findIndex(o => o.id === org.id) === index);
    return orgs;
  }, [users]);

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
    setSelectedUser(user);
    setShowCourseManagerDialog(true);
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
        <div className="flex gap-2">
          <Button
            onClick={() => exportUsers(users, searchQuery)}
            disabled={isExporting || users.length === 0}
            size="sm"
            variant="outline"
          >
            <Download className={`mr-2 h-4 w-4 ${isExporting ? 'animate-pulse' : ''}`} />
            {isExporting ? 'Exportando...' : 'Download'}
          </Button>
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
      </div>

      {/* Filtros Avançados */}
      <AdvancedUserFilters
        userType={filterType}
        onUserTypeChange={setFilterType}
        organizationFilter={organizationFilter}
        onOrganizationFilterChange={setOrganizationFilter}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onboardingFilter={onboardingFilter}
        onOnboardingFilterChange={setOnboardingFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        availableRoles={availableRoles}
        organizations={organizations}
        isCollapsed={filtersCollapsed}
        onToggleCollapse={() => setFiltersCollapsed(!filtersCollapsed)}
      />

      {/* Estatísticas Aprimoradas */}
      <EnhancedUserStats stats={stats} loading={loading} />

      {/* Results count and pagination info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Mostrando {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalUsers)} de {totalUsers} usuários
          </p>
          {(filterType !== 'all' || roleFilter !== 'all' || statusFilter !== 'all' || onboardingFilter !== 'all' || dateFilter !== 'all') && (
            <div className="flex flex-wrap gap-1">
              {filterType !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  {filterType === 'master' && 'Masters'}
                  {filterType === 'team_member' && 'Membros de equipe'}
                  {filterType === 'individual' && 'Usuários individuais'}
                </Badge>
              )}
              {organizationFilter !== 'all' && (
                <Badge variant="outline" className="text-xs">
                  {organizations.find(o => o.id === organizationFilter)?.name}
                </Badge>
              )}
              {roleFilter !== 'all' && (
                <Badge variant="outline" className="text-xs">
                  {availableRoles.find(r => r.id === roleFilter)?.name}
                </Badge>
              )}
              {statusFilter !== 'all' && (
                <Badge variant="outline" className="text-xs">
                  Status: {statusFilter === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              )}
              {onboardingFilter !== 'all' && (
                <Badge variant="outline" className="text-xs">
                  Onboarding: {onboardingFilter === 'completed' ? 'Completo' : 'Pendente'}
                </Badge>
              )}
              {dateFilter !== 'all' && (
                <Badge variant="outline" className="text-xs">
                  Período: {dateFilter}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              onClick={prevPage}
              disabled={!canGoPrev || loading}
              size="sm"
              variant="outline"
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              onClick={nextPage}
              disabled={!canGoNext || loading}
              size="sm"
              variant="outline"
            >
              Próxima
            </Button>
          </div>
        )}
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

      {selectedUser && (
        <UserCourseAccessManager
          isOpen={showCourseManagerDialog}
          onClose={() => setShowCourseManagerDialog(false)}
          user={selectedUser}
        />
      )}
    </div>
  );
}
