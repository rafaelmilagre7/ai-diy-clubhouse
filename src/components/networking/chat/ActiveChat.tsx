import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, MessageCircle } from 'lucide-react';
import { useMessages, useSendMessage, useMarkAsRead } from '@/hooks/networking/useMessages';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth';

interface ActiveChatProps {
  conversationId?: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  otherUserCompany?: string;
}

export const ActiveChat = ({
  conversationId,
  otherUserId,
  otherUserName,
  otherUserAvatar,
  otherUserCompany,
}: ActiveChatProps) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { data: messages = [], isLoading } = useMessages(conversationId, otherUserId);
  const sendMutation = useSendMessage();
  const markAsReadMutation = useMarkAsRead();

  // Auto-scroll ao receber novas mensagens
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Marcar como lidas ao abrir conversa
  useEffect(() => {
    if (otherUserId && messages.length > 0) {
      markAsReadMutation.mutate(otherUserId);
    }
  }, [otherUserId, messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendMutation.isPending) return;

    await sendMutation.mutateAsync({
      recipientId: otherUserId,
      content: message.trim(),
    });

    setMessage('');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-2/3" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <Avatar className="w-10 h-10">
          <AvatarImage src={otherUserAvatar || ''} alt={otherUserName} />
          <AvatarFallback>
            {otherUserName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{otherUserName}</h3>
          {otherUserCompany && (
            <p className="text-sm text-muted-foreground truncate">
              {otherUserCompany}
            </p>
          )}
        </div>
      </div>

      {/* Mensagens */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">Inicie a conversa</h3>
            <p className="text-sm text-muted-foreground">
              Envie sua primeira mensagem para {otherUserName}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isMine = msg.sender_id === user?.id;
              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-2',
                    isMine ? 'justify-end' : 'justify-start'
                  )}
                >
                  {!isMine && (
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarImage src={otherUserAvatar || ''} alt={otherUserName} />
                      <AvatarFallback className="text-xs">
                        {otherUserName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-[70%] rounded-lg px-4 py-2',
                      isMine
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                    <span
                      className={cn(
                        'text-xs mt-1 block',
                        isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      )}
                    >
                      {formatDistanceToNow(new Date(msg.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={sendMutation.isPending}
            maxLength={1000}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!message.trim() || sendMutation.isPending}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};
