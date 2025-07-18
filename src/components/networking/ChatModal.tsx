import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Send, User, X } from 'lucide-react';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
}

export const ChatModal = ({ isOpen, onClose, recipientId, recipientName, recipientAvatar }: ChatModalProps) => {
  const [newMessage, setNewMessage] = useState('');
  const { messages, sendMessage, markAsRead } = useDirectMessages(recipientId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && recipientId) {
      markAsRead.mutate(recipientId);
    }
  }, [isOpen, recipientId, markAsRead]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sendMessage.isPending) return;

    try {
      await sendMessage.mutateAsync({
        recipientId,
        content: newMessage.trim()
      });
      setNewMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md h-[600px] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center">
              {recipientAvatar ? (
                <img
                  src={recipientAvatar}
                  alt={recipientName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <User className="h-4 w-4 text-neutral-600" />
              )}
            </div>
            <span>{recipientName}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="ml-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50 rounded-lg">
          {messages.length === 0 ? (
            <div className="text-center text-textSecondary py-8">
              <p>Nenhuma mensagem ainda.</p>
              <p className="text-sm">Seja o primeiro a enviar uma mensagem!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.sender_id !== recipientId;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isOwnMessage
                        ? 'bg-viverblue text-white'
                        : 'bg-white border border-neutral-200'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-blue-100' : 'text-neutral-500'
                    }`}>
                      {formatDistanceToNow(new Date(message.created_at), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2 p-2 border-t">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1"
            disabled={sendMessage.isPending}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!newMessage.trim() || sendMessage.isPending}
            className="bg-viverblue hover:bg-viverblue/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};