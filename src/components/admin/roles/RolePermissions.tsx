
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Role } from '@/hooks/admin/useRoles';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Permission {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string | null;
}

interface RolePermissionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
}

export const RolePermissions = ({ open, onOpenChange, role }: RolePermissionsProps) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && role) {
      fetchPermissions();
      fetchRolePermissions();
    }
  }, [open, role]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('permission_definitions')
        .select('*')
        .order('category, name');

      if (error) throw error;
      
      setPermissions(data || []);
    } catch (error) {
      console.error('Erro ao buscar permissões:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as permissões.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRolePermissions = async () => {
    if (!role) return;
    
    try {
      const { data, error } = await (supabase as any)
        .from('role_permissions')
        .select('permission_id')
        .eq('role_id', role.id);

      if (error) throw error;
      
      const permissionIds = Array.isArray(data) 
        ? data.map((item: any) => item?.permission_id).filter(Boolean)
        : [];
      
      setSelectedPermissions(permissionIds);
    } catch (error) {
      console.error('Erro ao buscar permissões do papel:', error);
    }
  };

  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    setSelectedPermissions(prev => 
      checked 
        ? [...prev, permissionId]
        : prev.filter(id => id !== permissionId)
    );
  };

  const savePermissions = async () => {
    if (!role) return;
    
    setSaving(true);
    try {
      // Remover permissões existentes
      const { error: deleteError } = await (supabase as any)
        .from('role_permissions')
        .delete()
        .eq('role_id', role.id);

      if (deleteError) throw deleteError;

      // Adicionar novas permissões
      if (selectedPermissions.length > 0) {
        const permissionRecords = selectedPermissions.map(permissionId => ({
          role_id: role.id,
          permission_id: permissionId
        }));

        const { error: insertError } = await (supabase as any)
          .from('role_permissions')
          .insert(permissionRecords);

        if (insertError) throw insertError;
      }

      toast({
        title: "Sucesso",
        description: "Permissões atualizadas com sucesso.",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar permissões:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar as permissões.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    const category = permission.category || 'Geral';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Gerenciar Permissões - {role?.name}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">Carregando permissões...</div>
        ) : (
          <div className="space-y-6">
            <ScrollArea className="h-96">
              <div className="space-y-6">
                {Object.keys(groupedPermissions).map(category => (
                  <div key={category}>
                    <h3 className="font-medium text-lg mb-3">{category}</h3>
                    <div className="space-y-2 pl-4">
                      {groupedPermissions[category].map(permission => (
                        <div key={permission.id} className="flex items-start space-x-3">
                          <Checkbox
                            id={`permission-${permission.id}`}
                            checked={selectedPermissions.includes(permission.id)}
                            onCheckedChange={(checked) => 
                              handlePermissionToggle(permission.id, checked as boolean)
                            }
                          />
                          <div className="flex-1">
                            <label 
                              htmlFor={`permission-${permission.id}`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {permission.name}
                            </label>
                            {permission.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {permission.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={savePermissions} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar Permissões'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
