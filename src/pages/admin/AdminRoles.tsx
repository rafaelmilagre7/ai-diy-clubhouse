
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Pencil, Trash2, Shield, Users } from 'lucide-react';
import { useRoles, Role } from '@/hooks/admin/useRoles';
import { RoleForm } from '@/components/admin/roles/RoleForm';
import { DeleteRoleDialog } from '@/components/admin/roles/DeleteRoleDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function AdminRoles() {
  const { roles, loading, deleteRole, isDeleting } = useRoles();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
  };

  const handleDelete = (role: Role) => {
    setRoleToDelete(role);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (roleToDelete) {
      await deleteRole(roleToDelete.id);
      setShowDeleteDialog(false);
      setRoleToDelete(null);
    }
  };

  const handleFormSave = () => {
    setSelectedRole(null);
    setShowCreateForm(false);
  };

  const handleFormCancel = () => {
    setSelectedRole(null);
    setShowCreateForm(false);
  };

  const getPermissionCount = (permissions: Record<string, any>) => {
    if (!permissions) return 0;
    return Object.values(permissions).filter(Boolean).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando papéis...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Papéis</h1>
          <p className="text-gray-600">Gerencie os papéis e permissões dos usuários</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Papel
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <Card key={role.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-aurora-primary" />
                  <CardTitle className="text-lg">{role.name}</CardTitle>
                </div>
                {role.is_system && (
                  <Badge variant="secondary" className="text-xs">
                    Sistema
                  </Badge>
                )}
              </div>
              {role.description && (
                <CardDescription>{role.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="mr-2 h-4 w-4" />
                  {getPermissionCount(role.permissions)} permissões
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(role)}
                  >
                    <Pencil className="mr-1 h-3 w-3" />
                    Editar
                  </Button>
                  {!role.is_system && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(role)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Deletar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog para criar papel */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Novo Papel</DialogTitle>
          </DialogHeader>
          <RoleForm onSave={handleFormSave} onCancel={handleFormCancel} />
        </DialogContent>
      </Dialog>

      {/* Dialog para editar papel */}
      <Dialog open={!!selectedRole} onOpenChange={() => setSelectedRole(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Papel</DialogTitle>
          </DialogHeader>
          <RoleForm role={selectedRole} onSave={handleFormSave} onCancel={handleFormCancel} />
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <DeleteRoleDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        role={roleToDelete}
        onDelete={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
