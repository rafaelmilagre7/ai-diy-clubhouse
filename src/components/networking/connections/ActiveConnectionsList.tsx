import { useState } from 'react';
import { useConnections } from '@/hooks/networking/useConnections';
import { ConnectionCard } from './ConnectionCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InboxDrawer } from '../chat/InboxDrawer';
import { Users, Sparkles } from 'lucide-react';

export const ActiveConnectionsList = () => {
  const { activeConnections, isLoading, error } = useConnections();
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<{
    id: string;
    name: string;
    avatar?: string;
  } | null>(null);

  const handleOpenChat = (connection: any) => {
    const isRequester = connection.requester_id === connection.requester?.id;
    const otherUser = isRequester ? connection.recipient : connection.requester;
    
    if (otherUser) {
      setSelectedRecipient({
        id: otherUser.id,
        name: otherUser.name,
        avatar: otherUser.avatar_url
      });
      setChatOpen(true);
    }
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
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-aurora/10 border border-aurora/20">
          <Users className="w-8 h-8 text-aurora" />
        </div>
        <h3 className="text-xl font-semibold text-text-primary">Nenhuma conexão ativa</h3>
        <p className="text-text-muted max-w-md mx-auto">
          Aceite solicitações pendentes ou descubra novos matches para começar a construir sua rede
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface-elevated border border-border/30">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-viverblue" />
          <span className="font-semibold text-text-primary">Suas Conexões</span>
        </div>
        <div className="px-3 py-1 rounded-full bg-viverblue/20 text-viverblue text-sm font-medium border border-viverblue/40">
          {activeConnections.length}
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

      {/* Inbox Drawer */}
      <InboxDrawer
        open={chatOpen}
        onOpenChange={setChatOpen}
      />
    </div>
  );
};
