import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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

// Reorganizar permissões por tipo de role
const organizePermissions = (permissions: Permission[], isSystemAdmin: boolean) => {
  if (isSystemAdmin) {
    // Admin vê todas as permissões organizadas por categoria
    const adminPermissions: Permission[] = [];
    const systemPermissions: Permission[] = [];
    
    permissions.forEach(permission => {
      if (permission.category === 'admin') {
        adminPermissions.push(permission);
      } else {
        systemPermissions.push(permission);
      }
    });
    
    return { adminPermissions, systemPermissions, userFeatures: [] };
  } else {
    // Roles personalizados veem apenas funcionalidades de uso
    const userFeatures = permissions.filter(p => p.category === 'features' || p.category === 'feature');
    return { adminPermissions: [], systemPermissions: [], userFeatures };
  }
};

// Mapear ícones para funcionalidades específicas
const getFeatureIcon = (permission: Permission) => {
  const code = permission.code.toLowerCase();
  
  const iconMap: Record<string, any> = {
    'ai_trail.access': Zap,
    'solutions.access': FileText,
    'learning.access': BookOpen,
    'certificates.access': Shield,
    'tools.access': Settings,
    'benefits.access': Crown,
    'networking.access': Users,
    'community.access': MessageSquare,
    'events.access': Globe,
    'suggestions.access': Edit,
  };
  
  return iconMap[code] || Eye;
};

// Mapear ícones para funcionalidades administrativas
const getAdminIcon = (permission: Permission) => {
  const code = permission.code.toLowerCase();
  
  if (code.includes('dashboard')) return BarChart3;
  if (code.includes('users')) return Users;
  if (code.includes('system')) return Settings;
  if (code.includes('analytics')) return BarChart3;
  if (code.includes('content')) return FileText;
  
  return Crown;
};

// Cores específicas por funcionalidade
const getFeatureColor = (permission: Permission, isActive: boolean = false) => {
  const code = permission.code.toLowerCase();
  
  const colorMap: Record<string, string> = {
    'ai_trail.access': isActive ? 'bg-aurora-primary/20 text-aurora-primary border-aurora-primary/30' : 'bg-aurora-primary/5 text-aurora-primary/70',
    'solutions.access': isActive ? 'bg-operational/20 text-operational border-operational/30' : 'bg-operational/5 text-operational/70',
    'learning.access': isActive ? 'bg-strategy/20 text-strategy border-strategy/30' : 'bg-strategy/5 text-strategy/70',
    'certificates.access': isActive ? 'bg-aurora-primary/20 text-aurora-primary border-aurora-primary/30' : 'bg-aurora-primary/5 text-aurora-primary/70',
    'tools.access': isActive ? 'bg-revenue/20 text-revenue border-revenue/30' : 'bg-revenue/5 text-revenue/70',
    'benefits.access': isActive ? 'bg-aurora-primary/20 text-aurora-primary border-aurora-primary/30' : 'bg-aurora-primary/5 text-aurora-primary/70',
    'networking.access': isActive ? 'bg-operational/20 text-operational border-operational/30' : 'bg-operational/5 text-operational/70',
    'community.access': isActive ? 'bg-strategy/20 text-strategy border-strategy/30' : 'bg-strategy/5 text-strategy/70',
    'events.access': isActive ? 'bg-aurora-primary/20 text-aurora-primary border-aurora-primary/30' : 'bg-aurora-primary/5 text-aurora-primary/70',
    'suggestions.access': isActive ? 'bg-revenue/20 text-revenue border-revenue/30' : 'bg-revenue/5 text-revenue/70',
  };
  
  return `text-xs font-medium px-2 py-1 rounded ${colorMap[code] || (isActive ? 'bg-muted text-muted-foreground' : 'bg-muted/50 text-muted-foreground')}`;
};

// Descrições específicas por funcionalidade
const getFeatureDescription = (permission: Permission) => {
  const code = permission.code.toLowerCase();
  
  const descriptions: Record<string, string> = {
    'ai_trail.access': 'Acesso às trilhas personalizadas de implementação com IA',
    'solutions.access': 'Visualizar e explorar o catálogo completo de soluções',
    'learning.access': 'Participar dos cursos e formações da plataforma',
    'certificates.access': 'Gerar e baixar certificados de conclusão',
    'tools.access': 'Utilizar ferramentas e recursos exclusivos',
    'benefits.access': 'Acessar benefícios e descontos exclusivos',
    'networking.access': 'Conectar-se com outros membros da comunidade',
    'community.access': 'Participar de discussões e fóruns',
    'events.access': 'Ver e participar de eventos e webinars',
    'suggestions.access': 'Enviar sugestões de melhorias para a plataforma',
  };
  
  return descriptions[code] || permission.description || 'Funcionalidade da plataforma';
};

export function RolePermissions({ open, onOpenChange, role }: RolePermissionsProps) {
  const { permissions, loading, fetchUserPermissions } = usePermissions();
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  // Verificar se é admin do sistema
  const isSystemAdmin = role?.name === 'admin' || role?.is_system;
  
  // Organizar permissões baseado no tipo de role
  const { adminPermissions, systemPermissions, userFeatures } = organizePermissions(permissions, isSystemAdmin);
  
  // Calcular estatísticas
  const totalPermissions = permissions.length;
  const activePermissions = rolePermissions.length;
  const activeFeatures = userFeatures.filter(p => rolePermissions.includes(p.code));
  const activeAdminPerms = adminPermissions.filter(p => rolePermissions.includes(p.code));

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
        // 1. Inserir na tabela role_permissions (relacional)
        const { error } = await supabase
          .from("role_permissions")
          .insert({
            role_id: role.id,
            permission_id: permission.id
          });
          
        if (error) throw error;
        
        setRolePermissions(prev => [...prev, permission.code]);
        toast.success(`Acesso ativado`);
      } else {
        // 1. Remover da tabela role_permissions (relacional)
        const { error } = await supabase
          .from("role_permissions")
          .delete()
          .eq("role_id", role.id)
          .eq("permission_id", permission.id);
          
        if (error) throw error;
        
        setRolePermissions(prev => 
          prev.filter(code => code !== permission.code)
        );
        toast.success(`Acesso removido`);
      }

      // 2. 🔄 SINCRONIZAR CAMPO JSONB na tabela user_roles
      try {
        console.log('🔄 [PERMISSION_SYNC] Sincronizando permissões para o campo JSONB...');
        const { data: syncResult, error: syncError } = await supabase.rpc('sync_role_permissions_to_jsonb');
        
        if (syncError) {
          console.error('❌ [PERMISSION_SYNC] Erro na sincronização JSONB:', syncError);
        } else {
          console.log('✅ [PERMISSION_SYNC] Sincronização JSONB concluída:', syncResult);
        }
      } catch (syncErr) {
        console.error('❌ [PERMISSION_SYNC] Falha na sincronização:', syncErr);
        // Não bloquear a operação principal se a sincronização falhar
      }

      // 3. 🔄 INVALIDAR TODOS OS CACHES DE PERMISSÕES
      // Invalida React Query cache
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['feature-access'] });
      queryClient.invalidateQueries({ queryKey: ['smart-feature-access'] });
      
      // Força atualização do hook usePermissions para todos os usuários
      await fetchUserPermissions();
      
      console.log('🔄 [ADMIN] Cache de permissões invalidado após mudança no role:', role.name);
      toast.success('⚡ Alterações aplicadas e sincronizadas!', {
        description: 'Permissões ativas em tempo real para todos os usuários'
      });
      
    } catch (err) {
      console.error("Erro ao atualizar permissão:", err);
      toast.error("Erro ao atualizar permissão");
    } finally {
      setIsSaving(false);
    }
  };

  const renderFeatureItem = (permission: Permission) => {
    const isActive = rolePermissions.includes(permission.code);
    const FeatureIcon = getFeatureIcon(permission);
    
    return (
      <div
        key={permission.id}
        className={`group relative rounded-xl border transition-smooth ${
            isActive 
              ? 'bg-aurora-primary/5 border-aurora-primary/30 shadow-lg shadow-aurora-primary/5' 
              : 'bg-card border-border/30 hover:border-aurora-primary/20 hover:bg-aurora-primary/5'
        }`}
      >
        <div className="flex items-center gap-4 p-5">
          <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
            isActive 
              ? 'bg-aurora-primary/15 text-aurora-primary shadow-sm' 
              : 'bg-muted/50 text-muted-foreground group-hover:bg-aurora-primary/10 group-hover:text-aurora-primary'
          }`}>
            <FeatureIcon className="w-6 h-6" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-semibold text-base text-foreground">
                {permission.name}
              </h4>
              {isActive && (
                <CheckCircle2 className="w-5 h-5 text-aurora-primary flex-shrink-0" />
              )}
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              {getFeatureDescription(permission)}
            </p>
            
            <Badge className={getFeatureColor(permission, isActive)}>
              {permission.code}
            </Badge>
          </div>
          
          <Switch
            checked={isActive}
            onCheckedChange={(checked) => handlePermissionChange(permission, checked)}
            disabled={isSaving}
            className="flex-shrink-0 scale-110"
          />
        </div>
      </div>
    );
  };

  const renderAdminPermission = (permission: Permission) => {
    const isActive = rolePermissions.includes(permission.code);
    const AdminIcon = getAdminIcon(permission);
    
    return (
      <div
        key={permission.id}
        className={`group relative rounded-lg border transition-smooth ${
          isActive 
            ? 'bg-destructive/5 border-destructive/20' 
            : 'bg-card border-border/30 hover:border-destructive/20'
        }`}
      >
        <div className="flex items-center gap-3 p-4">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isActive 
              ? 'bg-destructive/10 text-destructive' 
              : 'bg-muted/50 text-muted-foreground'
          }`}>
            <AdminIcon className="w-4 h-4" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm text-foreground">
                {permission.name}
              </h4>
              {isActive && <CheckCircle2 className="w-4 h-4 text-destructive" />}
            </div>
            <p className="text-xs text-muted-foreground">
              {permission.description}
            </p>
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-aurora-primary/20 to-aurora-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-aurora-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold text-foreground">
                {isSystemAdmin ? 'Permissões Administrativas' : 'Funcionalidades de Acesso'}
              </DialogTitle>
              {role && (
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  {isSystemAdmin 
                    ? `Controle completo do sistema para o papel ${role.name}` 
                    : `Definir quais funcionalidades usuários com o papel "${role.name}" podem acessar`
                  }
                </DialogDescription>
              )}
            </div>
          </div>
          
          {role && (
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-aurora-primary/10 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-aurora-primary" />
                <span className="text-sm font-medium text-aurora-primary">
                  {activePermissions} ativas
                </span>
              </div>
              
              {!isSystemAdmin && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-aurora-primary-light/10 rounded-full">
                  <Globe className="w-4 h-4 text-aurora-primary-light" />
                  <span className="text-sm text-aurora-primary-light">
                    {activeFeatures.length} de {userFeatures.length} funcionalidades
                  </span>
                </div>
              )}
              
              {isSystemAdmin && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 rounded-full">
                  <Crown className="w-4 h-4 text-destructive" />
                  <span className="text-sm text-destructive">
                    {activeAdminPerms.length} administrativas
                  </span>
                </div>
              )}
            </div>
          )}
        </DialogHeader>

        {(loading || isLoading) ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-aurora-primary/10 flex items-center justify-center mx-auto">
                <Loader2 className="w-6 h-6 animate-spin text-aurora-primary" />
              </div>
              <p className="text-muted-foreground">Carregando permissões...</p>
            </div>
          </div>
        ) : (
            <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto space-y-6 pr-2" style={{ scrollbarGutter: 'stable' }}>
              
              {/* Funcionalidades para Roles Personalizados */}
              {!isSystemAdmin && userFeatures.length > 0 && (
                  <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-aurora-primary/20 to-aurora-primary/10 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-aurora-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Funcionalidades da Plataforma
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Selecione quais áreas e recursos os usuários podem acessar
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid gap-4">
                    {userFeatures.map(renderFeatureItem)}
                  </div>
                </div>
              )}

              {/* Permissões Administrativas para Admin */}
              {isSystemAdmin && (
                <>
                  {adminPermissions.length > 0 && (
                    <Card className="border border-destructive/20">
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                            <Crown className="w-5 h-5 text-destructive" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-base font-semibold text-foreground">
                              Controles Administrativos
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              Permissões de alta segurança para gestão da plataforma
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                            {activeAdminPerms.length}/{adminPermissions.length}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {adminPermissions.map(renderAdminPermission)}
                      </CardContent>
                    </Card>
                  )}

                  {systemPermissions.length > 0 && (
                    <Card className="border border-muted">
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                            <Settings className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-base font-semibold text-foreground">
                              Funcionalidades do Sistema
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              Acesso às funcionalidades e recursos da plataforma
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {systemPermissions.map(renderAdminPermission)}
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="flex-shrink-0 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-aurora" />
              <span>
                <span className="font-medium text-aurora">{activePermissions}</span> de {
                  isSystemAdmin ? totalPermissions : userFeatures.length
                } {isSystemAdmin ? 'permissões' : 'funcionalidades'} ativas
              </span>
            </div>
            <Button 
              onClick={() => onOpenChange(false)}
              className="bg-aurora hover:bg-aurora/90 text-primary-foreground px-6"
            >
              Salvar Alterações
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}