import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import { ConversationList } from './ConversationList';
import { ActiveChat } from './ActiveChat';
import { UserSearch } from './UserSearch';
import { useConversations, Conversation } from '@/hooks/networking/useConversations';

interface InboxDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialUserId?: string;
}

export const InboxDrawer = ({ open, onOpenChange, initialUserId }: InboxDrawerProps) => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newChatUser, setNewChatUser] = useState<{
    id: string;
    name: string;
    avatar_url: string | null;
    company_name: string | null;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const { data: conversations = [], isLoading } = useConversations();

  // Quando abrir com initialUserId, buscar o usuário e iniciar conversa
  useEffect(() => {
    if (open && initialUserId && conversations.length > 0) {
      // Procurar conversa existente com esse usuário
      const existingConv = conversations.find(
        c => c.other_participant.id === initialUserId
      );
      
      if (existingConv) {
        setSelectedConversation(existingConv);
        setNewChatUser(null);
      } else {
        // Se não encontrar conversa, buscar perfil do usuário
        // (isso seria ideal com um hook, mas por ora vamos simplificar)
        setNewChatUser({
          id: initialUserId,
          name: 'Usuário',
          avatar_url: null,
          company_name: null,
        });
        setSelectedConversation(null);
      }
    }
  }, [open, initialUserId, conversations]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setNewChatUser(null);
  };

  const handleSelectUser = (user: {
    id: string;
    name: string;
    avatar_url: string | null;
    company_name: string | null;
  }) => {
    setNewChatUser(user);
    setSelectedConversation(null);
    setIsSearching(false);
  };

  const activeChatData = selectedConversation
    ? {
        conversationId: selectedConversation.id,
        otherUserId: selectedConversation.other_participant.id,
        otherUserName: selectedConversation.other_participant.name || 'Usuário',
        otherUserAvatar: selectedConversation.other_participant.avatar_url || undefined,
        otherUserCompany: selectedConversation.other_participant.company_name || undefined,
      }
    : newChatUser
    ? {
        conversationId: undefined,
        otherUserId: newChatUser.id,
        otherUserName: newChatUser.name || 'Usuário',
        otherUserAvatar: newChatUser.avatar_url || undefined,
        otherUserCompany: newChatUser.company_name || undefined,
      }
    : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-4xl p-0">
        <div className="flex h-full">
          {/* Lista de Conversas */}
          <div className="w-full sm:w-96 border-r border-border flex flex-col">
            <SheetHeader className="p-4 space-y-0">
              <div className="flex items-center justify-between">
                <SheetTitle>Mensagens</SheetTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearching(!isSearching)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </SheetHeader>

            <Separator />

            {isSearching && (
              <UserSearch
                onSelectUser={handleSelectUser}
                onClose={() => setIsSearching(false)}
              />
            )}

            <div className="flex-1 overflow-hidden">
              <ConversationList
                conversations={conversations}
                isLoading={isLoading}
                selectedConversationId={selectedConversation?.id}
                onSelectConversation={handleSelectConversation}
              />
            </div>
          </div>

          {/* Chat Ativo */}
          <div className="hidden sm:flex flex-1">
            {activeChatData ? (
              <ActiveChat {...activeChatData} />
            ) : (
              <div className="flex items-center justify-center w-full">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">
                    Selecione uma conversa
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Escolha uma conversa da lista ou inicie uma nova
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
