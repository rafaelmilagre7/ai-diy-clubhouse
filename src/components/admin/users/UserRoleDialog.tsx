
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Role {
  id: string;
  name: string;
  description: string;
}

interface UserRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  availableRoles: Role[];
  onSuccess: () => void;
}

export const UserRoleDialog: React.FC<UserRoleDialogProps> = ({
  open,
  onOpenChange,
  user,
  availableRoles,
  onSuccess
}) => {
  const [selectedRole, setSelectedRole] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      // Mock update logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating user role:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar Papel do Usuário</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p><strong>Usuário:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
          </div>
          <div>
            <label>Novo Papel:</label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um papel" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map(role => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating || !selectedRole}>
              {isUpdating ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
