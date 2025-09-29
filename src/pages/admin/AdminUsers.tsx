
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Search, 
  RefreshCw, 
  UserCheck, 
  UserPlus,
  Shield,
  Crown,
  AlertCircle,
  Download,
  Building2,
  UserCog,
  Filter
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
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedOrganization, setSelectedOrganization] = useState<string>('all');

  // Converter roles do useRoles para o formato esperado
  const availableRoles: Role[] = useMemo(() => {
    return roles.map(role => ({
      ...role,
      permissions: role.permissions || {}
    }));
  }, [roles]);

  // Calcular estatísticas hierárquicas
  const hierarchicalStats = useMemo(() => {
    const masters = users.filter(u => u.is_master_user);
    const teamMembers = users.filter(u => !u.is_master_user && u.organization_id);
    const individuals = users.filter(u => !u.organization_id);
    const organizations = [...new Set(users.filter(u => u.organization_id).map(u => u.organization_id))];
    
    return {
      masters: masters.length,
      teamMembers: teamMembers.length,
      individuals: individuals.length,
      organizations: organizations.length,
      totalUsers: users.length
    };
  }, [users]);

  // Filtrar usuários baseado nos filtros selecionados
  const filteredUsers = useMemo(() => {
    let filtered = users;

    if (filterType !== 'all') {
      switch (filterType) {
        case 'masters':
          filtered = filtered.filter(u => u.is_master_user);
          break;
        case 'team_members':
          filtered = filtered.filter(u => !u.is_master_user && u.organization_id);
          break;
        case 'individuals':
          filtered = filtered.filter(u => !u.organization_id);
          break;
      }
    }

    if (selectedOrganization !== 'all') {
      filtered = filtered.filter(u => u.organization_id === selectedOrganization);
    }

    return filtered;
  }, [users, filterType, selectedOrganization]);

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

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar usuários..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os usuários</SelectItem>
              <SelectItem value="masters">Masters</SelectItem>
              <SelectItem value="team_members">Membros de equipe</SelectItem>
              <SelectItem value="individuals">Usuários individuais</SelectItem>
            </SelectContent>
          </Select>

          {organizations.length > 0 && (
            <Select value={selectedOrganization} onValueChange={setSelectedOrganization}>
              <SelectTrigger className="w-[200px]">
                <Building2 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por organização" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas organizações</SelectItem>
                {organizations.map(org => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Hierarchical Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="surface-elevated border-0 shadow-aurora">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hierarchicalStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              usuários cadastrados
            </p>
          </CardContent>
        </Card>
        
        <Card className="surface-elevated border-0 shadow-aurora">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Masters</CardTitle>
            <Crown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{hierarchicalStats.masters}</div>
            <p className="text-xs text-muted-foreground">
              líderes de equipe
            </p>
          </CardContent>
        </Card>

        <Card className="surface-elevated border-0 shadow-aurora">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membros de Equipe</CardTitle>
            <UserCog className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{hierarchicalStats.teamMembers}</div>
            <p className="text-xs text-muted-foreground">
              em organizações
            </p>
          </CardContent>
        </Card>

        <Card className="surface-elevated border-0 shadow-aurora">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizações</CardTitle>
            <Building2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{hierarchicalStats.organizations}</div>
            <p className="text-xs text-muted-foreground">
              equipes ativas
            </p>
          </CardContent>
        </Card>

        <Card className="surface-elevated border-0 shadow-aurora">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Individuais</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hierarchicalStats.individuals}</div>
            <p className="text-xs text-muted-foreground">
              sem organização
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Results count and status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Mostrando {filteredUsers.length} de {users.length} usuários
          </p>
          {filterType !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              {filterType === 'masters' && 'Masters'}
              {filterType === 'team_members' && 'Membros de equipe'}
              {filterType === 'individuals' && 'Usuários individuais'}
            </Badge>
          )}
          {selectedOrganization !== 'all' && (
            <Badge variant="outline" className="text-xs">
              {organizations.find(o => o.id === selectedOrganization)?.name}
            </Badge>
          )}
        </div>
      </div>

      {/* Users Table with Cards Layout */}
      <UsersTable
        users={filteredUsers}
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
