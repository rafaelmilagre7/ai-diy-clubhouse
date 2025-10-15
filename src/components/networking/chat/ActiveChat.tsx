import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, MessageCircle } from 'lucide-react';
import { useMessages, useSendMessage, useMarkAsRead } from '@/hooks/networking/useMessages';
import { useTypingIndicator } from '@/hooks/networking/useTypingIndicator';
import { useBroadcastPresence } from '@/hooks/networking/useUserPresence';
import { OnlineIndicator } from './OnlineIndicator';
import { FileUploadButton } from './FileUploadButton';
import { EmojiPickerComponent } from './EmojiPickerComponent';
import { ReplyPreview } from './ReplyPreview';
import { MessageBubble } from './MessageBubble';
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
  const [replyTo, setReplyTo] = useState<any>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { data: messages = [], isLoading } = useMessages(conversationId, otherUserId);
  const sendMutation = useSendMessage();
  const markAsReadMutation = useMarkAsRead();
  const { isTyping, sendTypingSignal } = useTypingIndicator(otherUserId);

  // Broadcast presence
  useBroadcastPresence();

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
    if ((!message.trim() && attachments.length === 0) || sendMutation.isPending) return;

    await sendMutation.mutateAsync({
      recipientId: otherUserId,
      content: message.trim() || '[Anexo]',
      attachments,
      replyToId: replyTo?.id,
    });

    setMessage('');
    setReplyTo(null);
    setAttachments([]);
  };

  const handleFileUploaded = (fileUrl: string, fileName: string, fileType: string) => {
    setAttachments([...attachments, { url: fileUrl, name: fileName, type: fileType }]);
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(message + emoji);
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
        <div className="relative">
          <Avatar className="w-10 h-10">
            <AvatarImage src={otherUserAvatar || ''} alt={otherUserName} />
            <AvatarFallback>
              {otherUserName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <OnlineIndicator userId={otherUserId} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{otherUserName}</h3>
          {isTyping ? (
            <p className="text-sm text-primary animate-pulse">Digitando...</p>
          ) : otherUserCompany ? (
            <p className="text-sm text-muted-foreground truncate">
              {otherUserCompany}
            </p>
          ) : null}
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
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwnMessage={msg.sender_id === user?.id}
                senderName={msg.sender_id === user?.id ? 'Você' : otherUserName}
                senderAvatar={msg.sender_id === user?.id ? user?.user_metadata?.avatar_url : otherUserAvatar}
                onReply={() => setReplyTo(msg)}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-border">
        {replyTo && (
          <ReplyPreview
            repliedMessage={{
              id: replyTo.id,
              content: replyTo.content,
              senderName: replyTo.sender_id === user?.id ? 'Você' : otherUserName,
            }}
            onCancel={() => setReplyTo(null)}
          />
        )}
        
        {attachments.length > 0 && (
          <div className="px-4 py-2 flex gap-2 flex-wrap">
            {attachments.map((att, i) => (
              <div key={i} className="flex items-center gap-2 bg-muted px-2 py-1 rounded text-sm">
                <span className="truncate max-w-[150px]">{att.name}</span>
                <button
                  type="button"
                  onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 p-4 items-end">
          <div className="flex gap-1">
            <FileUploadButton onFileUploaded={handleFileUploaded} />
            <EmojiPickerComponent onEmojiSelect={handleEmojiSelect} />
          </div>
          <Input
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              sendTypingSignal();
            }}
            placeholder="Digite sua mensagem..."
            disabled={sendMutation.isPending}
            maxLength={1000}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={(!message.trim() && attachments.length === 0) || sendMutation.isPending}
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};
