
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { CreateCampaignParams } from '@/hooks/admin/invites/useCampaignManagement';

interface CreateCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateCampaignParams) => Promise<void>;
  isCreating: boolean;
}

export const CreateCampaignDialog: React.FC<CreateCampaignDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isCreating
}) => {
  const [formData, setFormData] = useState<CreateCampaignParams>({
    name: '',
    description: '',
    target_role_id: undefined,
    email_template: '',
    whatsapp_template: '',
    channels: ['email'],
    segmentation: {},
    follow_up_rules: {
      enabled: false,
      intervals: [],
      maxAttempts: 1
    },
    scheduled_for: undefined
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({
      name: '',
      description: '',
      target_role_id: undefined,
      email_template: '',
      whatsapp_template: '',
      channels: ['email'],
      segmentation: {},
      follow_up_rules: {
        enabled: false,
        intervals: [],
        maxAttempts: 1
      },
      scheduled_for: undefined
    });
  };

  const handleChannelChange = (channel: 'email' | 'whatsapp', checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      channels: checked 
        ? [...prev.channels, channel]
        : prev.channels.filter(c => c !== channel)
    }));
  };

  const handleFollowUpToggle = (enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      follow_up_rules: {
        ...prev.follow_up_rules,
        enabled
      }
    }));
  };

  const isEmailChannelSelected = formData.channels.includes('email');
  const isWhatsAppChannelSelected = formData.channels.includes('whatsapp');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Nova Campanha</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome da Campanha *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Campanha Q1 2024"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o objetivo desta campanha"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="target_role">Papel Alvo (Opcional)</Label>
              <Select 
                value={formData.target_role_id || ''} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, target_role_id: value || undefined }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um papel específico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os papéis</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="formacao">Formação</SelectItem>
                  <SelectItem value="member">Membro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Channels */}
          <div className="space-y-3">
            <Label>Canais de Envio *</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email-channel"
                  checked={isEmailChannelSelected}
                  onCheckedChange={(checked) => handleChannelChange('email', checked as boolean)}
                />
                <Label htmlFor="email-channel">Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="whatsapp-channel"
                  checked={isWhatsAppChannelSelected}
                  onCheckedChange={(checked) => handleChannelChange('whatsapp', checked as boolean)}
                />
                <Label htmlFor="whatsapp-channel">WhatsApp</Label>
              </div>
            </div>
          </div>

          {/* Templates */}
          {isEmailChannelSelected && (
            <div>
              <Label htmlFor="email_template">Template de Email *</Label>
              <Textarea
                id="email_template"
                value={formData.email_template}
                onChange={(e) => setFormData(prev => ({ ...prev, email_template: e.target.value }))}
                placeholder="Digite o template do email..."
                rows={4}
                required={isEmailChannelSelected}
              />
            </div>
          )}

          {isWhatsAppChannelSelected && (
            <div>
              <Label htmlFor="whatsapp_template">Template de WhatsApp</Label>
              <Textarea
                id="whatsapp_template"
                value={formData.whatsapp_template}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_template: e.target.value }))}
                placeholder="Digite o template do WhatsApp..."
                rows={3}
              />
            </div>
          )}

          {/* Follow-up Rules */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Regras de Follow-up</Label>
              <Switch
                checked={formData.follow_up_rules?.enabled || false}
                onCheckedChange={handleFollowUpToggle}
              />
            </div>

            {formData.follow_up_rules?.enabled && (
              <div className="space-y-3 pl-4 border-l-2 border-muted">
                <div>
                  <Label htmlFor="max-attempts">Máximo de Tentativas</Label>
                  <Input
                    id="max-attempts"
                    type="number"
                    min="1"
                    max="5"
                    value={formData.follow_up_rules.maxAttempts || 1}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      follow_up_rules: {
                        ...prev.follow_up_rules,
                        maxAttempts: parseInt(e.target.value) || 1
                      }
                    }))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !formData.name || formData.channels.length === 0}
            >
              {isCreating ? 'Criando...' : 'Criar Campanha'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
