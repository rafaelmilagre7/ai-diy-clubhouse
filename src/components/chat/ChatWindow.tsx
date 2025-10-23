import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth';
import { useRealtimeChat } from '@/hooks/realtime/useRealtimeChat';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Send, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  conversationId: string;
  className?: string;
}

export function ChatWindow({ conversationId, className }: ChatWindowProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Hook de chat em tempo real
  const { isConnected, typingUsers, sendMessage, startTyping, stopTyping, markAsRead } =
    useRealtimeChat({
      conversationId,
      enableSound: true,
    });

  // Buscar mensagens
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(
          `
          *,
          sender:sender_id (
            id,
            user_metadata
          )
        `
        )
        .eq('conversation_id', conversationId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Auto-scroll ao receber novas mensagens
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Marcar como lido ao visualizar
  useEffect(() => {
    if (messages.length > 0) {
      markAsRead();
    }
  }, [messages, markAsRead]);

  // Handler de input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (e.target.value.length > 0) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  // Handler de envio
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || isSending) return;

    setIsSending(true);
    stopTyping();

    try {
      await sendMessage(message);
      setMessage('');
      inputRef.current?.focus();
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className={cn('flex flex-col h-[600px]', className)}>
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-2 h-2 rounded-full',
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            )}
          />
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Conectado' : 'Conectando...'}
          </span>
        </div>

        {/* Indicador de digitando */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
            <span>Digitando...</span>
          </div>
        )}
      </div>

      {/* Mensagens */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Nenhuma mensagem ainda. Seja o primeiro!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg: any) => {
              const isOwn = msg.sender_id === user?.id;
              const senderName = msg.sender?.user_metadata?.full_name || 'Usuário';
              const senderAvatar = msg.sender?.user_metadata?.avatar_url;

              return (
                <div
                  key={msg.id}
                  className={cn('flex gap-3', isOwn && 'flex-row-reverse')}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={senderAvatar} />
                    <AvatarFallback>{senderName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>

                  <div className={cn('flex flex-col gap-1 max-w-[70%]', isOwn && 'items-end')}>
                    {!isOwn && (
                      <span className="text-xs font-medium text-muted-foreground">
                        {senderName}
                      </span>
                    )}

                    <div
                      className={cn(
                        'rounded-lg px-4 py-2',
                        isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {formatDistanceToNow(new Date(msg.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>

                      {/* Checkmarks de leitura */}
                      {isOwn && (
                        <span>
                          {msg.read_by.length > 1 ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
        <Input
          ref={inputRef}
          value={message}
          onChange={handleInputChange}
          placeholder="Digite sua mensagem..."
          disabled={isSending || !isConnected}
          className="flex-1"
        />
        <Button type="submit" disabled={!message.trim() || isSending || !isConnected}>
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>
    </Card>
  );
}
