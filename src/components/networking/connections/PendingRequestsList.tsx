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
      <div className="relative overflow-hidden rounded-2xl bg-card/60 backdrop-blur-sm border border-border/40 p-12 shadow-xl">
        <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5"></div>
        <div className="relative flex flex-col items-center text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl animate-pulse"></div>
            <div className="relative p-4 bg-card/80 backdrop-blur-sm rounded-2xl border border-border/40">
              <Inbox className="h-12 w-12 text-primary" />
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-heading font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Nenhuma solicitação pendente
            </h3>
            <p className="text-muted-foreground/80 max-w-md">
              Quando alguém enviar uma solicitação de conexão, ela aparecerá aqui
            </p>
          </div>
        </div>
      </div>
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
