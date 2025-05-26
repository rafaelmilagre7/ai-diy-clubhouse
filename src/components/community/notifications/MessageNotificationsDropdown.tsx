
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
import { MessageSquareMore } from 'lucide-react';
import { useMessageNotifications } from '@/hooks/community/useMessageNotifications';

export const MessageNotificationsDropdown = () => {
  const { unreadCount } = useMessageNotifications();
  const [isOpen, setIsOpen] = useState(false);

  // Lista vazia até conectar com dados reais do Supabase
  const messages: any[] = [];

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
          <div className="p-8 text-center text-gray-400">
            <MessageSquareMore className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium mb-1">Nenhuma mensagem</p>
            <p className="text-sm opacity-75">Suas conversas aparecerão aqui</p>
          </div>
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
