import { useState } from 'react';
import { AdminCard } from '../ui/AdminCard';
import { Button } from '@/components/ui/button';
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
import { useNotificationActions } from '@/hooks/admin/notifications/useNotificationActions';
import { Send } from 'lucide-react';

export const NotificationTestForm = () => {
  const { sendTestNotification } = useNotificationActions();
  const [formData, setFormData] = useState({
    userId: '',
    category: 'system',
    notificationType: 'test_notification',
    title: 'Notificação de Teste',
    message: 'Esta é uma notificação de teste enviada pelo painel administrativo.',
    priority: 'normal',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendTestNotification.mutate({
      userId: formData.userId,
      category: formData.category,
      notificationType: formData.notificationType,
      title: formData.title,
      message: formData.message,
      priority: formData.priority,
      channels: ['in_app'],
    });
  };

  return (
    <AdminCard>
      <h3 className="text-lg font-semibold mb-md">Enviar Notificação de Teste</h3>
      
      <form onSubmit={handleSubmit} className="space-y-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="space-y-sm">
            <Label htmlFor="userId">ID do Usuário *</Label>
            <Input
              id="userId"
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              placeholder="UUID do usuário"
              required
            />
            <p className="text-xs text-muted-foreground">
              UUID do usuário que receberá a notificação
            </p>
          </div>

          <div className="space-y-sm">
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">Sistema</SelectItem>
                <SelectItem value="suggestions">Sugestões</SelectItem>
                <SelectItem value="solutions">Soluções</SelectItem>
                <SelectItem value="community">Comunidade</SelectItem>
                <SelectItem value="events">Eventos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="space-y-sm">
            <Label htmlFor="notificationType">Tipo</Label>
            <Input
              id="notificationType"
              value={formData.notificationType}
              onChange={(e) => setFormData({ ...formData, notificationType: e.target.value })}
            />
          </div>

          <div className="space-y-sm">
            <Label htmlFor="priority">Prioridade</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value })}
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

        <div className="space-y-sm">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="space-y-sm">
          <Label htmlFor="message">Mensagem *</Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={4}
            required
          />
        </div>

        <div className="bg-surface-elevated p-md rounded-lg border border-border">
          <p className="text-sm font-semibold mb-sm">Preview da Notificação</p>
          <div className="space-y-xs">
            <p className="text-sm font-medium">{formData.title}</p>
            <p className="text-sm text-muted-foreground">{formData.message}</p>
            <div className="flex gap-xs mt-sm">
              <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded">
                {formData.category}
              </span>
              <span className="text-xs px-2 py-1 bg-muted rounded">
                {formData.priority}
              </span>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={sendTestNotification.isPending || !formData.userId}
          className="w-full"
        >
          <Send className="w-4 h-4 mr-sm" />
          {sendTestNotification.isPending ? 'Enviando...' : 'Enviar Notificação de Teste'}
        </Button>
      </form>
    </AdminCard>
  );
};
