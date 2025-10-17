
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tool } from '@/types/toolTypes';
import { supabase } from '@/lib/supabase';
import { Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface BenefitAccessControlProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tool: Tool | null;
}

interface Role {
  id: string;
  name: string;
  description: string | null;
}

export function BenefitAccessControl({ 
  open, 
  onOpenChange, 
  tool 
}: BenefitAccessControlProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [allowedRoles, setAllowedRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Buscar papéis disponíveis
  useEffect(() => {
    if (tool && open) {
      fetchRoles();
      fetchToolAccess();
    }
  }, [tool, open]);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('name');

      if (error) throw error;
      setRoles(data || []);
    } catch (err) {
      console.error('Erro ao buscar papéis:', err);
      toast.error('Erro ao carregar papéis');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchToolAccess = async () => {
    if (!tool) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('benefit_access_control')
        .select('role_id')
        .eq('tool_id', tool.id);

      if (error) throw error;
      
      // Extrair IDs de papéis permitidos
      setAllowedRoles(data.map(item => item.role_id));
    } catch (err) {
      console.error('Erro ao buscar acesso ao benefício:', err);
      toast.error('Erro ao carregar configurações de acesso');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (roleId: string, isChecked: boolean) => {
    if (!tool) return;
    
    setIsSaving(true);
    
    try {
      if (isChecked) {
        // Adicionar acesso
        const { error } = await supabase
          .from('benefit_access_control')
          .insert({ 
            tool_id: tool.id, 
            role_id: roleId 
          });
          
        if (error) throw error;
        setAllowedRoles(prev => [...prev, roleId]);
        toast.success('Acesso concedido ao papel');
      } else {
        // Remover acesso
        const { error } = await supabase
          .from('benefit_access_control')
          .delete()
          .eq('tool_id', tool.id)
          .eq('role_id', roleId);
          
        if (error) throw error;
        setAllowedRoles(prev => prev.filter(id => id !== roleId));
        toast.success('Acesso removido do papel');
      }
    } catch (err) {
      console.error('Erro ao atualizar acesso:', err);
      toast.error('Erro ao atualizar acesso');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Controle de Acesso ao Benefício</DialogTitle>
          <DialogDescription>
            {tool ? 
              `Configure quais papéis podem acessar o benefício "${tool.benefit_title || tool.name}"` : 
              "Selecione um benefício para configurar o acesso"
            }
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Carregando...</span>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="flex items-center space-x-2 rounded-md border p-4 bg-status-warning/10">
              <Shield className="h-5 w-5 text-status-warning" />
              <div className="text-sm">
                <p className="font-medium text-status-warning">Acesso Restrito</p>
                <p className="text-status-warning/80 text-xs">
                  Os papéis selecionados terão acesso a este benefício. Se nenhum papel for selecionado, o benefício estará disponível para todos.
                </p>
              </div>
            </div>
            
            {roles.length > 0 ? (
              <div className="space-y-4">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-center space-x-2 p-2 rounded hover:bg-muted">
                    <Checkbox
                      id={role.id}
                      checked={allowedRoles.includes(role.id)}
                      onCheckedChange={(checked) => handleRoleChange(role.id, checked === true)}
                      disabled={isSaving}
                    />
                    <label
                      htmlFor={role.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                    >
                      {role.name}
                      {role.description && (
                        <p className="text-xs text-muted-foreground mt-1">{role.description}</p>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Nenhum papel encontrado. Crie papéis para gerenciar o acesso.
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
