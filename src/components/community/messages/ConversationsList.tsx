
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, MessageSquare } from 'lucide-react';
import { useDirectMessages, Conversation } from '@/hooks/community/useDirectMessages.tsx';
import { getInitials } from '@/utils/user';
import { useAuth } from '@/contexts/auth';
import { cn } from '@/lib/utils';

interface ConversationsListProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: string;
}

export const ConversationsList: React.FC<ConversationsListProps> = ({
  onSelectConversation,
  selectedConversationId
}) => {
  const { user } = useAuth();
  const { conversations, conversationsLoading } = useDirectMessages();
  const [searchTerm, setSearchTerm] = useState('');

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participant_1_id === user?.id 
      ? conversation.participant_2 
      : conversation.participant_1;
  };

  const filteredConversations = conversations.filter(conversation => {
    if (!searchTerm) return true;
    const otherParticipant = getOtherParticipant(conversation);
    return otherParticipant?.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInDays === 1) {
      return 'Ontem';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString('pt-BR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short'
      });
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Conversas</CardTitle>
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
        {conversationsLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="h-10 w-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-8 px-4">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
            </p>
            {!searchTerm && (
              <p className="text-sm text-muted-foreground mt-2">
                Inicie uma nova conversa clicando em "Nova Conversa"
              </p>
            )}
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {filteredConversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation);
              const isSelected = conversation.id === selectedConversationId;
              
              return (
                <div
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={cn(
                    "flex items-center space-x-3 p-4 hover:bg-muted/50 cursor-pointer border-b transition-colors",
                    isSelected && "bg-muted"
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={otherParticipant?.avatar_url || undefined} />
                      <AvatarFallback>
                        {getInitials(otherParticipant?.name)}
                      </AvatarFallback>
                    </Avatar>
                    {/* Status online indicator */}
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">
                        {otherParticipant?.name || 'Usuário'}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(conversation.last_message_at)}
                        </span>
                        {conversation.unread_count && conversation.unread_count > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {conversation.last_message && (
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {conversation.last_message.content}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
