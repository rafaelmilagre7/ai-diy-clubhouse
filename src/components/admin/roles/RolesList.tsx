
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
  Edit2, 
  Shield, 
  Trash, 
  BookOpen, 
  Settings,
  Lock,
  Users2,
  Calendar
} from "lucide-react";
import { Role } from "@/hooks/admin/useRoles";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";

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
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="surface-elevated border-0 shadow-aurora">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="skeleton h-12 w-12 rounded-lg" />
                <div className="space-y-2">
                  <div className="skeleton h-4 w-24" />
                  <div className="skeleton h-3 w-32" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="skeleton h-4 w-20" />
              <div className="skeleton h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-4 rounded-xl bg-gradient-to-r from-muted/20 to-muted/10 backdrop-blur-sm border border-muted/20 inline-block mb-4">
          <Shield className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-heading-3 text-foreground mb-2">Nenhum papel encontrado</h3>
        <p className="text-body text-muted-foreground">
          Tente ajustar os filtros ou criar um novo papel
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {roles.map((role, index) => {
        const createdDate = new Date(role.created_at);
        const isNewRole = Date.now() - createdDate.getTime() < 7 * 24 * 60 * 60 * 1000; // 7 days
        
        return (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3, 
              delay: index * 0.1,
              ease: 'easeOut' 
            }}
          >
            <Card className="surface-elevated border-0 shadow-aurora transition-all duration-300 hover:shadow-aurora-strong group h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`
                      p-3 rounded-lg transition-all duration-300 group-hover:scale-110
                      ${role.is_system 
                        ? 'bg-gradient-to-br from-revenue/20 to-strategy/20 group-hover:from-revenue/30 group-hover:to-strategy/30' 
                        : 'bg-gradient-to-br from-operational/20 to-aurora-primary/20 group-hover:from-operational/30 group-hover:to-aurora-primary/30'
                      }
                    `}>
                      {role.is_system ? (
                        <Lock className={`h-6 w-6 ${role.is_system ? 'text-revenue' : 'text-operational'}`} />
                      ) : (
                        <Users2 className="h-6 w-6 text-operational" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-body-large font-semibold text-foreground truncate">
                          {role.name}
                        </h3>
                        {isNewRole && (
                          <Badge variant="outline" className="text-xs bg-operational/10 text-operational border-operational/20">
                            Novo
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-body-small text-muted-foreground line-clamp-2">
                        {role.description || "Sem descrição"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Status and Type */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Badge 
                      variant={role.is_system ? 'default' : 'outline'}
                      className={
                        role.is_system 
                          ? 'bg-gradient-to-r from-revenue to-strategy text-white border-0' 
                          : 'bg-operational/20 text-operational border-operational/30'
                      }
                    >
                      {role.is_system ? (
                        <>
                          <Settings className="h-3 w-3 mr-1" />
                          Sistema
                        </>
                      ) : (
                        <>
                          <Users2 className="h-3 w-3 mr-1" />
                          Personalizado
                        </>
                      )}
                    </Badge>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-2 text-body-small">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Criado em {createdDate.toLocaleDateString('pt-BR')}</span>
                  </div>
                  
                  {role.is_system && (
                    <div className="flex items-center gap-2 text-revenue">
                      <Lock className="h-3 w-3" />
                      <span className="text-xs">Papel protegido do sistema</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <TooltipProvider>
                    <PermissionGuard permission="roles.manage">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEditRole(role)}
                            className="flex-1 h-8 text-xs aurora-focus"
                          >
                            <Edit2 className="h-3 w-3 mr-1" />
                            Editar
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
                              variant="outline"
                              size="sm"
                              onClick={() => onManagePermissions(role)}
                              className="flex-1 h-8 text-xs aurora-focus"
                            >
                              <Shield className="h-3 w-3 mr-1" />
                              Permissões
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Gerenciar permissões</p>
                          </TooltipContent>
                        </Tooltip>
                      </PermissionGuard>
                    )}
                  </TooltipProvider>
                </div>

                {/* Secondary Actions */}
                <div className="flex gap-2">
                  <TooltipProvider>
                    {onManageCourseAccess && (
                      <PermissionGuard permission="courses.manage">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onManageCourseAccess(role)}
                              className="flex-1 h-8 text-xs"
                            >
                              <BookOpen className="h-3 w-3 mr-1" />
                              Cursos
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
                              size="sm"
                              onClick={() => onDeleteRole(role)}
                              className="flex-1 h-8 text-xs text-destructive hover:text-destructive"
                            >
                              <Trash className="h-3 w-3 mr-1" />
                              Remover
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
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
