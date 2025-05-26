
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, MessageSquare } from 'lucide-react';
import { useDirectMessages, Conversation } from '@/hooks/community/useDirectMessages';
import { getInitials } from '@/utils/user';
import { useAuth } from '@/contexts/auth';

interface ChatWindowProps {
  conversation: Conversation;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversation }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const otherParticipant = conversation.participant_1_id === user?.id 
    ? conversation.participant_2 
    : conversation.participant_1;
  
  const { getConversationMessages, sendMessage, markAsRead, isSending } = useDirectMessages();
  const { data: messages = [], isLoading } = getConversationMessages(otherParticipant?.id || '');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Marcar mensagens como lidas quando abrir a conversa
    if (otherParticipant?.id) {
      markAsRead(otherParticipant.id);
    }
  }, [otherParticipant?.id, markAsRead]);

  const handleSendMessage = () => {
    if (!message.trim() || !otherParticipant?.id) return;
    
    sendMessage(
      { recipientId: otherParticipant.id, content: message.trim() },
      {
        onSuccess: () => {
          setMessage('');
        }
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={otherParticipant?.avatar_url || undefined} />
            <AvatarFallback>{getInitials(otherParticipant?.name)}</AvatarFallback>
          </Avatar>
          <span>{otherParticipant?.name || 'Usuário'}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start space-x-2 animate-pulse">
                  <div className="h-8 w-8 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma mensagem ainda</p>
              <p className="text-sm text-muted-foreground">
                Comece uma conversa!
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.sender_id === user?.id;
              
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex space-x-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={
                        isOwn 
                          ? user?.user_metadata?.avatar_url 
                          : otherParticipant?.avatar_url || undefined
                      } />
                      <AvatarFallback>
                        {getInitials(isOwn ? user?.user_metadata?.name : otherParticipant?.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`px-3 py-2 rounded-lg ${
                      isOwn 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-xs mt-1 ${
                        isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Message input */}
        <div className="border-t p-4">
          <div className="flex space-x-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="flex-1 min-h-0 resize-none"
              rows={2}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!message.trim() || isSending}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
