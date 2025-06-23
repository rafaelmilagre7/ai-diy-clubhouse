
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, Send, Calendar, Users, Settings } from 'lucide-react';
import { useCommunications } from '@/hooks/admin/useCommunications';
import { toast } from 'sonner';

interface CommunicationEditorProps {
  communication?: any;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

export const CommunicationEditor = ({ communication, onSave, onCancel }: CommunicationEditorProps) => {
  const { availableRoles } = useCommunications();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    email_subject: '',
    template_type: 'announcement',
    priority: 'normal',
    target_roles: [],
    delivery_channels: ['notification'],
    status: 'draft',
    scheduled_for: ''
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (communication) {
      setFormData({
        title: communication.title || '',
        content: communication.content || '',
        email_subject: communication.email_subject || '',
        template_type: communication.template_type || 'announcement',
        priority: communication.priority || 'normal',
        target_roles: communication.target_roles || [],
        delivery_channels: communication.delivery_channels || ['notification'],
        status: communication.status || 'draft',
        scheduled_for: communication.scheduled_for || ''
      });
    }
  }, [communication]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Título e conteúdo são obrigatórios');
      return;
    }

    if (formData.target_roles.length === 0) {
      toast.error('Selecione pelo menos um grupo de destinatários');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(formData);
      toast.success(communication ? 'Comunicação atualizada!' : 'Comunicação criada!');
    } catch (error) {
      toast.error('Erro ao salvar comunicação');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRoleToggle = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      target_roles: prev.target_roles.includes(roleId)
        ? prev.target_roles.filter(id => id !== roleId)
        : [...prev.target_roles, roleId]
    }));
  };

  const handleChannelToggle = (channel: string) => {
    setFormData(prev => ({
      ...prev,
      delivery_channels: prev.delivery_channels.includes(channel)
        ? prev.delivery_channels.filter(c => c !== channel)
        : [...prev.delivery_channels, channel]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {communication ? 'Editar Comunicação' : 'Nova Comunicação'}
          </h1>
          <p className="text-muted-foreground">
            {communication ? 'Modifique os dados da comunicação' : 'Crie uma nova comunicação para enviar aos usuários'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Título da comunicação"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email_subject">Assunto do Email</Label>
                <Input
                  id="email_subject"
                  value={formData.email_subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, email_subject: e.target.value }))}
                  placeholder="Assunto para emails (opcional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template_type">Tipo de Template</Label>
                  <Select 
                    value={formData.template_type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, template_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="announcement">Anúncio</SelectItem>
                      <SelectItem value="maintenance">Manutenção</SelectItem>
                      <SelectItem value="event">Evento</SelectItem>
                      <SelectItem value="educational">Educacional</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduled_for">Agendamento (Opcional)</Label>
                <Input
                  id="scheduled_for"
                  type="datetime-local"
                  value={formData.scheduled_for}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_for: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Destinatários e Canais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Destinatários e Canais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Grupos de Destinatários *</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
                  {availableRoles.map((role) => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`role-${role.id}`}
                        checked={formData.target_roles.includes(role.name)}
                        onCheckedChange={() => handleRoleToggle(role.name)}
                      />
                      <Label htmlFor={`role-${role.id}`} className="text-sm">
                        {role.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Canais de Entrega</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="channel-notification"
                      checked={formData.delivery_channels.includes('notification')}
                      onCheckedChange={() => handleChannelToggle('notification')}
                    />
                    <Label htmlFor="channel-notification" className="text-sm">
                      Notificação In-App
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="channel-email"
                      checked={formData.delivery_channels.includes('email')}
                      onCheckedChange={() => handleChannelToggle('email')}
                    />
                    <Label htmlFor="channel-email" className="text-sm">
                      Email
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conteúdo */}
        <Card>
          <CardHeader>
            <CardTitle>Conteúdo da Comunicação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Escreva o conteúdo da comunicação..."
                rows={10}
                required
              />
              <p className="text-xs text-muted-foreground">
                Você pode usar HTML básico para formatação
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};
