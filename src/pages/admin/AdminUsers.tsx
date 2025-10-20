
import React, { useState, useMemo } from 'react';
import { AdminButton } from '@/components/admin/ui/AdminButton';
import { AdminCard } from '@/components/admin/ui/AdminCard';
import { AdminStatsCard } from '@/components/admin/ui/AdminStatsCard';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle,
  RefreshCw, 
  Download,
  Users,
  Crown,
  RefreshCcw,
  History,
  CheckCircle,
  Clock
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
import { MasterMemberSyncPanel } from '@/components/master/sync/MasterMemberSyncPanel';
import { ManageTeamDialog } from '@/components/admin/users/ManageTeamDialog';
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
  const [managingMaster, setManagingMaster] = useState<UserProfile | null>(null);

  // Converter roles do useRoles para o formato esperado
  const availableRoles: Role[] = useMemo(() => {
    return roles.map(role => ({
      ...role,
      permissions: role.permissions || {}
    }));
  }, [roles]);

  // ✅ FASE 3: Separar masters usando organization_id ao invés de master_email
  const { masterUsers, regularUsers, masterGroupsWithMembers } = useMemo(() => {
    // Masters são identificados por:
    // 1. is_master_user = true, OU
    // 2. Ter um organization_id e ser o único com esse organization_id (sem membros), OU
    // 3. Ter membros associados à sua organização
    
    const masters = users.filter(u => {
      // Se tem flag de master, é master
      if (u.is_master_user) return true;
      
      // Se tem organization_id, verificar se há membros dessa org
      if (u.organization_id) {
        const orgMembers = users.filter(member => 
          member.organization_id === u.organization_id && member.id !== u.id
        );
        return orgMembers.length > 0;
      }
      
      return false;
    });
    
    // Usuários regulares não são masters e não pertencem a organizações
    const regulars = users.filter(u => 
      !u.is_master_user && 
      !u.organization_id
    );
    
    // Agrupar masters com member_count do SQL
    const masterGroups = masters.map(master => {
      // Usar member_count do SQL (vindo da paginação)
      const memberCount = (master as any).member_count || 0;
      
      return { master, memberCount };
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-aurora-primary/5 p-6 space-y-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-aurora-primary/5 via-transparent to-transparent" />
      
      <div className="relative space-y-8">
        {/* Modern Header with Aurora Style */}
        <div className="aurora-glass rounded-2xl p-8 border border-aurora-primary/20 backdrop-blur-md">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div className="flex items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-16 bg-gradient-to-b from-aurora-primary via-operational to-strategy rounded-full aurora-glow"></div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-aurora-primary/20 to-operational/10 aurora-glass">
                      <Users className="h-6 w-6 text-aurora-primary" />
                    </div>
                    <h1 className="text-4xl font-bold aurora-text-gradient">
                      Gestão de Usuários
                    </h1>
                  </div>
                  <p className="text-lg text-muted-foreground font-medium">
                    Gerencie {stats.total_users} usuários, permissões e equipes da plataforma
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <AdminButton
                onClick={() => exportUsers(users, searchQuery)}
                disabled={isExporting || users.length === 0}
                variant="outline"
                size="lg"
                icon={<Download className={isExporting ? 'animate-pulse' : ''} />}
              >
                Exportar
              </AdminButton>
              <AdminButton
                onClick={fetchUsers}
                disabled={isRefreshing}
                variant="outline"
                size="lg"
                icon={<RefreshCw className={isRefreshing ? 'animate-spin' : ''} />}
              >
                Atualizar
              </AdminButton>
            </div>
          </div>
        </div>

      {/* Tabs System */}
      <Tabs defaultValue="usuarios" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="usuarios" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Usuários</span>
          </TabsTrigger>
          <TabsTrigger value="sincronizacao" className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Sincronização</span>
          </TabsTrigger>
          <TabsTrigger value="historico" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Histórico</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Usuários */}
        <TabsContent value="usuarios" className="space-y-4 mt-4">

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            onClick={() => handleFilterByType('all')}
            className="cursor-pointer"
          >
            <AdminStatsCard
              label="Total de Usuários"
              value={stats.total_users}
              icon={Users}
              variant="primary"
              description="Todos os usuários"
              loading={loading}
            />
          </div>
          <div 
            onClick={() => handleFilterByType('masters')}
            className="cursor-pointer"
          >
            <AdminStatsCard
              label="Masters"
              value={stats.masters}
              icon={Crown}
              variant="warning"
              description="Com equipes"
              loading={loading}
            />
          </div>
          <div 
            onClick={() => handleFilterByType('onboarding_completed')}
            className="cursor-pointer"
          >
            <AdminStatsCard
              label="Onboarding Completo"
              value={stats.onboarding_completed || 0}
              icon={CheckCircle}
              variant="success"
              description="Cadastro completo"
              loading={loading}
            />
          </div>
          <div 
            onClick={() => handleFilterByType('onboarding_pending')}
            className="cursor-pointer"
          >
            <AdminStatsCard
              label="Onboarding Pendente"
              value={stats.onboarding_pending || 0}
              icon={Clock}
              variant="warning"
              description="Cadastro incompleto"
              loading={loading}
            />
          </div>
        </div>

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
        <div className="space-y-4">
          {/* Results count and pagination info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalUsers)} de {totalUsers}
              </p>
                <Badge variant="secondary" className="text-xs">
                 {currentFilter === 'masters' ? 'Masters & Equipes' : 
                  currentFilter === 'team_members' ? 'Membros' : 
                  currentFilter === 'individual' ? 'Individuais' :
                  currentFilter === 'onboarding_completed' ? 'Completo' :
                  currentFilter === 'onboarding_pending' ? 'Pendente' :
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
                  {currentPage}/{totalPages}
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
          {currentFilter === 'masters' && masterGroupsWithMembers.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Crown className="h-5 w-5 text-warning" />
                Masters e suas Equipes ({masterGroupsWithMembers.length} masters)
              </h3>
              <div className="grid gap-4">
                {masterGroupsWithMembers.map(({ master, memberCount }) => (
                  <MasterHierarchyCard
                    key={master.id}
                    master={master}
                    memberCount={memberCount}
                    onEditUser={handleEditRole}
                    onManageTeam={setManagingMaster}
                  />
                ))}
              </div>
              {masterGroupsWithMembers.length > 0 && (
                <div className="text-sm text-muted-foreground bg-info/10 border border-info/30 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-2">
                    <div className="text-info mt-0.5">💡</div>
                    <div>
                      <p className="font-medium text-info mb-1">
                        Visualização Hierárquica:
                      </p>
                      <p className="text-info/80">
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
                <AdminButton 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleFilterByType('all')}
                >
                  Ver todos os usuários
                </AdminButton>
                <AdminButton 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleFilterByType('masters')}
                >
                  Ver masters e equipes
                </AdminButton>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

        </TabsContent>

        {/* Tab: Sincronização Master/Membros */}
        <TabsContent value="sincronizacao" className="space-y-6 mt-6">
          <MasterMemberSyncPanel />
        </TabsContent>

        {/* Tab: Histórico de Sincronizações */}
        <TabsContent value="historico" className="space-y-6 mt-6">
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <History className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Histórico de Sincronizações</h3>
                <p className="text-muted-foreground">
                  Visualize logs e relatórios de sincronizações anteriores
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  Em breve: relatórios detalhados de todas as sincronizações executadas
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>

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

      {managingMaster && (
        <ManageTeamDialog
          open={!!managingMaster}
          onOpenChange={(open) => !open && setManagingMaster(null)}
          master={managingMaster}
        />
      )}
    </div>
  );
}
