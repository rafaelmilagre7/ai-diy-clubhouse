
import React, { useState } from 'react';
import { AdminButton } from '@/components/admin/ui/AdminButton';
import { AdminCard } from '@/components/admin/ui/AdminCard';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
                      <Shield className="h-6 w-6 text-aurora-primary" />
                    </div>
                    <h1 className="text-4xl font-bold aurora-text-gradient">
                      Gestão de Papéis
                    </h1>
                  </div>
                  <p className="text-lg text-muted-foreground font-medium">
                    Gerencie os papéis e permissões dos usuários da plataforma
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <AdminButton 
                size="lg"
                onClick={() => setShowCreateForm(true)} 
                icon={<Plus />}
              >
                Novo Papel
              </AdminButton>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role, index) => (
            <Card 
              key={role.id} 
              className="surface-elevated border-0 shadow-aurora animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
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
                    <AdminButton
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(role)}
                      icon={<Pencil />}
                    >
                      Editar
                    </AdminButton>
                    {!role.is_system && (
                      <AdminButton
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(role)}
                        disabled={isDeleting}
                        icon={<Trash2 />}
                      >
                        Deletar
                      </AdminButton>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
