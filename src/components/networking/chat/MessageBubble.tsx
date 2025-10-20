import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Check, CheckCheck, Edit2, Reply as ReplyIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MessageActions } from './MessageActions';
import { useMessageReactions, useAddReaction, useRemoveReaction } from '@/hooks/networking/useMessageReactions';
import { useEditMessage, useDeleteMessage } from '@/hooks/networking/useEditMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth';

interface MessageBubbleProps {
  message: any;
  isOwnMessage: boolean;
  senderName?: string;
  senderAvatar?: string;
  onReply?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  senderName,
  senderAvatar,
  onReply,
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [showReactions, setShowReactions] = useState(false);

  const { data: reactions = [] } = useMessageReactions(message.id);
  const addReaction = useAddReaction();
  const removeReaction = useRemoveReaction();
  const editMessage = useEditMessage();
  const deleteMessage = useDeleteMessage();

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const canEdit = () => {
    if (!isOwnMessage) return false;
    const messageTime = new Date(message.created_at).getTime();
    const now = Date.now();
    return now - messageTime < 15 * 60 * 1000; // 15 minutos
  };

  const handleEdit = async () => {
    if (!editedContent.trim()) return;
    await editMessage.mutateAsync({
      messageId: message.id,
      content: editedContent,
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja deletar esta mensagem?')) {
      await deleteMessage.mutateAsync(message.id);
    }
  };

  const handleReactionClick = (reaction: string) => {
    const userReaction = reactions.find(
      r => r.reaction === reaction && r.user_id === user?.id
    );

    if (userReaction) {
      removeReaction.mutate({ messageId: message.id, reaction });
    } else {
      addReaction.mutate({ messageId: message.id, reaction });
    }
  };

  // Agrupar reações
  const groupedReactions = reactions.reduce((acc, r) => {
    acc[r.reaction] = (acc[r.reaction] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const availableReactions = ['❤️', '👍', '😂', '😮', '😢', '🔥'];

  return (
    <div className={cn(
      "flex items-start gap-3 group animate-in fade-in slide-in-from-bottom-2 relative",
      isOwnMessage ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      {!isOwnMessage && (
        <Avatar className="h-8 w-8 ring-2 ring-background shrink-0">
          <AvatarImage src={senderAvatar} alt={senderName} />
          <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/10">
            {getInitials(senderName)}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Conteúdo da mensagem */}
      <div className={cn(
        "flex flex-col max-w-chat-bubble",
        isOwnMessage ? "items-end" : "items-start"
      )}>
        {/* Reply reference */}
        {message.reply_to_id && (
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <ReplyIcon className="w-3 h-3" />
            <span>Respondendo a mensagem</span>
          </div>
        )}

        <div className={cn(
          "rounded-2xl px-4 py-2.5 backdrop-blur-sm transition-all duration-200 relative",
          "border border-border/50 shadow-sm",
          isOwnMessage 
            ? "bg-primary/10 text-primary-foreground rounded-tr-sm" 
            : "bg-muted/50 text-foreground rounded-tl-sm",
          "group-hover:shadow-md group-hover:scale-[1.01]"
        )}>
          {isEditing ? (
            <div className="flex gap-2 items-center">
              <Input
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="h-8 text-sm"
                autoFocus
              />
              <Button size="sm" onClick={handleEdit} disabled={!editedContent.trim()}>
                Salvar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                {message.content}
              </p>
              
              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {message.attachments.map((att: any, i: number) => (
                    <div key={i}>
                      {att.type.startsWith('image/') ? (
                        <img 
                          src={att.url} 
                          alt={att.name}
                          className="max-w-full rounded-lg"
                        />
                      ) : (
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs underline"
                        >
                          📎 {att.name}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {message.edited_at && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Edit2 className="w-3 h-3" />
                  Editada
                </p>
              )}
            </>
          )}

          {/* Actions */}
          {!isEditing && (
            <MessageActions
              messageId={message.id}
              content={message.content}
              isOwn={isOwnMessage}
              canEdit={canEdit()}
              onReply={onReply || (() => {})}
              onEdit={() => setIsEditing(true)}
              onDelete={handleDelete}
            />
          )}
        </div>

        {/* Reactions */}
        {Object.keys(groupedReactions).length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {Object.entries(groupedReactions).map(([reaction, count]) => {
              const hasUserReacted = reactions.some(
                r => r.reaction === reaction && r.user_id === user?.id
              );
              return (
                <button
                  key={reaction}
                  onClick={() => handleReactionClick(reaction)}
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full border transition-all",
                    hasUserReacted 
                      ? "bg-primary/20 border-primary" 
                      : "bg-muted border-border hover:bg-muted/80"
                  )}
                >
                  {reaction} {count}
                </button>
              );
            })}
          </div>
        )}

        {/* Add reaction button */}
        {showReactions && (
          <div className="flex gap-1 mt-1 p-2 bg-popover border rounded-lg shadow-lg">
            {availableReactions.map(reaction => (
              <button
                key={reaction}
                onClick={() => {
                  handleReactionClick(reaction);
                  setShowReactions(false);
                }}
                className="text-lg hover:scale-125 transition-transform"
              >
                {reaction}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => setShowReactions(!showReactions)}
          className="text-xs text-muted-foreground hover:text-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          + Reagir
        </button>
        
        {/* Timestamp e confirmação */}
        <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-muted-foreground px-1">
            {formatDistanceToNow(new Date(message.created_at), { 
              addSuffix: true,
              locale: ptBR 
            })}
          </span>
          
          {isOwnMessage && (
            <>
              {message.read_at ? (
                <CheckCheck className="w-3 h-3 text-operational" />
              ) : message.delivered_at ? (
                <CheckCheck className="w-3 h-3 text-muted-foreground" />
              ) : (
                <Check className="w-3 h-3 text-muted-foreground" />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
