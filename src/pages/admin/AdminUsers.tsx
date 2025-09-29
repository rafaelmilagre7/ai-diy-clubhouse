
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle,
  RefreshCw, 
  Download,
  Users,
  Crown
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
import { MasterHierarchyCard } from '@/components/admin/users/MasterHierarchyCard';
import { getUserRoleName } from '@/lib/supabase/types';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminUsers() {
  const { 
    users, 
    stats,
    loading, 
    isRefreshing, 
    searchQuery, 
    setSearchQuery,
    selectedUser,
    setSelectedUser,
    fetchUsers,
    // Estados de lazy loading
    showUsers,
    currentFilter,
    handleFilterByType,
    clearFilters,
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
  
  const [newRoleId, setNewRoleId] = useState<string>('');
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordResetDialog, setShowPasswordResetDialog] = useState(false);
  const [showCourseManagerDialog, setShowCourseManagerDialog] = useState(false);

  // Converter roles do useRoles para o formato esperado
  const availableRoles: Role[] = useMemo(() => {
    return roles.map(role => ({
      ...role,
      permissions: role.permissions || {}
    }));
  }, [roles]);

  // Separar masters dos outros usuários para visualização hierárquica baseada em master_email
  const { masterUsers, regularUsers, masterGroupsWithMembers } = useMemo(() => {
    // Masters são usuários que têm outros apontando para seu email
    const masterEmails = new Set(users.filter(u => (u as any).master_email).map(u => (u as any).master_email));
    const masters = users.filter(u => masterEmails.has(u.email));
    const regulars = users.filter(u => !masterEmails.has(u.email) && !(u as any).master_email);
    
    // Para o filtro master, agrupamos masters com seus membros por master_email
    const masterGroups = masters.map(master => {
      const teamMembers = users.filter(u => 
        (u as any).master_email === master.email && u.id !== master.id
      );
      return { master, teamMembers };
    });
    
    return { 
      masterUsers: masters, 
      regularUsers: regulars,
      masterGroupsWithMembers: masterGroups
    };
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

      {/* Estatísticas Clicáveis */}
      <EnhancedUserStats 
        stats={stats} 
        loading={loading} 
        onFilterClick={handleFilterByType}
      />

      {/* Filtros Simplificados */}
      <AdvancedUserFilters
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        showUsers={showUsers}
        currentFilter={currentFilter}
        onClearFilters={clearFilters}
      />

      {/* Área de exibição de usuários */}
      {showUsers ? (
        <div className="space-y-6">
          {/* Results count and pagination info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                Mostrando {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalUsers)} de {totalUsers} usuários
              </p>
                <Badge variant="secondary" className="text-xs">
                 Filtro: {currentFilter === 'master' ? 'Masters' : 
                          currentFilter === 'team_member' ? 'Membros de Equipe' : 
                          currentFilter === 'onboarding_completed' ? 'Onboarding Completo' :
                          currentFilter === 'onboarding_pending' ? 'Onboarding Pendente' :
                          currentFilter === 'all' ? 'Todos' : currentFilter}
                </Badge>
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

          {/* Visualização específica para Masters */}
          {currentFilter === 'master' && masterGroupsWithMembers.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                Masters e suas Equipes ({masterGroupsWithMembers.length} masters, {users.length - masterGroupsWithMembers.length} membros)
              </h3>
              <div className="grid gap-4">
                {masterGroupsWithMembers.map(({ master, teamMembers }) => (
                  <MasterHierarchyCard
                    key={master.id}
                    master={master}
                    teamMembers={teamMembers}
                    onEditUser={handleEditRole}
                    onManageTeam={(master) => {
                      console.log('Gerenciar equipe do master:', master.name);
                      // Implementar ação específica para gerenciar equipe
                    }}
                  />
                ))}
              </div>
              {masterGroupsWithMembers.length > 0 && (
                <div className="text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-2">
                    <div className="text-blue-600 mt-0.5">💡</div>
                    <div>
                      <p className="font-medium text-blue-800 mb-1">
                        Visualização Hierárquica:
                      </p>
                      <p className="text-blue-700">
                        Este filtro exibe todos os masters com seus respectivos membros de equipe organizados hierarquicamente. 
                        Expanda cada card do master para ver os detalhes de sua equipe.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Tabela padrão para outros filtros */
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
          )}
        </div>
      ) : (
        /* Estado inicial - sem usuários carregados */
        <Card className="surface-elevated border-0 shadow-aurora">
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Nenhum filtro ativo</h3>
              <p className="text-muted-foreground mb-4">
                Clique nos números das estatísticas acima para filtrar e visualizar usuários
              </p>
              <div className="flex justify-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleFilterByType('all')}
                >
                  Ver todos os usuários
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleFilterByType('master')}
                >
                  Ver masters e equipes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
