import { Send, X, Eye } from 'lucide-react';
import { useSentRequests } from '@/hooks/networking/useSentRequests';
import { useConnections } from '@/hooks/networking/useConnections';
import { ConnectionCard } from './ConnectionCard';
import { SentRequestsHeader } from './SentRequestsHeader';
import { EmptyState } from '../common/EmptyState';
import { ErrorState } from '../common/ErrorState';
import { AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';

export const SentRequestsList = () => {
  const { sentRequests, isLoading, error } = useSentRequests();
  const { cancelRequest, isCancelingRequest } = useConnections();

  // Calcular taxa de aceitação (mock - seria calculado no backend)
  const acceptanceRate = useMemo(() => {
    // Mock: 65% de taxa de aceitação
    return 65;
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-48 bg-muted/20 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message="Erro ao carregar solicitações enviadas"
      />
    );
  }

  if (sentRequests.length === 0) {
    return (
      <>
        <SentRequestsHeader 
          totalSent={0}
          pendingCount={0}
          acceptanceRate={0}
          isLoading={isLoading}
        />
        <EmptyState 
          icon={Send}
          title="Nenhuma solicitação enviada"
          description="Você ainda não enviou nenhuma solicitação de conexão. Explore a aba 'Descobrir' para encontrar pessoas interessantes!"
        />
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Premium */}
      <SentRequestsHeader 
        totalSent={sentRequests.length}
        pendingCount={sentRequests.length}
        acceptanceRate={acceptanceRate}
        isLoading={isLoading}
      />

      {/* Grid de Solicitações com Animação */}
      <AnimatePresence mode="popLayout">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sentRequests.map((request) => (
            <ConnectionCard 
              key={request.id} 
              connection={request}
              variant="discover"
              showPendingBadge={true}
            />
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
};
