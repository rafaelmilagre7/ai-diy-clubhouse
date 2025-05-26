
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, MessageSquare } from 'lucide-react';
import { useDirectMessages } from '@/hooks/community/useDirectMessages';
import { useAuth } from '@/contexts/auth';
import { getInitials, formatUserName } from '@/utils/user';
import { cn } from '@/lib/utils';

interface MessagesInboxProps {
  selectedConversationId: string | null;
  onConversationSelect: (conversationId: string) => void;
}

export const MessagesInbox: React.FC<MessagesInboxProps> = ({
  selectedConversationId,
  onConversationSelect
}) => {
  const { user } = useAuth();
  const { conversations, conversationsLoading } = useDirectMessages();
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredConversations = conversations.filter(conversation => {
    if (!searchTerm) return true;
    
    const otherParticipant = conversation.participant_1?.id === user?.id 
      ? conversation.participant_2 
      : conversation.participant_1;
    
    return otherParticipant?.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 168) { // 7 dias
      return date.toLocaleDateString('pt-BR', { 
        weekday: 'short' 
      });
    } else {
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  if (conversationsLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 rounded-lg animate-pulse">
              <div className="h-10 w-10 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Conversas ({conversations.length})
        </CardTitle>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => {
              const otherParticipant = conversation.participant_1?.id === user?.id 
                ? conversation.participant_2 
                : conversation.participant_1;
              
              const isSelected = selectedConversationId === conversation.id;
              
              return (
                <div
                  key={conversation.id}
                  onClick={() => onConversationSelect(conversation.id)}
                  className={cn(
                    "flex items-center space-x-3 p-4 border-b hover:bg-accent cursor-pointer transition-colors",
                    isSelected && "bg-accent"
                  )}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={otherParticipant?.avatar_url || undefined} />
                    <AvatarFallback>
                      {getInitials(otherParticipant?.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">
                        {formatUserName(otherParticipant?.name)}
                      </p>
                      {conversation.last_message_at && (
                        <span className="text-xs text-muted-foreground">
                          {formatLastMessageTime(conversation.last_message_at)}
                        </span>
                      )}
                    </div>
                    
                    {conversation.last_message && (
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.last_message.content}
                      </p>
                    )}
                  </div>
                  
                  {conversation.unread_count && conversation.unread_count > 0 && (
                    <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                    </Badge>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium mb-1">
                {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
              </p>
              <p className="text-sm opacity-75">
                {searchTerm 
                  ? 'Tente ajustar sua busca'
                  : 'Suas conversas aparecerão aqui'
                }
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
