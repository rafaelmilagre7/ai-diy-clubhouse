
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Send } from 'lucide-react';
import { useDirectMessages } from '@/hooks/community/useDirectMessages';
import { useAuth } from '@/contexts/auth';
import { getInitials, formatUserName } from '@/utils/user';
import { cn } from '@/lib/utils';

interface MessageConversationProps {
  conversationId: string;
  onBack?: () => void;
}

export const MessageConversation: React.FC<MessageConversationProps> = ({
  conversationId,
  onBack
}) => {
  const { user } = useAuth();
  const { sendMessage, isSending, markAsRead } = useDirectMessages();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Para conversas novas (formato: new-{userId})
  const isNewConversation = conversationId.startsWith('new-');
  const otherUserId = isNewConversation ? conversationId.replace('new-', '') : null;

  const { data: messages = [], isLoading } = useDirectMessages().getConversationMessages(
    isNewConversation ? otherUserId! : conversationId
  );

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Marcar mensagens como lidas
  useEffect(() => {
    if (!isNewConversation && messages.length > 0 && otherUserId) {
      const unreadMessages = messages.filter(msg => 
        msg.sender_id !== user?.id && !msg.is_read
      );
      
      if (unreadMessages.length > 0) {
        markAsRead(otherUserId);
      }
    }
  }, [messages, otherUserId, user?.id, markAsRead, isNewConversation]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;
    
    const recipientId = isNewConversation ? otherUserId! : 
      messages[0]?.sender_id === user?.id ? messages[0]?.recipient_id : messages[0]?.sender_id;
    
    if (!recipientId) return;

    sendMessage({ recipientId, content: newMessage.trim() });
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Obter informações do outro participante
  const otherParticipant = messages.length > 0 
    ? (messages[0].sender_id === user?.id ? messages[0].recipient : messages[0].sender)
    : null;

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando conversa...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 border-b">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          
          {otherParticipant && (
            <>
              <Avatar className="h-8 w-8">
                <AvatarImage src={otherParticipant.avatar_url || undefined} />
                <AvatarFallback className="text-sm">
                  {getInitials(otherParticipant.name)}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-lg">
                {formatUserName(otherParticipant.name)}
              </CardTitle>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Área de mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length > 0 ? (
            messages.map((message) => {
              const isOwn = message.sender_id === user?.id;
              
              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    isOwn ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[70%] rounded-lg px-4 py-2",
                      isOwn 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted"
                    )}
                  >
                    <p className="text-sm">{message.content}</p>
                    <span className={cn(
                      "text-xs opacity-75 mt-1 block",
                      isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      {formatMessageTime(message.created_at)}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <div className="text-4xl mb-4">👋</div>
                <h3 className="font-semibold mb-2">Início da conversa</h3>
                <p className="text-muted-foreground text-sm">
                  {isNewConversation 
                    ? 'Envie sua primeira mensagem para iniciar a conversa'
                    : 'Esta é uma nova conversa'
                  }
                </p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Área de envio */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Digite sua mensagem..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="resize-none"
              rows={2}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isSending}
              size="icon"
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
