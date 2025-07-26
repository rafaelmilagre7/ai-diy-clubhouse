import { useState } from "react";
import { useUsers } from "@/hooks/admin/useUsers";
import { UsersHeader } from "@/components/admin/users/UsersHeader";
import { UsersTable } from "@/components/admin/users/UsersTable";
import { UserRoleManager } from "@/components/admin/users/UserRoleManager";
import { UserResetDialog } from "@/components/admin/users/UserResetDialog";
import { UserProfile } from "@/lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, Users, Plus, Activity, CheckCircle } from "lucide-react";
import { DeleteUserDialog } from "@/components/admin/users/DeleteUserDialog";
import { ToggleUserStatusDialog } from "@/components/admin/users/ToggleUserStatusDialog";
import { ResetPasswordDialog } from "@/components/admin/users/ResetPasswordDialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import { useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
  const [toggleStatusDialogOpen, setToggleStatusDialogOpen] = useState(false);
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

  const handleToggleStatus = (user: UserProfile) => {
    setSelectedUser(user);
    setToggleStatusDialogOpen(true);
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="relative p-6 md:p-8">
          <Alert variant="destructive" className="surface-elevated border-0 shadow-aurora bg-destructive/5">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Acesso restrito</AlertTitle>
            <AlertDescription>
              Você não tem permissão para visualizar a lista de usuários.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !users.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-viverblue/5 via-transparent to-transparent" />
        
        <div className="relative p-6 md:p-8 space-y-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-viverblue/20 to-operational/20 backdrop-blur-sm border border-viverblue/20">
              <Users className="h-8 w-8 text-viverblue" />
            </div>
            <div>
              <h1 className="text-display text-foreground">Usuários VIA Aurora</h1>
              <p className="text-body-large text-muted-foreground">Gerencie usuários e permissões do sistema</p>
            </div>
          </div>
          
          <Alert variant="destructive" className="surface-elevated border-0 shadow-aurora bg-destructive/5">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro ao carregar usuários</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>Ocorreu um problema ao carregar a lista de usuários:</p>
              <p className="font-mono text-sm bg-destructive/10 p-2 rounded">
                {error.message}
              </p>
              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline"
                  onClick={handleRefresh} 
                  disabled={isRefreshing}
                  className="aurora-focus gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  {isRefreshing ? "Atualizando..." : "Tentar novamente"}
                </Button>
                
                <Button onClick={handleForceRefresh} className="aurora-focus">
                  Recarregar página
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && !users.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-viverblue/5 via-transparent to-transparent" />
        
        <div className="relative p-6 md:p-8 space-y-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-viverblue/20 to-operational/20 backdrop-blur-sm">
              <div className="skeleton h-8 w-8" />
            </div>
            <div className="space-y-2">
              <div className="skeleton h-8 w-64" />
              <div className="skeleton h-4 w-96" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="surface-elevated border-0 shadow-aurora p-6">
                <div className="skeleton h-4 w-24 mb-2" />
                <div className="skeleton h-8 w-16 mb-3" />
                <div className="skeleton h-4 w-20" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Estatísticas dos usuários
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.status !== 'inactive').length;
  const adminUsers = users.filter(user => 
    user.user_roles?.name === 'admin' || user.email?.includes('@viverdeia.ai')
  ).length;
  const onboardingCompleted = users.filter(user => user.onboarding_completed).length;

  const filteredUsers = users.filter(user => {
    if (filterRole && user.role_id !== filterRole) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Aurora Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-viverblue/5 via-transparent to-transparent" />
      <div className="absolute top-0 right-0 -z-10 h-96 w-96 rounded-full bg-gradient-to-br from-viverblue/10 to-operational/10 blur-3xl animate-blob" />
      <div className="absolute bottom-0 left-0 -z-10 h-96 w-96 rounded-full bg-gradient-to-tr from-strategy/10 to-revenue/10 blur-3xl animate-blob animation-delay-2000" />
      
      <div className="relative p-6 md:p-8 space-y-8">
        {/* Modern Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-viverblue/20 to-operational/20 backdrop-blur-sm border border-viverblue/20">
                <Users className="h-8 w-8 text-viverblue" />
              </div>
              <div>
                <h1 className="text-display text-foreground bg-gradient-to-r from-viverblue to-operational bg-clip-text text-transparent">
                  Usuários VIA Aurora
                </h1>
                <p className="text-body-large text-muted-foreground">
                  Gerencie {totalUsers} usuários e suas permissões no sistema
                </p>
              </div>
            </div>
            
            {/* Quick Action Badges */}
            <div className="flex gap-4">
              <Badge variant="secondary" className="surface-elevated">
                {activeUsers} Ativos
              </Badge>
              <Badge variant="secondary" className="surface-elevated">
                {adminUsers} Admins
              </Badge>
              <Badge variant="secondary" className="surface-elevated">
                {Math.round((onboardingCompleted / totalUsers) * 100)}% Onboarding
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="aurora-focus gap-2 bg-card/50 backdrop-blur-sm"
            >
              <RefreshCw className="h-4 w-4" />
              {isRefreshing ? "Atualizando..." : "Atualizar"}
            </Button>
            
            <Button
              onClick={() => {/* TODO: Implementar criação de usuário */}}
              className="aurora-focus gap-2 bg-viverblue hover:bg-viverblue/90"
            >
              <Plus className="h-4 w-4" />
              Novo Usuário
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="surface-elevated border-0 shadow-aurora hover:shadow-aurora-strong transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-label text-muted-foreground">Total de Usuários</CardTitle>
              <div className="p-2 rounded-lg bg-viverblue/10 group-hover:bg-viverblue/20 transition-colors">
                <Users className="h-4 w-4 text-viverblue" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-heading-2 text-foreground mb-2">{totalUsers}</div>
              <p className="text-caption text-muted-foreground">
                +12 nos últimos 30 dias
              </p>
            </CardContent>
          </Card>

          <Card className="surface-elevated border-0 shadow-aurora hover:shadow-aurora-strong transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-label text-muted-foreground">Usuários Ativos</CardTitle>
              <div className="p-2 rounded-lg bg-operational/10 group-hover:bg-operational/20 transition-colors">
                <Activity className="h-4 w-4 text-operational" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-heading-2 text-foreground mb-2">{activeUsers}</div>
              <p className="text-caption text-muted-foreground">
                +8 nos últimos 30 dias
              </p>
            </CardContent>
          </Card>

          <Card className="surface-elevated border-0 shadow-aurora hover:shadow-aurora-strong transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-label text-muted-foreground">Administradores</CardTitle>
              <div className="p-2 rounded-lg bg-strategy/10 group-hover:bg-strategy/20 transition-colors">
                <AlertCircle className="h-4 w-4 text-strategy" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-heading-2 text-foreground mb-2">{adminUsers}</div>
              <p className="text-caption text-muted-foreground">
                Acesso total
              </p>
            </CardContent>
          </Card>

          <Card className="surface-elevated border-0 shadow-aurora hover:shadow-aurora-strong transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-label text-muted-foreground">Onboarding Completo</CardTitle>
              <div className="p-2 rounded-lg bg-revenue/10 group-hover:bg-revenue/20 transition-colors">
                <CheckCircle className="h-4 w-4 text-revenue" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-heading-2 text-foreground mb-2">
                {Math.round((onboardingCompleted / totalUsers) * 100)}%
              </div>
              <p className="text-caption text-muted-foreground">
                +15% nos últimos 30 dias
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters */}
        <Card className="surface-elevated border-0 shadow-aurora">
          <CardHeader>
            <CardTitle className="text-heading-3">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="aurora-focus"
                />
              </div>
              <div className="w-full sm:w-48">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background aurora-focus"
                >
                  <option value="">Todos os papéis</option>
                  {availableRoles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setFilterRole('');
                }}
                className="aurora-focus"
              >
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Users Table */}
        <Card className="surface-elevated border-0 shadow-aurora">
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
            onToggleStatus={handleToggleStatus}
            onRefresh={handleRefresh}
            canResetUsers={canManageUsers}
            canToggleStatus={canManageUsers}
          />
        </Card>
        
        {users.length > 0 && !isRefreshing && (
          <div className="text-body-small text-muted-foreground text-right">
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
      </div>
    </div>
  );
};

export default AdminUsers;
