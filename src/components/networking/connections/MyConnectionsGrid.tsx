import { useConnections } from '@/hooks/networking/useConnections';
import { ConnectionCard } from './ConnectionCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { InboxDrawer } from '@/components/networking/chat/InboxDrawer';

export const MyConnectionsGrid = () => {
  const { activeConnections, isLoading, error } = useConnections();
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<{ id: string; name: string; avatar_url?: string } | null>(null);

  const handleOpenChat = (connection: any) => {
    // Determinar o outro usuário na conexão
    const otherUser = connection.requester_id === connection.requester?.id 
      ? connection.recipient 
      : connection.requester;
    
    setSelectedRecipient({
      id: otherUser.id,
      name: otherUser.name,
      avatar_url: otherUser.avatar_url
    });
    setChatOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-text-muted">Carregando conexões...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-destructive/50 bg-destructive/10">
        <AlertDescription className="text-destructive">
          Erro ao carregar conexões: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (activeConnections.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-text-primary">Nenhuma conexão ainda</h3>
        <p className="text-text-muted max-w-md mx-auto">
          Quando você aceitar solicitações ou se conectar com outros membros, eles aparecerão aqui
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header com contador */}
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface-elevated border border-primary/30">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span className="font-semibold text-text-primary">Minhas Conexões</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium border border-primary/40">
              {activeConnections.length} {activeConnections.length === 1 ? 'conexão' : 'conexões'}
            </div>
          </div>
        </div>

        {/* Grid de Conexões */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {activeConnections.map((connection) => (
            <ConnectionCard 
              key={connection.id} 
              connection={connection}
              variant="active"
              onMessage={() => handleOpenChat(connection)}
            />
          ))}
        </div>
      </div>

      {/* Drawer de Chat */}
      <InboxDrawer 
        open={chatOpen} 
        onOpenChange={setChatOpen}
        initialUserId={selectedRecipient?.id}
      />
    </>
  );
};
