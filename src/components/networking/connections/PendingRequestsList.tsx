import { usePendingRequests } from '@/hooks/networking/usePendingRequests';
import { useConnections } from '@/hooks/networking/useConnections';
import { ConnectionCard } from './ConnectionCard';
import { ConnectionCardSkeleton } from './ConnectionCardSkeleton';
import { ErrorState } from '../common/ErrorState';
import { EmptyState } from '../common/EmptyState';
import { Clock } from 'lucide-react';

export const PendingRequestsList = () => {
  const { pendingRequests, isLoading, error } = usePendingRequests();
  const { acceptRequest, rejectRequest, isAccepting, isRejecting } = useConnections();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface-elevated border border-aurora/30">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-operational" />
            <span className="font-semibold text-text-primary">Solicitações Pendentes</span>
          </div>
        </div>
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
      <EmptyState
        icon={Clock}
        title="Nenhuma solicitação pendente"
        description="Quando outros membros enviarem solicitações de conexão, elas aparecerão aqui"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com contador de notificações */}
      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface-elevated border border-aurora/30">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-operational" />
          <span className="font-semibold text-text-primary">Solicitações Pendentes</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-operational/20 text-operational text-sm font-medium border border-operational/40 animate-pulse">
            {pendingRequests.length} {pendingRequests.length === 1 ? 'nova' : 'novas'}
          </div>
        </div>
      </div>

      {/* Grid de Solicitações */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {pendingRequests.map((request) => (
          <ConnectionCard 
            key={request.id} 
            connection={request}
            variant="pending"
            onAccept={acceptRequest}
            onReject={rejectRequest}
            isAccepting={isAccepting}
            isRejecting={isRejecting}
          />
        ))}
      </div>
    </div>
  );
};
