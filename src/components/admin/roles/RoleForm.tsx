
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Role, useRoles } from '@/hooks/admin/useRoles';
import { useRolePermissionSync } from '@/hooks/admin/useRolePermissionSync';
import { Loader2, Info } from 'lucide-react';
import { PermissionCategory } from './PermissionCategory';
import { defaultPermissions, permissionCategories } from './permissionConfig';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { showModernLoading, showModernSuccess, showModernError, dismissModernToast } from '@/lib/toast-helpers';

interface RoleFormProps {
  role?: Role | null;
  onSave?: () => void;
  onCancel?: () => void;
}

export const RoleForm: React.FC<RoleFormProps> = ({ role, onSave, onCancel }) => {
  const { createRole, updateRole, isCreating, isUpdating } = useRoles();
  const { syncRolePermissions } = useRolePermissionSync();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_system: false,
    permissions: defaultPermissions
  });

  const isLoading = isCreating || isUpdating;
  const hasAdminPermission = formData.permissions.admin === true;

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
    
    const loadingId = showModernLoading(
      role ? "Atualizando papel" : "Criando papel",
      "Salvando informações e permissões"
    );
    
    try {
      let savedRoleId = role?.id;
      let savedRoleName = formData.name;

      if (role) {
        await updateRole(role.id, formData);
      } else {
        const newRole = await createRole({
          name: formData.name,
          description: formData.description,
          is_system: formData.is_system,
          permissions: formData.permissions
        });
        savedRoleId = newRole?.id;
      }

      // Sincronizar permissões em tempo real
      if (savedRoleId) {
        await syncRolePermissions(savedRoleId, savedRoleName);
      }
      
      dismissModernToast(loadingId);
      showModernSuccess(
        role ? "Papel atualizado" : "Papel criado",
        "Permissões configuradas com sucesso"
      );
      
      if (onSave) {
        onSave();
      }
    } catch (error: any) {
      console.error('Erro ao salvar role:', error);
      dismissModernToast(loadingId);
      showModernError(
        "Erro ao salvar papel",
        error.message || "Não foi possível salvar. Verifique os dados."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Papel</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            disabled={isLoading}
            placeholder="Ex: membro_premium, membro_basico"
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
            placeholder="Descreva o que este papel representa..."
            rows={2}
          />
        </div>
      </div>

      {/* Aviso de Admin */}
      {hasAdminPermission && (
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <Info className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-600 dark:text-amber-400">
            <strong>Atenção:</strong> Usuários com permissão administrativa terão acesso total à plataforma automaticamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Permissões Organizadas por Categoria */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">Permissões de Acesso</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Selecione quais recursos os usuários com este papel poderão acessar
        </p>
        
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {permissionCategories.map((category) => (
              <PermissionCategory
                key={category.title}
                title={category.title}
                icon={category.icon}
                permissions={category.permissions}
                selectedPermissions={formData.permissions}
                onPermissionChange={handlePermissionChange}
                disabled={isLoading}
              />
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Papel do Sistema */}
      <div className="flex items-center space-x-2 p-4 rounded-lg border border-border bg-muted/30">
        <Checkbox
          id="is_system"
          checked={formData.is_system}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_system: !!checked }))}
          disabled={isLoading}
        />
        <div className="flex-1">
          <Label htmlFor="is_system" className="font-medium cursor-pointer">
            Papel do Sistema
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            Papéis do sistema não podem ser deletados e são protegidos
          </p>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end space-x-2 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {role ? 'Atualizar Papel' : 'Criar Papel'}
        </Button>
      </div>
    </form>
  );
};
