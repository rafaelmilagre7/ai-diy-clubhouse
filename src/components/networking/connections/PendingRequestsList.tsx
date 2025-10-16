import { usePendingRequests } from '@/hooks/networking/usePendingRequests';
import { useConnections } from '@/hooks/networking/useConnections';
import { ConnectionCard } from './ConnectionCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock } from 'lucide-react';

export const PendingRequestsList = () => {
  const { pendingRequests, isLoading, error } = usePendingRequests();
  const { acceptRequest, rejectRequest, isAccepting, isRejecting } = useConnections();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-text-muted">Carregando solicitações...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-destructive/50 bg-destructive/10">
        <AlertDescription className="text-destructive">
          Erro ao carregar solicitações: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (pendingRequests.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-aurora/10 border border-aurora/20">
          <Clock className="w-8 h-8 text-aurora" />
        </div>
        <h3 className="text-xl font-semibold text-text-primary">Nenhuma solicitação pendente</h3>
        <p className="text-text-muted max-w-md mx-auto">
          Quando outros membros enviarem solicitações de conexão, elas aparecerão aqui
        </p>
      </div>
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
