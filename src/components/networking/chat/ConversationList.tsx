import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Conversation } from '@/hooks/networking/useConversations';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversationListProps {
  conversations: Conversation[];
  isLoading: boolean;
  selectedConversationId?: string;
  onSelectConversation: (conversation: Conversation) => void;
}

export const ConversationList = ({
  conversations,
  isLoading,
  selectedConversationId,
  onSelectConversation,
}: ConversationListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <MessageCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-2">Nenhuma conversa ainda</h3>
        <p className="text-sm text-muted-foreground">
          Use a busca acima para iniciar uma nova conversa
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        {conversations.map((conversation) => {
          const isSelected = conversation.id === selectedConversationId;
          const hasUnread = conversation.unread_count > 0;

          return (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className={cn(
                'w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left',
                isSelected
                  ? 'bg-accent'
                  : 'hover:bg-accent/50',
                hasUnread && 'bg-primary/5'
              )}
            >
              <Avatar className="w-12 h-12 shrink-0">
                <AvatarImage
                  src={conversation.other_participant.avatar_url || ''}
                  alt={conversation.other_participant.name || 'Usuário'}
                />
                <AvatarFallback>
                  {(conversation.other_participant.name || 'U')
                    .substring(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span
                    className={cn(
                      'font-medium truncate',
                      hasUnread && 'text-foreground'
                    )}
                  >
                    {conversation.other_participant.name || 'Usuário'}
                  </span>
                  {conversation.last_message && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDistanceToNow(
                        new Date(conversation.last_message.created_at),
                        { addSuffix: true, locale: ptBR }
                      )}
                    </span>
                  )}
                </div>

                {conversation.other_participant.company_name && (
                  <p className="text-xs text-muted-foreground truncate mb-1">
                    {conversation.other_participant.company_name}
                  </p>
                )}

                <div className="flex items-center justify-between gap-2">
                  {conversation.last_message ? (
                    <p
                      className={cn(
                        'text-sm truncate',
                        hasUnread
                          ? 'font-medium text-foreground'
                          : 'text-muted-foreground'
                      )}
                    >
                      {conversation.last_message.content}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Nenhuma mensagem
                    </p>
                  )}

                  {hasUnread && (
                    <Badge
                      variant="default"
                      className="shrink-0 h-5 min-w-5 px-1.5"
                    >
                      {conversation.unread_count}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
};
