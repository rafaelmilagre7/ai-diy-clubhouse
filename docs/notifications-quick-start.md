# 🚀 Guia Rápido: Sistema de Notificações

## 📋 Checklist de Implementação

Use este guia para implementar o sistema de notificações no frontend.

---

## ✅ Passo 1: Verificar Backend

Todas as migrations e edge functions já foram implementadas:

- [x] Tabela `notifications`
- [x] Tabela `notification_preferences`
- [x] Triggers de eventos, learning, ferramentas e comunidade
- [x] Edge functions deployadas
- [x] Cron jobs configurados

**Ação**: Nenhuma. Backend completo! ✨

---

## ✅ Passo 2: Criar Hook `useNotifications`

**Arquivo**: `src/hooks/useNotifications.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  metadata: Record<string, any>;
  read_at: string | null;
  created_at: string;
}

export function useNotifications() {
  const queryClient = useQueryClient();

  // Buscar notificações
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Notification[];
    }
  });

  // Contar não lidas
  const unreadCount = notifications.filter(n => !n.read_at).length;

  // Marcar como lida
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Marcar todas como lidas
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .is('read_at', null);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Deletar notificação
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate
  };
}
```

---

## ✅ Passo 3: Criar NotificationCenter Component

**Arquivo**: `src/components/notifications/NotificationCenter.tsx`

```typescript
import { Bell, Check, Trash2 } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    isLoading
  } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notificações</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
            >
              <Check className="h-4 w-4 mr-2" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Carregando...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Nenhuma notificação
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
```

---

## ✅ Passo 4: Criar NotificationItem Component

**Arquivo**: `src/components/notifications/NotificationItem.tsx`

```typescript
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Notification } from '@/hooks/useNotifications';

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const { markAsRead, deleteNotification } = useNotifications();
  
  const link = getNotificationLink(notification.type, notification.metadata);
  const Icon = getNotificationIcon(notification.type);
  const isUnread = !notification.read_at;

  const handleClick = () => {
    if (isUnread) {
      markAsRead(notification.id);
    }
  };

  return (
    <div
      className={cn(
        "relative p-4 hover:bg-accent transition-colors",
        isUnread && "bg-accent/50"
      )}
    >
      <Link
        to={link}
        onClick={handleClick}
        className="flex gap-3"
      >
        <div className="flex-shrink-0 mt-1">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{notification.title}</p>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(notification.created_at), {
              addSuffix: true,
              locale: ptBR
            })}
          </p>
        </div>

        {isUnread && (
          <div className="flex-shrink-0">
            <div className="h-2 w-2 rounded-full bg-primary" />
          </div>
        )}
      </Link>

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6 opacity-0 hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.preventDefault();
          deleteNotification(notification.id);
        }}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}

function getNotificationIcon(type: string) {
  // Importar ícones necessários
  const {
    Calendar,
    BookOpen,
    Wrench,
    MessageSquare,
    Heart,
    Trophy,
    CheckCircle,
    Bell
  } = require('lucide-react');

  if (type.startsWith('event_')) return Calendar;
  if (type.startsWith('learning_')) return BookOpen;
  if (type.startsWith('tool_')) return Wrench;
  if (type.includes('mention')) return MessageSquare;
  if (type.includes('liked')) return Heart;
  if (type.includes('achievement')) return Trophy;
  if (type.includes('solved') || type.includes('solution')) return CheckCircle;
  return Bell;
}

function getNotificationLink(type: string, metadata: any): string {
  // Eventos
  if (type.startsWith('event_')) {
    return `/eventos/${metadata.event_id}`;
  }
  
  // Learning
  if (type.includes('course') && !type.includes('lesson')) {
    return `/formacao/curso/${metadata.course_id}`;
  }
  if (type.includes('lesson')) {
    return `/formacao/aula/${metadata.lesson_id}`;
  }
  
  // Ferramentas
  if (type.startsWith('tool_')) {
    return `/ferramentas/${metadata.tool_id}`;
  }
  
  // Comunidade
  if (type.startsWith('community_')) {
    if (metadata.post_id) {
      return `/comunidade/topico/${metadata.topic_id}#post-${metadata.post_id}`;
    }
    return `/comunidade/topico/${metadata.topic_id}`;
  }
  
  // Default
  return '/notificacoes';
}
```

---

## ✅ Passo 5: Adicionar ao Layout

**Arquivo**: `src/App.tsx` ou `src/components/layout/Header.tsx`

```typescript
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

export function Header() {
  return (
    <header>
      {/* ... outros elementos ... */}
      <NotificationCenter />
    </header>
  );
}
```

---

## ✅ Passo 6: (Opcional) Adicionar Realtime

**Arquivo**: `src/hooks/useNotifications.ts` (adicionar ao hook)

```typescript
import { useEffect } from 'react';
import { toast } from 'sonner';

// Adicionar dentro do hook useNotifications
useEffect(() => {
  const channel = supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user?.id}`
      },
      (payload) => {
        // Invalidar query para recarregar
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        
        // Mostrar toast
        toast.info(payload.new.title, {
          description: payload.new.message,
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [user?.id, queryClient]);
```

---

## ✅ Passo 7: (Opcional) Página de Notificações

**Arquivo**: `src/pages/Notifications.tsx`

```typescript
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { Button } from '@/components/ui/button';

export function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    isLoading
  } = useNotifications();

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Notificações</h1>
          {unreadCount > 0 && (
            <p className="text-muted-foreground">
              {unreadCount} não {unreadCount === 1 ? 'lida' : 'lidas'}
            </p>
          )}
        </div>
        
        {unreadCount > 0 && (
          <Button onClick={() => markAllAsRead()}>
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12">Carregando...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Nenhuma notificação
        </div>
      ) : (
        <div className="divide-y border rounded-lg">
          {notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## ✅ Passo 8: Adicionar Rota

**Arquivo**: `src/routes.tsx` ou equivalente

```typescript
{
  path: '/notificacoes',
  element: <NotificationsPage />
}
```

---

## 🎉 Pronto!

Sistema de notificações implementado! Agora você tem:

- ✅ Badge com contagem de não lidas
- ✅ Popover com lista de notificações
- ✅ Página dedicada de notificações
- ✅ Notificações em tempo real (opcional)
- ✅ 34 tipos de notificação funcionando

---

## 🔍 Testando

### Testar Notificações Manualmente

```sql
-- Criar notificação de teste
INSERT INTO notifications (user_id, type, title, message, metadata)
VALUES (
  '<seu-user-id>',
  'event_reminder_1h',
  'Evento em 1 hora!',
  'O evento "Teste" começa em 1 hora.',
  '{"event_id": "uuid-aqui", "event_title": "Teste"}'::jsonb
);
```

### Testar Edge Functions

```bash
# Eventos
curl -X POST https://<project>.supabase.co/functions/v1/process-event-reminders

# Learning
curl -X POST https://<project>.supabase.co/functions/v1/process-course-reminders

# Ferramentas
curl -X POST https://<project>.supabase.co/functions/v1/process-tool-recommendations

# Comunidade
curl -X POST https://<project>.supabase.co/functions/v1/process-community-digest
```

---

## 📚 Próximos Passos

1. **Customizar UI** - Ajustar cores, espaçamentos, ícones
2. **Adicionar Preferências** - Página de configuração
3. **Implementar Filtros** - Por tipo, data, lido/não lido
4. **Push Notifications** - Web Push API
5. **Email Digest** - Resumo por email

---

## 🆘 Problemas?

Consulte `docs/notifications-system-overview.md` seção **Troubleshooting**.

---

**Tempo estimado**: 1-2 horas  
**Dificuldade**: Médio  
**Status**: ✅ Pronto para implementação
