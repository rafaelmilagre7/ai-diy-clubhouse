
import React, { useState } from 'react';
import { ConversationsList } from '@/components/community/messages/ConversationsList';
import { ChatWindow } from '@/components/community/messages/ChatWindow';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import { Conversation } from '@/hooks/community/useDirectMessages';

const MessagesPage = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Mensagens</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Lista de conversas */}
        <div className="lg:col-span-1">
          <ConversationsList
            onSelectConversation={setSelectedConversation}
            selectedConversationId={selectedConversation?.id}
          />
        </div>
        
        {/* Janela de chat */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <ChatWindow conversation={selectedConversation} />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Selecione uma conversa</h3>
                <p className="text-muted-foreground">
                  Escolha uma conversa da lista para começar a conversar
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
