import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader, Mail, MessageSquare, AlertTriangle } from 'lucide-react';
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
    userName: '',
    channels: ['email'] as ('email' | 'whatsapp')[]
  });
  const handleChannelChange = (channel: 'email' | 'whatsapp', checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        channels: [...prev.channels, channel]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        channels: prev.channels.filter(c => c !== channel)
      }));
    }
  };
  const hasWhatsApp = formData.channels.includes('whatsapp');
  const isWhatsAppValidationError = hasWhatsApp && (!formData.userName || formData.userName.trim() === '');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validações finais
    if (formData.channels.length === 0) {
      return; // Pelo menos um canal deve estar selecionado
    }
    if (hasWhatsApp && (!formData.userName || formData.userName.trim() === '')) {
      return; // Nome obrigatório para WhatsApp
    }
    console.log('📧 [CREATE-INVITE-DIALOG] Enviando dados:', formData);
    onSubmit(formData);
  };
  const handleClose = () => {
    if (!isCreating) {
      setFormData({
        email: '',
        roleId: '',
        notes: '',
        whatsappNumber: '',
        userName: '',
        channels: ['email']
      });
      onOpenChange(false);
    }
  };
  return <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Convite</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" value={formData.email} onChange={e => setFormData({
            ...formData,
            email: e.target.value
          })} placeholder="usuario@exemplo.com" required disabled={isCreating} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userName">Nome da Pessoa</Label>
            <Input id="userName" value={formData.userName} onChange={e => setFormData({
            ...formData,
            userName: e.target.value
          })} placeholder="Nome completo" disabled={isCreating} className={isWhatsAppValidationError ? 'border-red-500' : ''} />
            {isWhatsAppValidationError && <p className="text-sm text-red-500">Nome obrigatório para envio via WhatsApp</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="roleId">Cargo *</Label>
            <Select value={formData.roleId} onValueChange={value => setFormData({
            ...formData,
            roleId: value
          })} disabled={isCreating}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cargo" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Seção de Canais */}
          <div className="space-y-3">
            <Label>Canais de Envio *</Label>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 rounded-lg border">
                <Checkbox id="email-channel" checked={formData.channels.includes('email')} onCheckedChange={checked => handleChannelChange('email', checked as boolean)} disabled={isCreating} />
                <div className="flex-1">
                  <Label htmlFor="email-channel" className="flex items-center gap-2 cursor-pointer">
                    <Mail className="h-4 w-4 text-blue-500" />
                    Email
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enviar convite por email (recomendado)
                  </p>
                </div>
              </div>

              <div className="bg-slate-950">
                <Checkbox id="whatsapp-channel" checked={hasWhatsApp} onCheckedChange={checked => handleChannelChange('whatsapp', checked as boolean)} disabled={isCreating} />
                <div className="flex-1">
                  <Label htmlFor="whatsapp-channel" className="flex items-center gap-2 cursor-pointer">
                    <MessageSquare className="h-4 w-4 text-green-500" />
                    WhatsApp
                    <span className="text-xs text-orange-500">*Nome obrigatório</span>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enviar convite via WhatsApp
                  </p>
                </div>
              </div>
            </div>

            {formData.channels.length === 0 && <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertTriangle className="h-4 w-4" />
                Pelo menos um canal deve ser selecionado
              </div>}
          </div>

          {hasWhatsApp && <div className="space-y-2 p-3 rounded-lg border border-green-200 bg-emerald-700">
              <Label htmlFor="whatsapp-number">Número do WhatsApp</Label>
              <Input id="whatsapp-number" type="tel" placeholder="+55 (11) 99999-9999" value={formData.whatsappNumber} onChange={e => setFormData({
            ...formData,
            whatsappNumber: e.target.value
          })} disabled={isCreating} />
              <p className="text-xs text-muted-foreground">
                Inclua o código do país (+55 para Brasil)
              </p>
            </div>}

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" value={formData.notes} onChange={e => setFormData({
            ...formData,
            notes: e.target.value
          })} placeholder="Informações adicionais sobre o convite..." rows={3} disabled={isCreating} />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isCreating}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating || !formData.email || !formData.roleId || formData.channels.length === 0 || isWhatsAppValidationError}>
              {isCreating ? <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </> : 'Criar Convite'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>;
};