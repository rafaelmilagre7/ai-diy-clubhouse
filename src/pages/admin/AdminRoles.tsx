
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Shield, 
  Users, 
  Settings,
  AlertTriangle,
  CheckCircle2,
  Filter,
  RefreshCw
} from 'lucide-react';
import { RolesList } from '@/components/admin/roles/RolesList';
import { RoleForm } from '@/components/admin/roles/RoleForm';
import { DeleteRoleDialog } from '@/components/admin/roles/DeleteRoleDialog';
import { RolePermissions } from '@/components/admin/roles/RolePermissions';
import { RoleCourseAccess } from '@/components/admin/roles/RoleCourseAccess';
import { useRoles, Role } from '@/hooks/admin/useRoles';

const AdminRoles: React.FC = () => {
  const { roles, isLoading, deleteRole, isDeleting, refetch } = useRoles();
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedRole, setSelectedRole] = useState<Role | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [courseAccessDialogOpen, setCourseAccessDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'system' | 'custom'>('all');

  const handleCreateRole = () => {
    setSelectedRole(undefined);
    setFormMode('create');
    setFormOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setFormMode('edit');
    setFormOpen(true);
  };

  const handleDeleteRole = (role: Role) => {
    setSelectedRole(role);
    setDeleteDialogOpen(true);
  };

  const handleManagePermissions = (role: Role) => {
    setSelectedRole(role);
    setPermissionsDialogOpen(true);
  };

  const handleManageCourseAccess = (role: Role) => {
    setSelectedRole(role);
    setCourseAccessDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedRole) {
      await deleteRole(selectedRole.id);
      setDeleteDialogOpen(false);
      setSelectedRole(undefined);
    }
  };

  // Filter and search logic
  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (role.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'system' && role.is_system) ||
                         (filterType === 'custom' && !role.is_system);
    
    return matchesSearch && matchesFilter;
  });

  // Calculate stats
  const totalRoles = roles.length;
  const systemRoles = roles.filter(role => role.is_system).length;
  const customRoles = roles.filter(role => !role.is_system).length;
  const recentRoles = roles.filter(role => {
    const roleDate = new Date(role.created_at);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return roleDate > weekAgo;
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Aurora Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-viverblue/5 via-transparent to-transparent" />
      <div className="absolute top-0 right-0 -z-10 h-96 w-96 rounded-full bg-gradient-to-br from-strategy/10 to-revenue/10 blur-3xl animate-blob" />
      <div className="absolute bottom-0 left-0 -z-10 h-96 w-96 rounded-full bg-gradient-to-tr from-operational/10 to-viverblue/10 blur-3xl animate-blob animation-delay-2000" />
      
      <div className="relative p-6 md:p-8 space-y-8">
        {/* Modern Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-strategy/20 to-revenue/20 backdrop-blur-sm border border-strategy/20">
                <Shield className="h-8 w-8 text-strategy" />
              </div>
              <div>
                <h1 className="text-display text-foreground bg-gradient-to-r from-strategy to-revenue bg-clip-text text-transparent">
                  Gerenciar Papéis
                </h1>
                <p className="text-body-large text-muted-foreground">
                  Configure {totalRoles} papéis, permissões e acessos do sistema
                </p>
              </div>
            </div>
            
            {/* Quick Stats Badges */}
            <div className="flex gap-4">
              <Badge variant="secondary" className="surface-elevated">
                {systemRoles} Sistema
              </Badge>
              <Badge variant="secondary" className="surface-elevated">
                {customRoles} Personalizados
              </Badge>
              <Badge variant="secondary" className="surface-elevated">
                {recentRoles} Novos (7d)
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={refetch}
              disabled={isLoading}
              className="aurora-focus gap-2 bg-card/50 backdrop-blur-sm"
            >
              <RefreshCw className="h-4 w-4" />
              {isLoading ? "Atualizando..." : "Atualizar"}
            </Button>
            
            <Button
              onClick={handleCreateRole}
              className="aurora-focus gap-2 bg-gradient-to-r from-strategy to-revenue hover:from-strategy/90 hover:to-revenue/90"
            >
              <Plus className="h-4 w-4" />
              Novo Papel
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="surface-elevated border-0 shadow-aurora transition-all duration-300 hover:shadow-aurora-strong group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-label text-muted-foreground">Total de Papéis</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-strategy/20 to-strategy/10 transition-all duration-300 group-hover:from-strategy/30 group-hover:to-strategy/20">
                <Shield className="h-4 w-4 text-strategy" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-heading-2 text-foreground mb-2 bg-gradient-to-r from-strategy to-strategy/80 bg-clip-text text-transparent">
                {totalRoles}
              </div>
              <p className="text-caption text-muted-foreground">
                +{recentRoles} novos esta semana
              </p>
            </CardContent>
          </Card>

          <Card className="surface-elevated border-0 shadow-aurora transition-all duration-300 hover:shadow-aurora-strong group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-label text-muted-foreground">Papéis Sistema</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-revenue/20 to-revenue/10 transition-all duration-300 group-hover:from-revenue/30 group-hover:to-revenue/20">
                <Settings className="h-4 w-4 text-revenue" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-heading-2 text-foreground mb-2 bg-gradient-to-r from-revenue to-revenue/80 bg-clip-text text-transparent">
                {systemRoles}
              </div>
              <p className="text-caption text-muted-foreground">
                Papéis protegidos
              </p>
            </CardContent>
          </Card>

          <Card className="surface-elevated border-0 shadow-aurora transition-all duration-300 hover:shadow-aurora-strong group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-label text-muted-foreground">Personalizados</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-operational/20 to-operational/10 transition-all duration-300 group-hover:from-operational/30 group-hover:to-operational/20">
                <Users className="h-4 w-4 text-operational" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-heading-2 text-foreground mb-2 bg-gradient-to-r from-operational to-operational/80 bg-clip-text text-transparent">
                {customRoles}
              </div>
              <p className="text-caption text-muted-foreground">
                Editáveis
              </p>
            </CardContent>
          </Card>

          <Card className="surface-elevated border-0 shadow-aurora transition-all duration-300 hover:shadow-aurora-strong group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-label text-muted-foreground">Status</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-viverblue/20 to-viverblue/10 transition-all duration-300 group-hover:from-viverblue/30 group-hover:to-viverblue/20">
                <CheckCircle2 className="h-4 w-4 text-viverblue" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-heading-2 text-foreground mb-2 bg-gradient-to-r from-viverblue to-viverblue/80 bg-clip-text text-transparent">
                Ativo
              </div>
              <p className="text-caption text-muted-foreground">
                Sistema funcionando
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters */}
        <Card className="surface-elevated border-0 shadow-aurora">
          <CardHeader>
            <CardTitle className="text-heading-3 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros e Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar papéis por nome ou descrição..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="aurora-focus"
                />
              </div>
              <div className="w-full sm:w-48">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as 'all' | 'system' | 'custom')}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background aurora-focus"
                >
                  <option value="all">Todos os tipos</option>
                  <option value="system">Apenas sistema</option>
                  <option value="custom">Apenas personalizados</option>
                </select>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('all');
                }}
                className="aurora-focus"
              >
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Roles List */}
        <Card className="surface-elevated border-0 shadow-aurora">
          <CardHeader>
            <CardTitle className="text-heading-3 flex items-center justify-between">
              <span>Papéis do Sistema</span>
              <Badge variant="outline" className="text-xs">
                {filteredRoles.length} de {totalRoles}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RolesList
              roles={filteredRoles}
              isLoading={isLoading}
              onEditRole={handleEditRole}
              onDeleteRole={handleDeleteRole}
              onManagePermissions={handleManagePermissions}
              onManageCourseAccess={handleManageCourseAccess}
            />
          </CardContent>
        </Card>
      </div>

      <RoleForm
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        role={selectedRole}
      />

      <DeleteRoleDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        role={selectedRole || null}
        onDelete={confirmDelete}
        isDeleting={isDeleting}
      />

      <RolePermissions
        open={permissionsDialogOpen}
        onOpenChange={setPermissionsDialogOpen}
        role={selectedRole || null}
      />

      <RoleCourseAccess
        open={courseAccessDialogOpen}
        onOpenChange={setCourseAccessDialogOpen}
        role={selectedRole || null}
      />
    </div>
  );
};

export default AdminRoles;
