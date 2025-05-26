
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Users } from 'lucide-react';
import { useDirectMessages } from '@/hooks/community/useDirectMessages';
import { useMessageNotifications } from '@/hooks/community/useMessageNotifications';
import { getInitials } from '@/utils/user';
import { useAuth } from '@/contexts/auth';
import { Link } from 'react-router-dom';

export const MessageNotificationsDropdown = () => {
  const { user } = useAuth();
  const { conversations, conversationsLoading } = useDirectMessages();
  const { unreadCount } = useMessageNotifications();

  const conversationsWithUnread = conversations.filter(conv => 
    conv.unread_count && conv.unread_count > 0
  ).slice(0, 5);

  const getOtherParticipant = (conversation: any) => {
    return conversation.participant_1_id === user?.id 
      ? conversation.participant_2 
      : conversation.participant_1;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <MessageSquare className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          Mensagens
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} não lidas</Badge>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {conversationsLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="h-8 w-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : conversationsWithUnread.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2" />
            Nenhuma mensagem não lida
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {conversationsWithUnread.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation);
              
              return (
                <DropdownMenuItem
                  key={conversation.id}
                  className="p-3 cursor-pointer"
                  asChild
                >
                  <Link to="/comunidade/mensagens" className="block">
                    <div className="flex items-center space-x-3 w-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={otherParticipant?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(otherParticipant?.name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">
                            {otherParticipant?.name || 'Usuário'}
                          </p>
                          {conversation.unread_count && conversation.unread_count > 0 && (
                            <Badge variant="destructive" className="ml-2 text-xs">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                        
                        {conversation.last_message && (
                          <p className="text-xs text-muted-foreground truncate">
                            {conversation.last_message.content}
                          </p>
                        )}
                        
                        <p className="text-xs text-muted-foreground">
                          {new Date(conversation.last_message_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </Link>
                </DropdownMenuItem>
              );
            })}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/comunidade/mensagens" className="text-center w-full">
                Ver todas as mensagens
              </Link>
            </DropdownMenuItem>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
