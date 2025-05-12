
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Role } from "@/hooks/admin/useRoles";
import { Button } from "@/components/ui/button";
import { Edit2, Shield, Trash, BookOpen } from "lucide-react";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface RolesListProps {
  roles: Role[];
  isLoading: boolean;
  onEditRole: (role: Role) => void;
  onDeleteRole?: (role: Role) => void;
  onManagePermissions?: (role: Role) => void;
  onManageCourseAccess?: (role: Role) => void;
}

export function RolesList({
  roles,
  isLoading,
  onEditRole,
  onDeleteRole,
  onManagePermissions,
  onManageCourseAccess,
}: RolesListProps) {
  if (isLoading) {
    return <div className="flex justify-center py-8">Carregando papéis...</div>;
  }

  if (roles.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum papel encontrado no sistema.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="w-[120px]">Tipo</TableHead>
            <TableHead className="text-right w-[180px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  {role.name}
                </div>
              </TableCell>
              <TableCell>{role.description || "-"}</TableCell>
              <TableCell>
                {role.is_system ? (
                  <Badge variant="secondary">Sistema</Badge>
                ) : (
                  <Badge variant="outline">Personalizado</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <TooltipProvider>
                    <PermissionGuard permission="roles.manage">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditRole(role)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Editar papel</p>
                        </TooltipContent>
                      </Tooltip>
                    </PermissionGuard>

                    {onManagePermissions && (
                      <PermissionGuard permission="permissions.manage">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onManagePermissions(role)}
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Gerenciar permissões</p>
                          </TooltipContent>
                        </Tooltip>
                      </PermissionGuard>
                    )}

                    {onManageCourseAccess && (
                      <PermissionGuard permission="courses.manage">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onManageCourseAccess(role)}
                            >
                              <BookOpen className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Gerenciar acesso a cursos</p>
                          </TooltipContent>
                        </Tooltip>
                      </PermissionGuard>
                    )}

                    {!role.is_system && onDeleteRole && (
                      <PermissionGuard permission="roles.manage">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDeleteRole(role)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Remover papel</p>
                          </TooltipContent>
                        </Tooltip>
                      </PermissionGuard>
                    )}
                  </TooltipProvider>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
