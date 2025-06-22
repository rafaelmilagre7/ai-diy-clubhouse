
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCampaignManagement, type CreateCampaignParams } from '@/hooks/admin/invites/useCampaignManagement';
import { useRoles } from '@/hooks/admin/useRoles';

interface CreateCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateCampaignDialog: React.FC<CreateCampaignDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const { createCampaign, creating } = useCampaignManagement();
  const { roles } = useRoles();
  
  const [formData, setFormData] = useState<CreateCampaignParams>({
    name: '',
    description: '',
    targetRole: '',
    emailTemplate: '',
    whatsappTemplate: '',
    channels: ['email'],
    segmentation: {},
    followUpRules: {
      enabled: false,
      intervals: [3, 7],
      maxAttempts: 2
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const campaignId = await createCampaign(formData);
    if (campaignId) {
      onOpenChange(false);
      // Reset form
      setFormData({
        name: '',
        description: '',
        targetRole: '',
        emailTemplate: '',
        whatsappTemplate: '',
        channels: ['email'],
        segmentation: {},
        followUpRules: {
          enabled: false,
          intervals: [3, 7],
          maxAttempts: 2
        }
      });
    }
  };

  const handleChannelChange = (channel: 'email' | 'whatsapp', checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      channels: checked 
        ? [...prev.channels, channel]
        : prev.channels.filter(c => c !== channel)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Nova Campanha</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Campanha</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Campanha Q1 - Novos Membros"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o objetivo da campanha..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="targetRole">Papel Alvo</Label>
                <Select 
                  value={formData.targetRole} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, targetRole: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o papel dos convidados" />
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
            </CardContent>
          </Card>

          {/* Canais e Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Canais e Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Canais de Envio</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="email"
                      checked={formData.channels.includes('email')}
                      onCheckedChange={(checked) => handleChannelChange('email', checked as boolean)}
                    />
                    <Label htmlFor="email">Email</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="whatsapp"
                      checked={formData.channels.includes('whatsapp')}
                      onCheckedChange={(checked) => handleChannelChange('whatsapp', checked as boolean)}
                    />
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                  </div>
                </div>
              </div>

              {formData.channels.includes('email') && (
                <div>
                  <Label htmlFor="emailTemplate">Template de Email</Label>
                  <Textarea
                    id="emailTemplate"
                    value={formData.emailTemplate}
                    onChange={(e) => setFormData(prev => ({ ...prev, emailTemplate: e.target.value }))}
                    placeholder="Conteúdo do email..."
                    rows={4}
                    required={formData.channels.includes('email')}
                  />
                </div>
              )}

              {formData.channels.includes('whatsapp') && (
                <div>
                  <Label htmlFor="whatsappTemplate">Template de WhatsApp</Label>
                  <Textarea
                    id="whatsappTemplate"
                    value={formData.whatsappTemplate}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsappTemplate: e.target.value }))}
                    placeholder="Mensagem do WhatsApp..."
                    rows={3}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Follow-up */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Regras de Follow-up</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="followUpEnabled"
                  checked={formData.followUpRules.enabled}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({
                      ...prev,
                      followUpRules: { ...prev.followUpRules, enabled: checked as boolean }
                    }))
                  }
                />
                <Label htmlFor="followUpEnabled">Ativar follow-up automático</Label>
              </div>

              {formData.followUpRules.enabled && (
                <>
                  <div>
                    <Label>Intervalos (dias)</Label>
                    <div className="flex space-x-2 mt-2">
                      <Input
                        type="number"
                        placeholder="3"
                        className="w-20"
                        min="1"
                      />
                      <Input
                        type="number"
                        placeholder="7"
                        className="w-20"
                        min="1"
                      />
                      <Input
                        type="number"
                        placeholder="14"
                        className="w-20"
                        min="1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enviar lembretes após X dias sem resposta
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="maxAttempts">Máximo de Tentativas</Label>
                    <Input
                      id="maxAttempts"
                      type="number"
                      value={formData.followUpRules.maxAttempts}
                      onChange={(e) => 
                        setFormData(prev => ({
                          ...prev,
                          followUpRules: { 
                            ...prev.followUpRules, 
                            maxAttempts: parseInt(e.target.value) || 1 
                          }
                        }))
                      }
                      min="1"
                      max="5"
                      className="w-20"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? 'Criando...' : 'Criar Campanha'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
