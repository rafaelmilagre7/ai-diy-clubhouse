import { usePendingRequests } from '@/hooks/networking/usePendingRequests';
import { useConnections } from '@/hooks/networking/useConnections';
import { ConnectionCard } from './ConnectionCard';
import { ConnectionCardSkeleton } from './ConnectionCardSkeleton';
import { ErrorState } from '../common/ErrorState';
import { EmptyState } from '../common/EmptyState';
import { PendingHeader } from './PendingHeader';
import { Clock } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export const PendingRequestsList = () => {
  const { pendingRequests, isLoading, error } = usePendingRequests();
  const { acceptRequest, rejectRequest, isAccepting, isRejecting } = useConnections();

  const handleAccept = (connectionId: string) => {
    acceptRequest(connectionId);
    // Confetti ao aceitar conexão
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#7877C6', '#A78BFA', '#C084FC']
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-48 bg-muted/20 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <ConnectionCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message={`Erro ao carregar solicitações: ${error.message}`}
      />
    );
  }

  if (pendingRequests.length === 0) {
    return (
      <>
        <PendingHeader 
          receivedCount={0}
          unreadCount={0}
          isLoading={isLoading}
        />
        <EmptyState 
          icon={Clock}
          title="Nenhuma solicitação pendente"
          description="Você não possui solicitações de conexão aguardando sua resposta no momento"
        />
      </>
    );
  }

  // Contar solicitações não visualizadas (criadas nas últimas 24h)
  const unreadCount = pendingRequests.filter(req => {
    const createdAt = new Date(req.created_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    return hoursDiff < 24;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header Premium */}
      <PendingHeader 
        receivedCount={pendingRequests.length}
        unreadCount={unreadCount}
        isLoading={isLoading}
      />

      {/* Grid de Solicitações com Animação */}
      <AnimatePresence mode="popLayout">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {pendingRequests.map((connection) => (
            <ConnectionCard 
              key={connection.id} 
              connection={connection}
              variant="pending"
              onAccept={handleAccept}
              onReject={rejectRequest}
              isAccepting={isAccepting}
              isRejecting={isRejecting}
            />
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
};
