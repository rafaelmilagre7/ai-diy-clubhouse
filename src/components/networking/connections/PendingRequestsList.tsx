import { useState } from 'react';
import { usePendingRequests } from '@/hooks/networking/usePendingRequests';
import { useSentRequests } from '@/hooks/networking/useSentRequests';
import { useConnections } from '@/hooks/networking/useConnections';
import { ConnectionCard } from './ConnectionCard';
import { ConnectionCardSkeleton } from './ConnectionCardSkeleton';
import { ErrorState } from '../common/ErrorState';
import { EmptyState } from '../common/EmptyState';
import { SentRequestCard } from './SentRequestCard';
import { Inbox, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';

export const PendingRequestsList = () => {
  const { pendingRequests, isLoading: isLoadingReceived, error: receivedError } = usePendingRequests();
  const { sentRequests, isLoading: isLoadingSent, error: sentError } = useSentRequests();
  const { acceptRequest, rejectRequest, cancelRequest, isAccepting, isRejecting } = useConnections();
  const [filter, setFilter] = useState<'received' | 'sent'>('received');

  const handleAccept = async (connectionId: string) => {
    await acceptRequest(connectionId);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const isLoading = filter === 'received' ? isLoadingReceived : isLoadingSent;
  const error = filter === 'received' ? receivedError : sentError;
  const requests = filter === 'received' ? pendingRequests : sentRequests;

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

  if (!requests || requests.length === 0) {
    return (
      <>
        {/* Header Simples */}
        <div className="text-center py-8 space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted/50">
            {filter === 'received' ? (
              <Inbox className="w-8 h-8 text-muted-foreground" />
            ) : (
              <Send className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Nenhuma solicitação {filter === 'received' ? 'recebida' : 'enviada'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {filter === 'received' 
                ? 'Novas solicitações aparecerão aqui' 
                : 'Solicitações enviadas aparecerão aqui'
              }
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Simples com Contador */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-foreground">
              {requests.length}
            </h2>
            <p className="text-muted-foreground">
              {filter === 'received' ? 'solicitações aguardando resposta' : 'solicitações enviadas'}
            </p>
          </div>
        </div>

        {/* Filtros Simples */}
        <div className="flex items-center gap-2">
          <Button
            variant={filter === 'received' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('received')}
            className="gap-2"
          >
            <Inbox className="w-4 h-4" />
            Recebidas
            {pendingRequests.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-background/20">
                {pendingRequests.length}
              </span>
            )}
          </Button>
          <Button
            variant={filter === 'sent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('sent')}
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            Enviadas
            {sentRequests.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-background/20">
                {sentRequests.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Lista de Solicitações */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filter === 'received' ? (
            // Solicitações Recebidas
            pendingRequests.map((connection) => (
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
            ))
          ) : (
            // Solicitações Enviadas
            sentRequests.map((connection) => (
              <motion.div
                key={connection.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <SentRequestCard
                  connection={connection}
                  onCancel={(id) => cancelRequest(id)}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
