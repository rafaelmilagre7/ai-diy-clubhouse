import React, { useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { ConversationsList } from './ConversationsList';
import { ChatPanel } from './ChatPanel';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialRecipientId?: string;
  initialRecipientName?: string;
  initialRecipientAvatar?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  open,
  onOpenChange,
  initialRecipientId,
  initialRecipientName,
  initialRecipientAvatar
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(initialRecipientId);
  const [selectedUserName, setSelectedUserName] = useState<string | undefined>(initialRecipientName);
  const [selectedUserAvatar, setSelectedUserAvatar] = useState<string | undefined>(initialRecipientAvatar);
  const [showMobileChat, setShowMobileChat] = useState(false);

  const handleSelectConversation = (userId: string, userName: string, userAvatar?: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setSelectedUserAvatar(userAvatar);
    setShowMobileChat(true);
  };

  const handleBack = () => {
    setShowMobileChat(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-[900px] p-0 overflow-hidden"
      >
        <div className="flex h-full">
          {/* Lista de conversas - desktop sempre visível, mobile apenas quando não há chat selecionado */}
          <div className={cn(
            "w-full sm:w-80 border-r border-border/50 bg-card/30",
            showMobileChat && "hidden sm:block"
          )}>
            <ConversationsList
              onSelectConversation={handleSelectConversation}
              selectedUserId={selectedUserId}
            />
          </div>

          {/* Painel de chat */}
          <div className={cn(
            "flex-1",
            !showMobileChat && !selectedUserId && "hidden sm:flex sm:items-center sm:justify-center"
          )}>
            {selectedUserId && selectedUserName ? (
              <ChatPanel
                recipientId={selectedUserId}
                recipientName={selectedUserName}
                recipientAvatar={selectedUserAvatar}
                onClose={() => onOpenChange(false)}
                onBack={handleBack}
              />
            ) : (
              <div className="hidden sm:flex flex-col items-center justify-center h-full text-center p-6">
                <div className="text-muted-foreground">
                  <p className="text-lg font-medium mb-2">Selecione uma conversa</p>
                  <p className="text-sm">Escolha uma conversa da lista para começar</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
