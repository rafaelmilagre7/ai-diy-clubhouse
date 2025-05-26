
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquareMore } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getInitials } from '@/utils/user';

interface MessageNotification {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  message: string;
  read: boolean;
  created_at: string;
}

// Dados mockados para demonstração
const mockMessages: MessageNotification[] = [
  {
    id: '1',
    sender: {
      id: '1',
      name: 'Ana Costa',
      avatar_url: undefined
    },
    message: 'Olá! Vi sua resposta sobre IA no e-commerce e gostaria de trocar uma ideia...',
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  },
  {
    id: '2',
    sender: {
      id: '2',
      name: 'Pedro Silva',
      avatar_url: undefined
    },
    message: 'Obrigado pela ajuda com a automação! Funcionou perfeitamente.',
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  }
];

export const MessageNotificationsDropdown = () => {
  const [messages, setMessages] = useState<MessageNotification[]>(mockMessages);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = messages.filter(m => !m.read).length;

  const markAsRead = (id: string) => {
    setMessages(prev => 
      prev.map(m => m.id === id ? { ...m, read: true } : m)
    );
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

  const truncateMessage = (message: string, maxLength: number = 50) => {
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <MessageSquareMore className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Mensagens</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="max-h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Nenhuma mensagem
            </div>
          ) : (
            messages.map((message) => (
              <DropdownMenuItem 
                key={message.id}
                className={`p-3 cursor-pointer ${!message.read ? 'bg-blue-50' : ''}`}
                onClick={() => {
                  markAsRead(message.id);
                  window.location.href = '/comunidade/mensagens';
                }}
              >
                <div className="flex gap-3 w-full">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={message.sender.avatar_url || ''} />
                    <AvatarFallback className="text-xs">
                      {getInitials(message.sender.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm truncate">
                          {message.sender.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {truncateMessage(message.message)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                      {!message.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="p-3 text-center text-sm font-medium cursor-pointer"
          onClick={() => window.location.href = '/comunidade/mensagens'}
        >
          Ver todas as mensagens
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
