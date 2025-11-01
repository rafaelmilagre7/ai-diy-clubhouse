import { useConnections } from '@/hooks/networking/useConnections';
import { ConnectionCard } from './ConnectionCard';
import { ConnectionCardSkeleton } from './ConnectionCardSkeleton';
import { ErrorState } from '../common/ErrorState';
import { EmptyState } from '../common/EmptyState';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { InboxDrawer } from '@/components/networking/chat/InboxDrawer';

export const MyConnectionsGrid = () => {
  const { activeConnections, isLoading, error } = useConnections();
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<{ id: string; name: string; avatar_url?: string } | null>(null);
  const navigate = useNavigate();

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
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface-elevated border border-primary/30">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span className="font-semibold text-text-primary">Minhas Conexões</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ConnectionCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message={`Erro ao carregar conexões: ${error.message}`}
      />
    );
  }

  if (activeConnections.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhuma conexão ainda"
        description="Quando você aceitar solicitações ou se conectar com outros membros, eles aparecerão aqui"
        actionLabel="Descobrir Pessoas"
        onAction={() => navigate('/networking/connections?tab=discover')}
      />
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
