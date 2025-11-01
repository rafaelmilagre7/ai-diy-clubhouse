import { usePendingRequests } from '@/hooks/networking/usePendingRequests';
import { useConnections } from '@/hooks/networking/useConnections';
import { ConnectionCard } from './ConnectionCard';
import { ConnectionCardSkeleton } from './ConnectionCardSkeleton';
import { ErrorState } from '../common/ErrorState';
import { Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export const PendingRequestsList = () => {
  const { pendingRequests, isLoading, error } = usePendingRequests();
  const { acceptRequest, rejectRequest, isAccepting, isRejecting } = useConnections();

  const handleAccept = async (connectionId: string) => {
    await acceptRequest(connectionId);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };


  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <ConnectionCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message={`Erro ao carregar solicitações: ${error.message}`}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!pendingRequests || pendingRequests.length === 0) {
    return (
      <>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-1">Solicitações Recebidas</h2>
          <p className="text-sm text-muted-foreground">
            0 solicitações aguardando sua resposta
          </p>
        </div>
        
        <div className="text-center py-8 space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted/50">
            <Inbox className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Nenhuma solicitação recebida
            </h3>
            <p className="text-sm text-muted-foreground">
              Novas solicitações aparecerão aqui
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Simples */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">Solicitações Recebidas</h2>
        <p className="text-sm text-muted-foreground">
          {pendingRequests.length} {pendingRequests.length === 1 ? 'solicitação aguardando' : 'solicitações aguardando'} sua resposta
        </p>
      </div>

      {/* Grid de Solicitações Recebidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {pendingRequests.map((connection) => (
            <motion.div
              key={connection.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <ConnectionCard 
                connection={connection}
                variant="pending"
                onAccept={handleAccept}
                onReject={(id) => rejectRequest(id)}
                isAccepting={isAccepting}
                isRejecting={isRejecting}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
