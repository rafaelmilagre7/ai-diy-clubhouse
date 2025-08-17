
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { RolesList } from '@/components/admin/roles/RolesList';
import { RoleForm } from '@/components/admin/roles/RoleForm';
import { DeleteRoleDialog } from '@/components/admin/roles/DeleteRoleDialog';
import { RolePermissions } from '@/components/admin/roles/RolePermissions';
import { RoleCourseAccess } from '@/components/admin/roles/RoleCourseAccess';
import { useRoles, Role } from '@/hooks/admin/useRoles';

const AdminRoles: React.FC = () => {
  const { roles, isLoading, deleteRole, isDeleting } = useRoles();
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedRole, setSelectedRole] = useState<Role | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [courseAccessDialogOpen, setCourseAccessDialogOpen] = useState(false);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gerenciar Papéis</h1>
          <p className="text-muted-foreground">
            Configure papéis, permissões e corrija inconsistências do sistema
          </p>
        </div>
        <Button onClick={handleCreateRole}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Papel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Papéis do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <RolesList
            roles={roles}
            isLoading={isLoading}
            onEditRole={handleEditRole}
            onDeleteRole={handleDeleteRole}
            onManagePermissions={handleManagePermissions}
            onManageCourseAccess={handleManageCourseAccess}
          />
        </CardContent>
      </Card>

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
