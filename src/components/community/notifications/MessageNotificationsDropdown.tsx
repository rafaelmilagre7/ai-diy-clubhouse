
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
import { useMessageNotifications } from '@/hooks/community/useMessageNotifications';

export const MessageNotificationsDropdown = () => {
  const { unreadCount } = useMessageNotifications();
  const [isOpen, setIsOpen] = useState(false);

  // Por enquanto, lista vazia até conectar com dados reais
  const messages: any[] = [];

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
        <Button variant="ghost" size="sm" className="relative text-white hover:bg-white/10">
          <MessageSquareMore className="h-4 w-4" />
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
        <DropdownMenuLabel className="text-white">Mensagens</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        
        <div className="max-h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              Nenhuma mensagem
            </div>
          ) : (
            messages.map((message) => (
              <DropdownMenuItem 
                key={message.id}
                className={`p-3 cursor-pointer hover:bg-white/5 focus:bg-white/5 ${!message.read ? 'bg-blue-500/10' : ''}`}
                onClick={() => {
                  window.location.href = '/comunidade/mensagens';
                }}
              >
                <div className="flex gap-3 w-full">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={message.sender.avatar_url || ''} />
                    <AvatarFallback className="text-xs bg-gray-600 text-white">
                      {getInitials(message.sender.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm truncate text-white">
                          {message.sender.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {truncateMessage(message.message)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                      {!message.read && (
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
          onClick={() => window.location.href = '/comunidade/mensagens'}
        >
          Ver todas as mensagens
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
