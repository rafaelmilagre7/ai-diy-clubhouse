
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ForumBreadcrumbs } from '@/components/community/ForumBreadcrumbs';
import { ForumHeader } from '@/components/community/ForumHeader';
import { CommunityNavigation } from '@/components/community/CommunityNavigation';
import { MessagesInbox } from '@/components/community/messages/MessagesInbox';
import { MessageConversation } from '@/components/community/messages/MessageConversation';
import { useDirectMessages } from '@/hooks/community/useDirectMessages';

export const MessagesPage = () => {
  const location = useLocation();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { conversations } = useDirectMessages();

  // Verificar se foi direcionado para uma conversa específica
  useEffect(() => {
    const state = location.state as { selectedMemberId?: string } | null;
    if (state?.selectedMemberId) {
      // Encontrar conversa existente ou preparar para criar nova
      const existingConversation = conversations.find(conv => 
        conv.participant_1?.id === state.selectedMemberId || 
        conv.participant_2?.id === state.selectedMemberId
      );
      
      if (existingConversation) {
        setSelectedConversationId(existingConversation.id);
      } else {
        // Preparar para nova conversa
        setSelectedConversationId(`new-${state.selectedMemberId}`);
      }
    }
  }, [location.state, conversations]);

  return (
    <div className="container max-w-7xl mx-auto py-6">
      <ForumBreadcrumbs 
        section="mensagens"
        sectionTitle="Mensagens"
      />
      
      <ForumHeader
        title="Mensagens"
        description="Converse com outros membros da comunidade"
        showNewTopicButton={false}
      />
      
      <CommunityNavigation />
      
      <div className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Lista de conversas */}
          <div className="lg:col-span-1">
            <MessagesInbox
              selectedConversationId={selectedConversationId}
              onConversationSelect={setSelectedConversationId}
            />
          </div>
          
          {/* Área da conversa */}
          <div className="lg:col-span-2">
            {selectedConversationId ? (
              <MessageConversation
                conversationId={selectedConversationId}
                onBack={() => setSelectedConversationId(null)}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-muted/20 rounded-lg border-2 border-dashed">
                <div className="text-center">
                  <div className="text-4xl mb-4">💬</div>
                  <h3 className="text-lg font-semibold mb-2">Selecione uma conversa</h3>
                  <p className="text-muted-foreground">
                    Escolha uma conversa da lista ao lado para começar a trocar mensagens
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
