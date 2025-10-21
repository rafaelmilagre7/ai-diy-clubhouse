
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Role, useRoles } from '@/hooks/admin/useRoles';
import { Loader2 } from 'lucide-react';

interface RoleFormProps {
  role?: Role | null;
  onSave?: () => void;
  onCancel?: () => void;
}

const defaultPermissions = {
  admin: false,
  formacao: false,
  learning: false,
  tools: false,
  community: false,
  certificates: false,
  lovable_course: false,
  builder: false,
  builder_limit: 3
};

export const RoleForm: React.FC<RoleFormProps> = ({ role, onSave, onCancel }) => {
  const { createRole, updateRole, isCreating, isUpdating } = useRoles();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_system: false,
    permissions: defaultPermissions
  });

  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description || '',
        is_system: role.is_system,
        permissions: { ...defaultPermissions, ...role.permissions }
      });
    }
  }, [role]);

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: checked
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (role) {
        await updateRole(role.id, formData);
      } else {
        await createRole({
          name: formData.name,
          description: formData.description,
          is_system: formData.is_system,
          permissions: formData.permissions
        });
      }
      
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Erro ao salvar role:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{role ? 'Editar Papel' : 'Criar Novo Papel'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>Permissões</Label>
            <div className="space-y-2">
              {Object.keys(defaultPermissions).map((permission) => (
                <div key={permission} className="flex items-center space-x-2">
                  <Checkbox
                    id={permission}
                    checked={formData.permissions[permission] || false}
                    onCheckedChange={(checked) => handlePermissionChange(permission, !!checked)}
                    disabled={isLoading}
                  />
                  <Label htmlFor={permission} className="capitalize">
                    {permission.replace('_', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_system"
              checked={formData.is_system}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_system: !!checked }))}
              disabled={isLoading}
            />
            <Label htmlFor="is_system">Papel do Sistema</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {role ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
