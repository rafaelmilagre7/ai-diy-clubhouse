import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useConversations, ConversationPreview } from '@/hooks/networking/useConversations';
import { cn } from '@/lib/utils';

interface ConversationsListProps {
  onSelectConversation: (userId: string, userName: string, userAvatar?: string) => void;
  selectedUserId?: string;
}

export const ConversationsList: React.FC<ConversationsListProps> = ({
  onSelectConversation,
  selectedUserId
}) => {
  const { data: conversations = [], isLoading } = useConversations();
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header com busca */}
      <div className="p-4 border-b border-border/50 space-y-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Conversas</h3>
          {conversations.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {conversations.length}
            </Badge>
          )}
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-muted/50 border-border/50"
          />
        </div>
      </div>

      {/* Lista de conversas */}
      <ScrollArea className="flex-1">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.userId}
                onClick={() => onSelectConversation(
                  conversation.userId,
                  conversation.userName,
                  conversation.userAvatar
                )}
                className={cn(
                  "w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors",
                  "focus:outline-none focus:bg-muted/50",
                  selectedUserId === conversation.userId && "bg-primary/5 border-l-2 border-primary"
                )}
              >
                {/* Avatar com status online */}
                <div className="relative">
                  <Avatar className="h-12 w-12 ring-2 ring-background">
                    <AvatarImage src={conversation.userAvatar} alt={conversation.userName} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                      {getInitials(conversation.userName)}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.isOnline && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full ring-2 ring-background" />
                  )}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm truncate">
                      {conversation.userName}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(conversation.lastMessageTime), {
                        locale: ptBR,
                        addSuffix: false
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground truncate">
                      {conversation.lastMessage}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <Badge 
                        variant="default" 
                        className="ml-2 h-5 min-w-[20px] px-1.5 bg-primary"
                      >
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
