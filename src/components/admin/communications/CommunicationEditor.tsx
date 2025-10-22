import React, { useState, useEffect } from 'react';
import { createSafeHTML } from '@/utils/htmlSanitizer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Send, Eye, Users, Mail, Bell, Calendar } from 'lucide-react';
import { useCommunications, AdminCommunication } from '@/hooks/admin/useCommunications';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface CommunicationEditorProps {
  communication?: AdminCommunication | null;
  onClose: () => void;
}

const TEMPLATE_TYPES = [
  { value: 'announcement' as const, label: 'Anúncio', description: 'Novidades e atualizações gerais' },
  { value: 'maintenance' as const, label: 'Manutenção', description: 'Avisos de manutenção programada' },
  { value: 'event' as const, label: 'Evento', description: 'Convites para webinars, lives, etc.' },
  { value: 'educational' as const, label: 'Educacional', description: 'Dicas e conteúdo educativo' },
  { value: 'urgent' as const, label: 'Urgente', description: 'Comunicados críticos e importantes' },
];

const PRIORITY_OPTIONS = [
  { value: 'low' as const, label: 'Baixa', color: 'bg-priority-low/10 text-priority-low border-priority-low/20' },
  { value: 'normal' as const, label: 'Normal', color: 'bg-priority-normal/10 text-priority-normal border-priority-normal/20' },
  { value: 'high' as const, label: 'Alta', color: 'bg-priority-high/10 text-priority-high border-priority-high/20' },
  { value: 'urgent' as const, label: 'Urgente', color: 'bg-priority-urgent/10 text-priority-urgent border-priority-urgent/20' },
];

type TemplateType = 'announcement' | 'maintenance' | 'event' | 'educational' | 'urgent';
type Priority = 'low' | 'normal' | 'high' | 'urgent';

export const CommunicationEditor: React.FC<CommunicationEditorProps> = ({
  communication,
  onClose,
}) => {
  const { createCommunication, updateCommunication, availableRoles } = useCommunications();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    email_subject: '',
    template_type: 'announcement' as TemplateType,
    priority: 'normal' as Priority,
    target_roles: [] as string[],
    delivery_channels: ['notification'] as string[],
    scheduled_for: '',
    status: 'draft' as const,
  });
  const [preview, setPreview] = useState(false);
  const [estimatedReach, setEstimatedReach] = useState(0);

  useEffect(() => {
    if (communication) {
      setFormData({
        title: communication.title,
        content: communication.content,
        email_subject: communication.email_subject || '',
        template_type: communication.template_type as TemplateType,
        priority: communication.priority as Priority,
        target_roles: communication.target_roles,
        delivery_channels: communication.delivery_channels,
        scheduled_for: communication.scheduled_for || '',
        status: communication.status as 'draft',
      });
    }
  }, [communication]);

  useEffect(() => {
    // Calcular alcance estimado baseado nos roles selecionados
    const fetchRealReach = async () => {
      if (formData.target_roles.length === 0) {
        setEstimatedReach(0);
        return;
      }

      try {
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .in('role_id', formData.target_roles);

        if (error) throw error;
        setEstimatedReach(count || 0);
      } catch (error) {
        console.error('Erro ao calcular alcance:', error);
        // Fallback para estimativa se houver erro
        setEstimatedReach(formData.target_roles.length * 50);
      }
    };

    fetchRealReach();
  }, [formData.target_roles]);

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

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Título e conteúdo são obrigatórios');
      return;
    }

    if (formData.target_roles.length === 0) {
      toast.error('Selecione pelo menos um role de destino');
      return;
    }

    if (formData.delivery_channels.length === 0) {
      toast.error('Selecione pelo menos um canal de entrega');
      return;
    }

    const data = {
      ...formData,
      email_subject: formData.email_subject || formData.title,
    };

    try {
      if (communication) {
        await updateCommunication.mutateAsync({ id: communication.id, ...data });
      } else {
        await createCommunication.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar comunicação:', error);
    }
  };

  const selectedTemplate = TEMPLATE_TYPES.find(t => t.value === formData.template_type);
  const selectedPriority = PRIORITY_OPTIONS.find(p => p.value === formData.priority);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-modal-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {communication ? 'Editar Comunicado' : 'Novo Comunicado'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Título*</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Título do comunicado"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="template_type">Tipo de Template</Label>
                    <Select
                      value={formData.template_type}
                      onValueChange={(value: TemplateType) => setFormData(prev => ({ ...prev, template_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TEMPLATE_TYPES.map(template => (
                          <SelectItem key={template.value} value={template.value}>
                            <div>
                              <div className="font-medium">{template.label}</div>
                              <div className="text-xs text-muted-foreground">{template.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: Priority) => setFormData(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map(priority => (
                          <SelectItem key={priority.value} value={priority.value}>
                            <Badge className={priority.color}>{priority.label}</Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="content">Conteúdo*</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Conteúdo do comunicado (HTML suportado)"
                    rows={10}
                  />
                </div>

                <div>
                  <Label htmlFor="email_subject">Assunto do E-mail</Label>
                  <Input
                    id="email_subject"
                    value={formData.email_subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, email_subject: e.target.value }))}
                    placeholder="Se vazio, usará o título"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            {preview && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 bg-background">
                    <h3 className="font-semibold text-lg mb-2">{formData.title}</h3>
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={createSafeHTML(formData.content)}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Destinatários */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Destinatários
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {availableRoles?.map(role => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={role.id}
                      checked={formData.target_roles.includes(role.name)}
                      onCheckedChange={() => handleRoleToggle(role.name)}
                    />
                    <Label htmlFor={role.id} className="text-sm font-medium">
                      {role.name}
                    </Label>
                  </div>
                ))}
                {estimatedReach > 0 && (
                  <div className="text-sm text-muted-foreground mt-2">
                    Alcance estimado: ~{estimatedReach} usuários
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Canais de Entrega */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Canais de Entrega</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notification"
                    checked={formData.delivery_channels.includes('notification')}
                    onCheckedChange={() => handleChannelToggle('notification')}
                  />
                  <Bell className="w-4 h-4" />
                  <Label htmlFor="notification" className="text-sm font-medium">
                    Notificação In-App
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email"
                    checked={formData.delivery_channels.includes('email')}
                    onCheckedChange={() => handleChannelToggle('email')}
                  />
                  <Mail className="w-4 h-4" />
                  <Label htmlFor="email" className="text-sm font-medium">
                    E-mail
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Agendamento */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Agendamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="scheduled_for">Agendar para (opcional)</Label>
                  <Input
                    id="scheduled_for"
                    type="datetime-local"
                    value={formData.scheduled_for}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_for: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Ações */}
            <div className="space-y-2">
              <Button
                onClick={() => setPreview(!preview)}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                {preview ? 'Ocultar' : 'Mostrar'} Preview
              </Button>
              
              <Button
                onClick={handleSave}
                className="w-full flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Salvar {communication ? 'Alterações' : 'Comunicado'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
