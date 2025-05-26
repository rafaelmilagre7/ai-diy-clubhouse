
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  MessageSquare, 
  CheckCircle, 
  User, 
  Calendar,
  Check,
  Trash2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ForumBreadcrumbs } from '@/components/community/ForumBreadcrumbs';
import { CommunityNavigation } from '@/components/community/CommunityNavigation';

interface Notification {
  id: string;
  type: 'reply' | 'solution' | 'mention' | 'event';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  link?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'reply',
    title: 'Nova resposta no seu tópico',
    message: 'João Silva respondeu ao tópico "Como implementar IA no e-commerce"',
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    link: '/comunidade/topico/123'
  },
  {
    id: '2',
    type: 'solution',
    title: 'Solução aceita',
    message: 'Sua resposta foi marcada como solução por Maria Santos',
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    link: '/comunidade/topico/456'
  },
  {
    id: '3',
    type: 'mention',
    title: 'Você foi mencionado',
    message: 'Carlos mencionou você em "Dúvidas sobre automação"',
    read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    link: '/comunidade/topico/789'
  },
  {
    id: '4',
    type: 'event',
    title: 'Novo evento da comunidade',
    message: 'Workshop "IA Avançada" foi agendado para próxima semana',
    read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    link: '/events/123'
  }
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'reply':
      return <MessageSquare className="h-5 w-5 text-blue-500" />;
    case 'solution':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'mention':
      return <User className="h-5 w-5 text-purple-500" />;
    case 'event':
      return <Calendar className="h-5 w-5 text-orange-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState('all');

  const unreadCount = notifications.filter(n => !n.read).length;
  const todayCount = notifications.filter(n => {
    const notificationDate = new Date(n.created_at);
    const today = new Date();
    return notificationDate.toDateString() === today.toDateString();
  }).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const formatTime = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch {
      return 'Data inválida';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (activeTab) {
      case 'unread':
        return !notification.read;
      case 'today':
        const notificationDate = new Date(notification.created_at);
        const today = new Date();
        return notificationDate.toDateString() === today.toDateString();
      default:
        return true;
    }
  });

  return (
    <div className="container max-w-7xl mx-auto py-6">
      <ForumBreadcrumbs />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Notificações</h1>
        <p className="text-muted-foreground">
          Acompanhe todas as atividades da comunidade
        </p>
      </div>
      
      <CommunityNavigation />
      
      <div className="mt-6 space-y-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Bell className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{notifications.length}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
                <div>
                  <p className="text-2xl font-bold">{unreadCount}</p>
                  <p className="text-sm text-muted-foreground">Não lidas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{todayCount}</p>
                  <p className="text-sm text-muted-foreground">Hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações rápidas */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <Check className="h-4 w-4 mr-2" />
            Marcar todas como lidas
          </Button>
        </div>

        {/* Lista de notificações */}
        <Card>
          <CardHeader>
            <CardTitle>Suas Notificações</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="px-6 pt-2">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">
                    Todas ({notifications.length})
                  </TabsTrigger>
                  <TabsTrigger value="unread">
                    Não lidas ({unreadCount})
                  </TabsTrigger>
                  <TabsTrigger value="today">
                    Hoje ({todayCount})
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value={activeTab} className="m-0">
                <div className="divide-y">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>Nenhuma notificação encontrada</p>
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`p-6 hover:bg-muted/50 transition-colors ${
                          !notification.read ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium text-sm">
                                    {notification.title}
                                  </h3>
                                  {!notification.read && (
                                    <Badge variant="secondary" className="text-xs">
                                      Nova
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatTime(notification.created_at)}
                                </p>
                              </div>
                              
                              <div className="flex gap-1">
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markAsRead(notification.id)}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteNotification(notification.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationsPage;
