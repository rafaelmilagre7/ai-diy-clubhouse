
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Shield, Users, Settings, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { Role } from '@/hooks/admin/useRoles';

interface RolesListProps {
  roles: Role[];
  isLoading: boolean;
  error?: Error | null;
  onEditRole: (role: Role) => void;
  onDeleteRole: (role: Role) => void;
  onManagePermissions: (role: Role) => void;
  onManageCourseAccess: (role: Role) => void;
  onRefresh?: () => void;
}

export const RolesList: React.FC<RolesListProps> = ({
  roles,
  isLoading,
  error,
  onEditRole,
  onDeleteRole,
  onManagePermissions,
  onManageCourseAccess,
  onRefresh
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-viverblue mr-2" />
            <span>Carregando papéis...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive opacity-50" />
            <p className="text-destructive font-medium mb-2">Erro ao carregar papéis</p>
            <p className="text-sm text-muted-foreground mb-4">
              {error.message || 'Erro desconhecido'}
            </p>
            {onRefresh && (
              <Button onClick={onRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (roles.length === 0) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum papel encontrado</p>
            <p className="text-sm">Crie o primeiro papel para o sistema</p>
            {onRefresh && (
              <Button onClick={onRefresh} variant="outline" size="sm" className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Recarregar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {roles.map((role) => (
        <Card key={role.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-viverblue" />
                <CardTitle className="text-lg">{role.name}</CardTitle>
                {role.is_system && (
                  <Badge variant="secondary">Sistema</Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onManagePermissions(role)}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Permissões
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onManageCourseAccess(role)}
                >
                  <Users className="h-4 w-4 mr-1" />
                  Cursos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditRole(role)}
                  disabled={role.is_system}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeleteRole(role)}
                  disabled={role.is_system}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
              </div>
            </div>
          </CardHeader>
          {role.description && (
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {role.description}
              </p>
              <div className="mt-2 text-xs text-muted-foreground">
                Criado em: {new Date(role.created_at).toLocaleDateString('pt-BR')}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};
