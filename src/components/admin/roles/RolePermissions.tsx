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

// Reorganizar permissões de forma clara: AÇÃO vs GESTÃO
const organizePermissions = (permissions: Permission[]) => {
  const usagePermissions: Permission[] = [];  // O que usuários podem VER e FAZER
  const managementPermissions: Permission[] = []; // GESTÃO - só admin
  
  permissions.forEach(permission => {
    const code = permission.code.toLowerCase();
    const name = permission.name.toLowerCase();
    const category = permission.category.toLowerCase();
    
    // GESTÃO (somente admin do sistema) - tudo que envolve controlar/gerenciar/administrar
    const isManagement = (
      // Palavras-chave de gestão
      code.includes('manage') || code.includes('admin') || code.includes('create') || 
      code.includes('delete') || code.includes('edit') || code.includes('update') ||
      name.includes('gerenciar') || name.includes('administrar') || name.includes('configurar') ||
      name.includes('criar') || name.includes('editar') || name.includes('deletar') ||
      name.includes('remover') || name.includes('modificar') || name.includes('alterar') ||
      
      // Categorias sempre administrativas
      category === 'admin' || category === 'system' || category === 'database' ||
      category === 'settings' || category === 'configuration' ||
      
      // Contextos específicos de gestão
      code.includes('users.manage') || code.includes('roles.') || 
      code.includes('permissions.') || code.includes('settings.') ||
      code.includes('analytics.manage') || code.includes('system.')
    );
    
    if (isManagement) {
      managementPermissions.push(permission);
    } else {
      // USO (o que usuários podem ver/acessar/usar)
      usagePermissions.push(permission);
    }
  });
  
  return { usagePermissions, managementPermissions };
};

// Ícones específicos para ações
const getActionIcon = (permission: Permission) => {
  const code = permission.code.toLowerCase();
  const name = permission.name.toLowerCase();
  
  // Ícones de gestão
  if (code.includes('manage') || name.includes('gerenciar')) return Settings;
  if (code.includes('create') || name.includes('criar')) return Plus;
  if (code.includes('edit') || name.includes('editar')) return Edit;
  if (code.includes('delete') || name.includes('deletar')) return Trash2;
  if (code.includes('admin') || name.includes('admin')) return Crown;
  
  // Ícones de uso/visualização
  if (code.includes('view') || name.includes('visualizar') || code.includes('read')) return Eye;
  if (code.includes('access') || name.includes('acessar')) return Globe;
  if (code.includes('use') || name.includes('usar')) return Zap;
  
  // Por categoria
  const category = permission.category.toLowerCase();
  if (category.includes('community')) return MessageSquare;
  if (category.includes('learning')) return BookOpen;
  if (category.includes('analytics')) return BarChart3;
  if (category.includes('content')) return FileText;
  
  return Eye; // Default para visualização
};

// Cores por tipo de ação
const getPermissionTypeColor = (permission: Permission, isActive: boolean = false) => {
  const code = permission.code.toLowerCase();
  const name = permission.name.toLowerCase();
  
  // Tipo de ação determina a cor
  let colorClass = '';
  
  if (code.includes('view') || code.includes('read') || name.includes('visualizar')) {
    colorClass = isActive ? 'bg-viverblue/20 text-viverblue border-viverblue/30' : 'bg-viverblue/5 text-viverblue/70';
  } else if (code.includes('access') || name.includes('acessar')) {
    colorClass = isActive ? 'bg-operational/20 text-operational border-operational/30' : 'bg-operational/5 text-operational/70';
  } else if (code.includes('use') || name.includes('usar')) {
    colorClass = isActive ? 'bg-strategy/20 text-strategy border-strategy/30' : 'bg-strategy/5 text-strategy/70';
  } else {
    // Gestão - vermelho para indicar cuidado
    colorClass = isActive ? 'bg-destructive/20 text-destructive border-destructive/30' : 'bg-destructive/5 text-destructive/70';
  }
  
  return `text-xs font-medium px-2 py-1 rounded ${colorClass}`;
};

// Descrições mais claras
const getActionDescription = (permission: Permission) => {
  const code = permission.code.toLowerCase();
  const name = permission.name.toLowerCase();
  const category = permission.category.toLowerCase();
  
  // Descrições de uso (não-gerencial)
  if (code.includes('view') || code.includes('read')) {
    return `Pode visualizar e consultar ${category}`;
  }
  if (code.includes('access')) {
    return `Tem acesso às funcionalidades de ${category}`;
  }
  if (code.includes('use')) {
    return `Pode usar as ferramentas de ${category}`;
  }
  
  // Descrições de gestão (admin)
  if (code.includes('create')) return `Pode criar novos itens em ${category}`;
  if (code.includes('edit') || code.includes('update')) return `Pode modificar itens em ${category}`;
  if (code.includes('delete')) return `Pode remover itens em ${category}`;
  if (code.includes('manage')) return `Controle total sobre ${category}`;
  if (code.includes('admin')) return `Administração completa de ${category}`;
  
  return permission.description || `Funcionalidade relacionada a ${category}`;
};

export function RolePermissions({ open, onOpenChange, role }: RolePermissionsProps) {
  const { permissions, loading } = usePermissions();
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Organizar permissões por tipo
  const { usagePermissions, managementPermissions } = organizePermissions(permissions);
  
  // Calcular estatísticas
  const totalPermissions = permissions.length;
  const activePermissions = rolePermissions.length;
  const activeUsagePerms = usagePermissions.filter(p => rolePermissions.includes(p.code));
  const activeMgmtPerms = managementPermissions.filter(p => rolePermissions.includes(p.code));

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
        toast.success(`Permissão ativada`);
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
        toast.success(`Permissão desativada`);
      }
    } catch (err) {
      console.error("Erro ao atualizar permissão:", err);
      toast.error("Erro ao atualizar permissão");
    } finally {
      setIsSaving(false);
    }
  };

  const renderPermissionItem = (permission: Permission) => {
    const isActive = rolePermissions.includes(permission.code);
    const ActionIcon = getActionIcon(permission);
    
    return (
      <div
        key={permission.id}
        className={`group relative rounded-lg border transition-all duration-300 ${
          isActive 
            ? 'bg-aurora/5 border-aurora/20 shadow-sm' 
            : 'bg-card border-border/30 hover:border-border/60 hover:bg-muted/20'
        }`}
      >
        <div className="flex items-center gap-4 p-4">
          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            isActive 
              ? 'bg-aurora/10 text-aurora' 
              : 'bg-muted/50 text-muted-foreground'
          }`}>
            <ActionIcon className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm text-foreground truncate">
                {permission.name}
              </h4>
              {isActive && (
                <CheckCircle2 className="w-4 h-4 text-aurora flex-shrink-0" />
              )}
            </div>
            
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {getActionDescription(permission)}
            </p>
            
            <div className="flex items-center gap-2">
              <Badge className={getPermissionTypeColor(permission, isActive)}>
                {permission.category}
              </Badge>
              <code className="text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                {permission.code}
              </code>
            </div>
          </div>
          
          <Switch
            checked={isActive}
            onCheckedChange={(checked) => handlePermissionChange(permission, checked)}
            disabled={isSaving}
            className="flex-shrink-0"
          />
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col bg-background border-border">
        <DialogHeader className="flex-shrink-0 pb-4 border-b border-border/50">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-aurora/20 to-viverblue/20 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-aurora" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg font-semibold text-foreground">
                Configurar Permissões
              </DialogTitle>
              {role && (
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  Definindo o que usuários com o papel <span className="font-medium text-aurora">{role.name}</span> podem ver e fazer na plataforma
                </DialogDescription>
              )}
            </div>
          </div>
          
          {role && (
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-aurora/10 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-aurora" />
                <span className="text-sm font-medium text-aurora">
                  {activePermissions} ativas
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full">
                <Eye className="w-4 h-4 text-viverblue" />
                <span className="text-sm text-muted-foreground">
                  {activeUsagePerms.length} de uso
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full">
                <Crown className="w-4 h-4 text-destructive" />
                <span className="text-sm text-muted-foreground">
                  {activeMgmtPerms.length} de gestão
                </span>
              </div>
            </div>
          )}
        </DialogHeader>

        {(loading || isLoading) ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-aurora/10 flex items-center justify-center mx-auto">
                <Loader2 className="w-6 h-6 animate-spin text-aurora" />
              </div>
              <p className="text-muted-foreground">Carregando permissões...</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto space-y-6 pr-2" style={{ scrollbarGutter: 'stable' }}>
              
              {/* Funcionalidades de Uso */}
              {usagePermissions.length > 0 && (
                <Card className="border border-viverblue/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-viverblue/10 flex items-center justify-center">
                        <Eye className="w-5 h-5 text-viverblue" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base font-semibold text-foreground">
                          Funcionalidades de Uso
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          O que os usuários podem ver, acessar e usar na plataforma
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-viverblue/10 text-viverblue border-viverblue/20">
                        {activeUsagePerms.length}/{usagePermissions.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {usagePermissions.map(renderPermissionItem)}
                  </CardContent>
                </Card>
              )}

              {/* Funcionalidades de Gestão - só para admin */}
              {managementPermissions.length > 0 && (
                <Card className="border border-destructive/20 bg-destructive/5">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                        <Crown className="w-5 h-5 text-destructive" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base font-semibold text-foreground">
                          Funcionalidades de Gestão
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          <strong className="text-destructive">Atenção:</strong> Controles administrativos - usar com cuidado
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                        {activeMgmtPerms.length}/{managementPermissions.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {managementPermissions.map(renderPermissionItem)}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="flex-shrink-0 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-aurora" />
              <span>
                <span className="font-medium text-aurora">{activePermissions}</span> de {totalPermissions} permissões ativas
              </span>
            </div>
            <Button 
              onClick={() => onOpenChange(false)}
              className="bg-aurora hover:bg-aurora/90 text-white px-6"
            >
              Salvar e Fechar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}