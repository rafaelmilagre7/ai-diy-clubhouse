
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
import { Checkbox } from "@/components/ui/checkbox";
import { Role } from "@/hooks/admin/useRoles";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { usePermissions, Permission } from "@/hooks/auth/usePermissions";
import { Loader2 } from "lucide-react";
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

      // Corrigindo o acesso à propriedade code
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
        // Adicionar permissão
        const { error } = await supabase
          .from("role_permissions")
          .insert({
            role_id: role.id,
            permission_id: permission.id
          });
          
        if (error) throw error;
        
        setRolePermissions(prev => [...prev, permission.code]);
        toast.success(`Permissão "${permission.name}" adicionada ao papel`);
      } else {
        // Remover permissão
        const { error } = await supabase
          .from("role_permissions")
          .delete()
          .eq("role_id", role.id)
          .eq("permission_id", permission.id);
          
        if (error) throw error;
        
        setRolePermissions(prev => 
          prev.filter(code => code !== permission.code)
        );
        toast.success(`Permissão "${permission.name}" removida do papel`);
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
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Permissões</DialogTitle>
          <DialogDescription>
            {role ? `Configure as permissões para o papel ${role.name}` : ""}
          </DialogDescription>
        </DialogHeader>

        {(loading || isLoading) ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Carregando permissões...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <Accordion type="multiple" className="w-full">
              {Object.entries(permissionsByCategory).map(([category, perms]) => (
                <AccordionItem 
                  value={category} 
                  key={category}
                  className="border rounded-md px-4"
                >
                  <AccordionTrigger className="text-lg font-medium capitalize">
                    {category}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {perms.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-center space-x-2 p-2 rounded hover:bg-muted"
                        >
                          <Checkbox
                            id={permission.id}
                            checked={rolePermissions.includes(permission.code)}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(
                                permission, 
                                checked === true
                              )
                            }
                            disabled={isSaving}
                          />
                          <div className="grid gap-1">
                            <label
                              htmlFor={permission.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {permission.name}
                            </label>
                            <p className="text-xs text-muted-foreground">
                              {permission.description || "Sem descrição"}
                            </p>
                            <p className="text-xs text-gray-400">
                              Código: {permission.code}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
