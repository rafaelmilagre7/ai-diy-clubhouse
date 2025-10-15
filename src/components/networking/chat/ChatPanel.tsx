import React, { useEffect, useRef } from 'react';
import { X, Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { MessageBubble } from './MessageBubble';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface ChatPanelProps {
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  onClose: () => void;
  onBack?: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  recipientId,
  recipientName,
  recipientAvatar,
  onClose,
  onBack
}) => {
  const [newMessage, setNewMessage] = React.useState('');
  const [currentUserId, setCurrentUserId] = React.useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { messages, isLoading, sendMessage, markAsRead } = useDirectMessages(recipientId);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id);
    });
  }, []);

  useEffect(() => {
    if (recipientId && currentUserId) {
      markAsRead.mutate(recipientId);
    }
  }, [recipientId, currentUserId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await sendMessage.mutateAsync({
      recipientId,
      content: newMessage.trim()
    });

    setNewMessage('');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col h-full bg-background/95 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border/50 bg-card/50">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        
        <Avatar className="h-10 w-10 ring-2 ring-primary/20">
          <AvatarImage src={recipientAvatar} alt={recipientName} />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
            {getInitials(recipientName)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{recipientName}</h3>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Mensagens */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Ainda não há mensagens
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Envie a primeira mensagem!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwnMessage={message.sender_id === currentUserId}
                senderName={message.sender?.name}
                senderAvatar={message.sender?.avatar_url}
              />
            ))}
            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input de mensagem */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-border/50 bg-card/50">
        <div className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-muted/50 border-border/50"
            disabled={sendMessage.isPending}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!newMessage.trim() || sendMessage.isPending}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};
