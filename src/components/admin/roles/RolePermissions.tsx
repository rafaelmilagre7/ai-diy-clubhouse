
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface Permission {
  id: string;
  name: string;
  code: string;
  description?: string;
  category: string;
}

interface RolePermissionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: { id: string; name: string } | null;
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
      const { data, error } = await supabase
        .from('permission_definitions')
        .select('*')
        .order('category, name');

      if (error) throw error;
      
      setPermissions(data as any || []);
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
      const { data, error } = await supabase
        .from('role_permissions')
        .select('permission_id')
        .eq('role_id', role.id as any);

      if (error) throw error;
      
      const permissionIds = Array.isArray(data) 
        ? data.map((item: any) => item?.permission_id).filter(Boolean)
        : [];
      
      setSelectedPermissions(permissionIds);
    } catch (error) {
      console.error('Erro ao buscar permissões da role:', error);
    }
  };

  const handlePermissionToggle = async (permissionId: string, checked: boolean) => {
    if (!role) return;

    try {
      if (checked) {
        // Adicionar permissão
        const { error } = await supabase
          .from('role_permissions')
          .insert({
            role_id: role.id,
            permission_id: permissionId
          } as any);

        if (error) throw error;
        
        setSelectedPermissions(prev => [...prev, permissionId]);
      } else {
        // Remover permissão
        const { error } = await supabase
          .from('role_permissions')
          .delete()
          .eq('role_id', role.id as any)
          .eq('permission_id', permissionId as any);

        if (error) throw error;
        
        setSelectedPermissions(prev => prev.filter(id => id !== permissionId));
      }

      toast({
        title: "Sucesso",
        description: `Permissão ${checked ? 'adicionada' : 'removida'} com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao alterar permissão:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar a permissão.",
        variant: "destructive",
      });
    }
  };

  // Agrupar permissões por categoria
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (!open || !role) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Permissões - {role.name}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto">
          {loading ? (
            <div className="text-center py-4">Carregando permissões...</div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                <div key={category} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{category}</Badge>
                  </div>
                  <div className="space-y-2 pl-4">
                    {categoryPermissions.map((permission) => (
                      <div key={permission.id} className="flex items-start space-x-3">
                        <Checkbox
                          id={`permission-${permission.id}`}
                          checked={selectedPermissions.includes(permission.id)}
                          onCheckedChange={(checked) => 
                            handlePermissionToggle(permission.id, checked as boolean)
                          }
                          disabled={saving}
                        />
                        <div className="flex-1">
                          <label 
                            htmlFor={`permission-${permission.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {permission.name}
                          </label>
                          {permission.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {permission.description}
                            </p>
                          )}
                          <p className="text-xs text-blue-600 mt-1">
                            {permission.code}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {permissions.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  Nenhuma permissão encontrada.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
