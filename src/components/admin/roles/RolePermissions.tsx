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
  ShieldCheck,
  Users, 
  FileText, 
  Settings, 
  Database,
  BookOpen,
  BarChart3,
  MessageSquare,
  Globe,
  CheckCircle2,
  XCircle,
  Crown,
  Eye,
  Edit,
  Plus,
  Trash2,
  Zap
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

// Reorganizar permissões por tipo lógico
const organizePermissions = (permissions: Permission[]) => {
  const adminPermissions: Permission[] = [];
  const userPermissions: Permission[] = [];
  
  permissions.forEach(permission => {
    const code = permission.code.toLowerCase();
    const category = permission.category.toLowerCase();
    
    // Definir o que é admin vs usuário baseado na lógica de negócio
    const isAdminPermission = (
      category === 'admin' ||
      category === 'system' ||
      category === 'database' ||
      code.includes('admin') ||
      code.includes('manage') ||
      code.includes('delete') ||
      code.includes('create') && (category === 'analytics' || category === 'users') ||
      code.includes('settings') ||
      code.includes('configuration')
    );
    
    if (isAdminPermission) {
      adminPermissions.push(permission);
    } else {
      userPermissions.push(permission);
    }
  });
  
  return { adminPermissions, userPermissions };
};

// Mapear ícones para categorias com mais opções
const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, any> = {
    'admin': Crown,
    'system': Settings,
    'database': Database,
    'users': Users,
    'content': FileText,
    'learning': BookOpen,
    'analytics': BarChart3,
    'community': MessageSquare,
    'events': Globe,
    'view': Eye,
    'edit': Edit,
    'create': Plus,
    'delete': Trash2,
    'manage': Zap,
  };
  
  const lowerCategory = category.toLowerCase();
  return iconMap[lowerCategory] || Settings;
};

// Obter ícone baseado na ação da permissão
const getPermissionIcon = (permission: Permission) => {
  const code = permission.code.toLowerCase();
  
  if (code.includes('view') || code.includes('read')) return Eye;
  if (code.includes('edit') || code.includes('update')) return Edit;
  if (code.includes('create') || code.includes('add')) return Plus;
  if (code.includes('delete') || code.includes('remove')) return Trash2;
  if (code.includes('admin') || code.includes('manage')) return Crown;
  
  return getCategoryIcon(permission.category);
};

// Cores modernas usando o sistema Aurora
const getCategoryColor = (category: string, isActive: boolean = false) => {
  const baseClasses = "text-xs font-medium";
  
  if (isActive) {
    return `${baseClasses} bg-aurora/10 text-aurora border border-aurora/20`;
  }
  
  const colorMap: Record<string, string> = {
    'admin': `${baseClasses} bg-destructive/10 text-destructive`,
    'system': `${baseClasses} bg-muted text-muted-foreground`,
    'users': `${baseClasses} bg-viverblue/10 text-viverblue`,
    'content': `${baseClasses} bg-operational/10 text-operational`,
    'learning': `${baseClasses} bg-strategy/10 text-strategy`,
    'community': `${baseClasses} bg-aurora/10 text-aurora`,
    'analytics': `${baseClasses} bg-revenue/10 text-revenue`,
  };
  
  return colorMap[category.toLowerCase()] || `${baseClasses} bg-muted text-muted-foreground`;
};

// Obter descrição amigável com base na funcionalidade
const getPermissionDescription = (permission: Permission) => {
  if (permission.description) return permission.description;
  
  const code = permission.code.toLowerCase();
  const category = permission.category.toLowerCase();
  
  // Descrições específicas por categoria e ação
  if (category === 'admin') return 'Controle total da plataforma - apenas para administradores';
  if (category === 'system') return 'Configurações e manutenção do sistema';
  if (category === 'database') return 'Acesso direto ao banco de dados';
  
  // Descrições por ação
  if (code.includes('view') || code.includes('read')) return 'Visualizar e consultar informações';
  if (code.includes('create') || code.includes('add')) return 'Criar novos registros e conteúdos';
  if (code.includes('edit') || code.includes('update')) return 'Editar e modificar registros existentes';
  if (code.includes('delete') || code.includes('remove')) return 'Excluir registros permanentemente';
  if (code.includes('manage')) return 'Gerenciar completamente esta funcionalidade';
  
  return `Funcionalidade relacionada a ${category}`;
};

export function RolePermissions({ open, onOpenChange, role }: RolePermissionsProps) {
  const { permissions, loading } = usePermissions();
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Organizar permissões por tipo
  const { adminPermissions, userPermissions } = organizePermissions(permissions);
  
  // Calcular estatísticas
  const totalPermissions = permissions.length;
  const activePermissions = rolePermissions.length;
  const activeAdminPerms = adminPermissions.filter(p => rolePermissions.includes(p.code));
  const activeUserPerms = userPermissions.filter(p => rolePermissions.includes(p.code));

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

  const renderPermissionCard = (permission: Permission) => {
    const isActive = rolePermissions.includes(permission.code);
    const PermissionIcon = getPermissionIcon(permission);
    
    return (
      <div
        key={permission.id}
        className={`group relative overflow-hidden rounded-lg border transition-all duration-200 ${
          isActive 
            ? 'surface-elevated border-aurora/30 shadow-lg shadow-aurora/10' 
            : 'surface-base border-border/50 hover:border-border hover:shadow-md'
        }`}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-lg ${
              isActive 
                ? 'bg-aurora/10 text-aurora' 
                : 'bg-muted/50 text-muted-foreground group-hover:bg-muted'
            }`}>
              <PermissionIcon className="h-4 w-4" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-text-primary">
                  {permission.name}
                </h4>
                {isActive && (
                  <CheckCircle2 className="h-4 w-4 text-aurora animate-scale-in" />
                )}
              </div>
              
              <p className="text-xs text-text-secondary leading-relaxed">
                {getPermissionDescription(permission)}
              </p>
              
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={getCategoryColor(permission.category, isActive)}
                >
                  {permission.category}
                </Badge>
                <Badge variant="outline" className="text-xs font-mono">
                  {permission.code}
                </Badge>
              </div>
            </div>
          </div>
          
          <Switch
            checked={isActive}
            onCheckedChange={(checked) => 
              handlePermissionChange(permission, checked)
            }
            disabled={isSaving}
            className="ml-4 data-[state=checked]:bg-aurora data-[state=checked]:border-aurora"
          />
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden surface-modal">
        <DialogHeader className="pb-6 border-b border-border/50">
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-aurora/10">
              <ShieldCheck className="h-5 w-5 text-aurora" />
            </div>
            <div>
              <h2 className="text-text-primary">Gerenciar Permissões</h2>
              {role && (
                <p className="text-sm text-text-secondary font-normal mt-1">
                  Configurações para o papel <span className="font-medium text-aurora">{role.name}</span>
                </p>
              )}
            </div>
          </DialogTitle>
          
          {role && (
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <Badge variant="default" className="bg-aurora/10 text-aurora border-aurora/20">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {activePermissions} ativas
              </Badge>
              <Badge variant="outline">
                <XCircle className="h-3 w-3 mr-1" />
                {totalPermissions - activePermissions} inativas
              </Badge>
              <Badge variant="outline" className="bg-destructive/10 text-destructive">
                <Crown className="h-3 w-3 mr-1" />
                {activeAdminPerms.length} admin
              </Badge>
              <Badge variant="outline" className="bg-viverblue/10 text-viverblue">
                <Users className="h-3 w-3 mr-1" />
                {activeUserPerms.length} usuário
              </Badge>
            </div>
          )}
        </DialogHeader>

        {(loading || isLoading) ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-full bg-aurora/10 mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-aurora" />
            </div>
            <p className="text-text-secondary">Carregando permissões...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="space-y-6 p-1">
              
              {/* Permissões Administrativas */}
              {adminPermissions.length > 0 && (
                <Card className="surface-elevated border-destructive/20">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-destructive/10">
                          <Crown className="h-5 w-5 text-destructive" />
                        </div>
                        <div>
                          <h3 className="text-text-primary">Permissões Administrativas</h3>
                          <p className="text-xs text-text-secondary font-normal">
                            Controles avançados e gestão da plataforma
                          </p>
                        </div>
                        <Badge className="bg-destructive/10 text-destructive text-xs">
                          {activeAdminPerms.length}/{adminPermissions.length}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {adminPermissions.map(renderPermissionCard)}
                  </CardContent>
                </Card>
              )}

              {/* Permissões de Usuário */}
              {userPermissions.length > 0 && (
                <Card className="surface-elevated border-viverblue/20">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-viverblue/10">
                          <Users className="h-5 w-5 text-viverblue" />
                        </div>
                        <div>
                          <h3 className="text-text-primary">Funcionalidades de Usuário</h3>
                          <p className="text-xs text-text-secondary font-normal">
                            Acesso e uso das funcionalidades da plataforma
                          </p>
                        </div>
                        <Badge className="bg-viverblue/10 text-viverblue text-xs">
                          {activeUserPerms.length}/{userPermissions.length}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {userPermissions.map(renderPermissionCard)}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="pt-6 border-t border-border/50 surface-modal">
          <div className="flex items-center gap-3 text-sm text-text-secondary flex-1">
            <div className="p-1 rounded bg-aurora/10">
              <Shield className="h-4 w-4 text-aurora" />
            </div>
            <span>
              <span className="font-medium text-aurora">{activePermissions}</span> permissões ativas de {totalPermissions} disponíveis
            </span>
          </div>
          <Button 
            onClick={() => onOpenChange(false)}
            className="bg-aurora hover:bg-aurora/90 text-white"
          >
            Concluído
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}