
import React, { useState } from 'react';
import { ConversationsList } from '@/components/community/messages/ConversationsList';
import { ChatWindow } from '@/components/community/messages/ChatWindow';
import { StartConversationDialog } from '@/components/community/messages/StartConversationDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import { Conversation, useDirectMessages } from '@/hooks/community/useDirectMessages';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';

const MessagesPage = () => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const { conversations } = useDirectMessages();

  const handleStartConversation = async (memberId: string) => {
    try {
      // Buscar dados do membro
      const { data: memberData } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .eq('id', memberId)
        .single();

      if (!memberData || !user) return;

      // Verificar se já existe conversa
      const existingConversation = conversations.find(conv => 
        (conv.participant_1_id === user.id && conv.participant_2_id === memberId) ||
        (conv.participant_1_id === memberId && conv.participant_2_id === user.id)
      );

      if (existingConversation) {
        setSelectedConversation(existingConversation);
        return;
      }

      // Criar nova conversa temporária
      const newConversation: Conversation = {
        id: `temp-${Date.now()}`,
        participant_1_id: user.id,
        participant_2_id: memberId,
        participant_1: {
          id: user.id,
          name: user.user_metadata?.name || 'Você',
          avatar_url: user.user_metadata?.avatar_url
        },
        participant_2: {
          id: memberData.id,
          name: memberData.name,
          avatar_url: memberData.avatar_url
        },
        last_message_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setSelectedConversation(newConversation);
    } catch (error) {
      console.error('Erro ao iniciar conversa:', error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Mensagens</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Lista de conversas */}
        <div className="lg:col-span-1 space-y-4">
          <StartConversationDialog onSelectMember={handleStartConversation} />
          
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
                  Escolha uma conversa da lista ou inicie uma nova conversa
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
