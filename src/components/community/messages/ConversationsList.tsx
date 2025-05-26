
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users } from 'lucide-react';
import { useDirectMessages, Conversation } from '@/hooks/community/useDirectMessages';
import { getInitials } from '@/utils/user';
import { useAuth } from '@/contexts/auth';

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

  if (conversationsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Conversas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 animate-pulse">
                <div className="h-10 w-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (conversations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Conversas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma conversa ainda</p>
            <p className="text-sm text-muted-foreground">
              Suas conversas com outros membros aparecerão aqui
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participant_1_id === user?.id 
      ? conversation.participant_2 
      : conversation.participant_1;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>Conversas</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {conversations.map((conversation) => {
            const otherParticipant = getOtherParticipant(conversation);
            const isSelected = selectedConversationId === conversation.id;
            
            return (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  isSelected 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'hover:bg-muted/50'
                }`}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={otherParticipant?.avatar_url || undefined} />
                  <AvatarFallback>{getInitials(otherParticipant?.name)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium truncate">
                      {otherParticipant?.name || 'Usuário'}
                    </h4>
                    {conversation.unread_count && conversation.unread_count > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </div>
                  
                  {conversation.last_message && (
                    <p className="text-sm text-muted-foreground truncate">
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
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
