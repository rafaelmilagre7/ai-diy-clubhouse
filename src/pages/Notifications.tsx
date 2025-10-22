import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Check, Settings, Trash2 } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import { EmptyNotifications } from '@/components/notifications/EmptyNotifications';
import { NotificationsSkeleton } from '@/components/notifications/NotificationsSkeleton';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function Notifications() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'mentions'>('all');
  const [search, setSearch] = useState('');
  
  const { 
    notifications, 
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();
  
  // Filtrar notificações
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread' && n.is_read) return false;
    if (filter === 'mentions' && !n.type.includes('mention')) return false;
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && 
        !n.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const mentionsCount = notifications.filter(n => n.type.includes('mention')).length;
  
  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteNotification(id);
      toast.success('Notificação removida');
    } catch (error) {
      toast.error('Erro ao remover notificação');
    }
  };
  
  const handleMarkAsRead = async (ids: string[]) => {
    try {
      await markAsRead(ids);
    } catch (error) {
      toast.error('Erro ao marcar como lida');
    }
  };
  
  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-textPrimary to-textSecondary bg-clip-text text-transparent mb-1">
            Notificações
          </h1>
          <p className="text-sm text-textSecondary">
            Acompanhe todas as atualizações e interações
          </p>
        </div>
        
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => markAllAsRead()}
              className="hover:bg-aurora-primary/10 hover:text-aurora-primary hover:border-aurora-primary/30"
            >
              <Check className="h-4 w-4 mr-2" />
              Marcar todas como lidas
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon"
            className="hover:bg-surface-elevated"
            title="Configurações de notificações"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSecondary" />
        <Input
          placeholder="Buscar notificações..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {/* Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="all" className="data-[state=active]:bg-aurora-primary data-[state=active]:text-white">
            Todas {notifications.length > 0 && `(${notifications.length})`}
          </TabsTrigger>
          <TabsTrigger value="unread" className="data-[state=active]:bg-aurora-primary data-[state=active]:text-white">
            Não lidas {unreadCount > 0 && `(${unreadCount})`}
          </TabsTrigger>
          <TabsTrigger value="mentions" className="data-[state=active]:bg-aurora-primary data-[state=active]:text-white">
            Menções {mentionsCount > 0 && `(${mentionsCount})`}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={filter} className="space-y-2">
          {isLoading ? (
            <NotificationsSkeleton />
          ) : filteredNotifications.length === 0 ? (
            <EmptyNotifications filter={filter} />
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((notification, index) => (
                <NotificationCard 
                  key={notification.id} 
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDeleteNotification}
                  index={index}
                />
              ))}
            </AnimatePresence>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Footer info */}
      {filteredNotifications.length > 0 && (
        <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border/50 text-center">
          <p className="text-xs text-textSecondary">
            💡 <strong>Dica:</strong> Passe o mouse sobre uma notificação para ver as opções de marcar como lida ou deletar
          </p>
        </div>
      )}
    </div>
  );
}
