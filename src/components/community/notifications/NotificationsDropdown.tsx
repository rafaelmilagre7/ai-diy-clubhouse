
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Bell, MessageSquare, CheckCircle, User, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'reply':
      return <MessageSquare className="h-4 w-4 text-blue-400" />;
    case 'solution':
      return <CheckCircle className="h-4 w-4 text-green-400" />;
    case 'mention':
      return <User className="h-4 w-4 text-purple-400" />;
    case 'event':
      return <Calendar className="h-4 w-4 text-orange-400" />;
    default:
      return <Bell className="h-4 w-4 text-gray-400" />;
  }
};

export const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Por enquanto, lista vazia até conectar com dados reais
  const notifications: any[] = [];
  const unreadCount = 0;

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

  const markAllAsRead = () => {
    // TODO: Implementar quando conectar com dados reais
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative text-white hover:bg-white/10">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-600"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 bg-[#151823] border-white/10 text-white">
        <div className="flex items-center justify-between p-2">
          <DropdownMenuLabel className="p-0 text-white">Notificações</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-xs h-auto p-1 text-blue-400 hover:bg-white/5"
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>
        
        <DropdownMenuSeparator className="bg-white/10" />
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              Nenhuma notificação
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id}
                className={`p-3 cursor-pointer hover:bg-white/5 focus:bg-white/5 ${!notification.read ? 'bg-blue-500/10' : ''}`}
                onClick={() => {
                  if (notification.link) {
                    window.location.href = notification.link;
                  }
                }}
              >
                <div className="flex gap-3 w-full">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm truncate text-white">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTime(notification.created_at)}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
        
        <DropdownMenuSeparator className="bg-white/10" />
        
        <DropdownMenuItem 
          className="p-3 text-center text-sm font-medium cursor-pointer hover:bg-white/5 focus:bg-white/5 text-blue-400"
          onClick={() => window.location.href = '/comunidade/notificacoes'}
        >
          Ver todas as notificações
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
