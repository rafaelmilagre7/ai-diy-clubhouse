
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader } from 'lucide-react';

interface CreateInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  roles: any[];
  isCreating: boolean;
}

export const CreateInviteDialog = ({
  open,
  onOpenChange,
  onSubmit,
  roles,
  isCreating
}: CreateInviteDialogProps) => {
  const [formData, setFormData] = useState({
    email: '',
    roleId: '',
    notes: '',
    whatsappNumber: '',
    userName: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleClose = () => {
    if (!isCreating) {
      setFormData({
        email: '',
        roleId: '',
        notes: '',
        whatsappNumber: '',
        userName: ''
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Novo Convite</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="usuario@exemplo.com"
              required
              disabled={isCreating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userName">Nome do Usuário</Label>
            <Input
              id="userName"
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              placeholder="Nome completo"
              disabled={isCreating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="roleId">Cargo *</Label>
            <Select
              value={formData.roleId}
              onValueChange={(value) => setFormData({ ...formData, roleId: value })}
              disabled={isCreating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cargo" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsappNumber">WhatsApp (opcional)</Label>
            <Input
              id="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
              placeholder="+55 11 99999-9999"
              disabled={isCreating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Informações adicionais sobre o convite..."
              rows={3}
              disabled={isCreating}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !formData.email || !formData.roleId}
            >
              {isCreating ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Convite'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
