import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, X, Phone, Calendar, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { useAuth } from '@/contexts/auth';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChatWindowProps {
  connection: {
    id: string;
    requester_id: string;
    recipient_id: string;
    requester?: {
      id: string;
      name: string;
      company_name?: string;
      current_position?: string;
      avatar_url?: string;
    };
    recipient?: {
      id: string;
      name: string;
      company_name?: string;
      current_position?: string;
      avatar_url?: string;
    };
  };
  onClose: () => void;
  onMinimize?: () => void;
}

export const ChatWindow = ({ connection, onClose, onMinimize }: ChatWindowProps) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Determinar o outro usuário na conexão
  const otherUser = user?.id === connection.requester_id 
    ? connection.recipient 
    : connection.requester;
  
  const { 
    messages, 
    sendMessage, 
    markAsRead, 
    isLoading 
  } = useDirectMessages(otherUser?.id || '');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Marcar mensagens como lidas quando o chat abre
    if (otherUser?.id) {
      markAsRead.mutate(otherUser.id);
    }
  }, [otherUser?.id, markAsRead]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !otherUser?.id) return;

    await sendMessage.mutateAsync({
      recipientId: otherUser.id,
      content: newMessage.trim()
    });
    
    setNewMessage('');
  };

  if (!otherUser) return null;

  const avatar = otherUser.avatar_url || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name)}&background=0D8ABC&color=fff`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.2 }}
      className="fixed bottom-4 right-4 w-96 h-[600px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] z-50"
    >
      <Card className="h-full flex flex-col border-neutral-800/50 bg-[#151823] shadow-2xl">
        <CardHeader className="pb-3 px-4 py-3 border-b border-neutral-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatar} alt={otherUser.name} />
                <AvatarFallback className="bg-viverblue text-white text-sm">
                  {otherUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-sm text-white">{otherUser.name}</CardTitle>
                <p className="text-xs text-neutral-400">{otherUser.current_position}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" disabled>
                <Phone className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" disabled>
                <Calendar className="h-3 w-3" />
              </Button>
              {onMinimize && (
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={onMinimize}>
                  <Minimize2 className="h-3 w-3" />
                </Button>
              )}
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={onClose}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 flex flex-col">
          <ScrollArea className="flex-1 px-4 py-3">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-neutral-400">
                  <p className="text-sm">Início da conversa com {otherUser.name}</p>
                  <p className="text-xs mt-1">Envie uma mensagem para começar!</p>
                </div>
              ) : (
                <AnimatePresence>
                  {messages.map((message) => {
                    const isOwn = message.sender_id === user?.id;
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] ${isOwn ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`
                              px-3 py-2 rounded-lg text-sm
                              ${isOwn 
                                ? 'bg-viverblue text-white ml-2' 
                                : 'bg-neutral-800 text-neutral-100 mr-2'
                              }
                            `}
                          >
                            {message.content}
                          </div>
                          <p className={`text-xs text-neutral-500 mt-1 ${isOwn ? 'text-right' : 'text-left'} px-1`}>
                            {formatDistanceToNow(new Date(message.created_at), {
                              addSuffix: true,
                              locale: ptBR
                            })}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="border-t border-neutral-800/50 p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-400"
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
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};