
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { RolesList } from "@/components/admin/roles/RolesList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRoles } from "@/hooks/admin/useRoles";
import { toast } from "sonner";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { RoleForm } from "@/components/admin/roles/RoleForm";
import { RolePermissions } from "@/components/admin/roles/RolePermissions";

export default function RolesPage() {
  const { 
    roles, 
    isLoading, 
    error, 
    fetchRoles, 
    createDialogOpen, 
    setCreateDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    selectedRole,
    setSelectedRole
  } = useRoles();

  // Novo estado para controlar o diálogo de permissões
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  useEffect(() => {
    if (error) {
      toast.error("Erro ao carregar papéis", {
        description: "Tente novamente mais tarde",
      });
    }
  }, [error]);

  return (
    <>
      <Helmet>
        <title>Gerenciamento de Papéis | Admin</title>
      </Helmet>

      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Papéis do Sistema</h1>
            <p className="text-muted-foreground">
              Gerencie os papéis e permissões dos usuários no sistema
            </p>
          </div>
          <PermissionGuard permission="roles.manage">
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Papel
            </Button>
          </PermissionGuard>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Papéis do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <RolesList 
              roles={roles} 
              isLoading={isLoading} 
              onEditRole={(role) => {
                setSelectedRole(role);
                setEditDialogOpen(true);
              }}
              onManagePermissions={(role) => {
                setSelectedRole(role);
                setPermissionsDialogOpen(true);
              }}
            />
          </CardContent>
        </Card>

        <RoleForm 
          open={createDialogOpen} 
          onOpenChange={setCreateDialogOpen}
          mode="create"
        />

        {selectedRole && (
          <>
            <RoleForm 
              open={editDialogOpen} 
              onOpenChange={setEditDialogOpen}
              mode="edit"
              role={selectedRole}
            />
            
            <RolePermissions
              open={permissionsDialogOpen}
              onOpenChange={setPermissionsDialogOpen}
              role={selectedRole}
            />
          </>
        )}
      </div>
    </>
  );
}
