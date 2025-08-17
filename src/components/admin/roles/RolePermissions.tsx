import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Role } from "@/hooks/admin/useRoles";
import { usePermissions, Permission } from "@/hooks/auth/usePermissions";
import { 
  Loader2, 
  Shield, 
  Users, 
  FileText, 
  Settings, 
  Database,
  BookOpen,
  BarChart3,
  MessageSquare,
  Globe,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface RolePermissionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
}

interface PermissionsByCategory {
  [category: string]: Permission[];
}

// Mapear ícones para categorias
const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, any> = {
    'admin': Shield,
    'users': Users,
    'content': FileText,
    'system': Settings,
    'database': Database,
    'learning': BookOpen,
    'analytics': BarChart3,
    'community': MessageSquare,
    'public': Globe,
  };
  
  return iconMap[category.toLowerCase()] || Settings;
};

// Mapear cores para categorias
const getCategoryColor = (category: string) => {
  const colorMap: Record<string, string> = {
    'admin': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'users': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'content': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'system': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    'database': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'learning': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'analytics': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    'community': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    'public': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  };
  
  return colorMap[category.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
};

// Obter descrição amigável da permissão
const getPermissionDescription = (permission: Permission) => {
  if (permission.description) return permission.description;
  
  // Gerar descrições baseadas no código da permissão
  const code = permission.code.toLowerCase();
  if (code.includes('view') || code.includes('read')) return 'Permite visualizar e consultar dados';
  if (code.includes('create') || code.includes('add')) return 'Permite criar novos registros';
  if (code.includes('edit') || code.includes('update')) return 'Permite editar registros existentes';
  if (code.includes('delete') || code.includes('remove')) return 'Permite excluir registros';
  if (code.includes('admin') || code.includes('manage')) return 'Acesso administrativo completo';
  
  return 'Permissão específica do sistema';
};

export function RolePermissions({ open, onOpenChange, role }: RolePermissionsProps) {
  const { permissions, loading } = usePermissions();
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Agrupar permissões por categoria
  const permissionsByCategory: PermissionsByCategory = permissions.reduce(
    (acc: PermissionsByCategory, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    },
    {}
  );

  // Calcular estatísticas
  const totalPermissions = permissions.length;
  const activePermissions = rolePermissions.length;
  const activeCategories = Object.keys(permissionsByCategory).filter(category => 
    permissionsByCategory[category].some(p => rolePermissions.includes(p.code))
  );

  // Buscar permissões do papel
  useEffect(() => {
    if (role && open) {
      fetchRolePermissions();
    }
  }, [role, open]);

  const fetchRolePermissions = async () => {
    if (!role) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("role_permissions")
        .select("permission_id, permission_definitions(code)")
        .eq("role_id", role.id);

      if (error) throw error;

      const permissionCodes = data.map(
        (item: any) => item.permission_definitions?.code
      ).filter(Boolean);
      
      setRolePermissions(permissionCodes);
    } catch (err) {
      console.error("Erro ao buscar permissões do papel:", err);
      toast.error("Erro ao carregar permissões do papel");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionChange = async (permission: Permission, checked: boolean) => {
    if (!role) return;

    try {
      setIsSaving(true);
      
      if (checked) {
        const { error } = await supabase
          .from("role_permissions")
          .insert({
            role_id: role.id,
            permission_id: permission.id
          });
          
        if (error) throw error;
        
        setRolePermissions(prev => [...prev, permission.code]);
        toast.success(`Permissão "${permission.name}" ativada`);
      } else {
        const { error } = await supabase
          .from("role_permissions")
          .delete()
          .eq("role_id", role.id)
          .eq("permission_id", permission.id);
          
        if (error) throw error;
        
        setRolePermissions(prev => 
          prev.filter(code => code !== permission.code)
        );
        toast.success(`Permissão "${permission.name}" desativada`);
      }
    } catch (err) {
      console.error("Erro ao atualizar permissão:", err);
      toast.error("Erro ao atualizar permissão");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Gerenciar Permissões
          </DialogTitle>
          <DialogDescription>
            {role ? (
              <div className="space-y-2">
                <span>Configure as permissões para o papel <strong>{role.name}</strong></span>
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {activePermissions} ativas
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    {totalPermissions - activePermissions} inativas
                  </Badge>
                  <Badge variant="outline">
                    {activeCategories.length} de {Object.keys(permissionsByCategory).length} categorias
                  </Badge>
                </div>
              </div>
            ) : ""}
          </DialogDescription>
        </DialogHeader>

        {(loading || isLoading) ? (
          <div className="flex justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-muted-foreground">Carregando permissões...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(permissionsByCategory).map(([category, perms]) => {
              const CategoryIcon = getCategoryIcon(category);
              const activePermsInCategory = perms.filter(p => rolePermissions.includes(p.code));
              
              return (
                <Card key={category} className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="h-5 w-5" />
                        <span className="capitalize">{category}</span>
                        <Badge className={getCategoryColor(category)}>
                          {activePermsInCategory.length}/{perms.length}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {perms.map((permission) => {
                      const isActive = rolePermissions.includes(permission.code);
                      
                      return (
                        <div
                          key={permission.id}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                            isActive 
                              ? 'bg-primary/5 border-primary/20' 
                              : 'bg-background hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-medium">
                                {permission.name}
                              </h4>
                              {isActive && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {getPermissionDescription(permission)}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {permission.code}
                            </Badge>
                          </div>
                          <Switch
                            checked={isActive}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(permission, checked)
                            }
                            disabled={isSaving}
                            className="ml-4"
                          />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}

            <DialogFooter className="pt-6 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-1">
                <Shield className="h-4 w-4" />
                {activePermissions} permissões ativas de {totalPermissions} disponíveis
              </div>
              <Button onClick={() => onOpenChange(false)}>
                Concluído
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}