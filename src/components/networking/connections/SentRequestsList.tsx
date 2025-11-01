import { Send } from 'lucide-react';
import { useSentRequests } from '@/hooks/networking/useSentRequests';
import { useConnections } from '@/hooks/networking/useConnections';
import { SentRequestCard } from './SentRequestCard';

import { EmptyState } from '../common/EmptyState';
import { ErrorState } from '../common/ErrorState';
import { AnimatePresence } from 'framer-motion';


export const SentRequestsList = () => {
  const { sentRequests, isLoading, error } = useSentRequests();
  const { cancelRequest, isCancelingRequest } = useConnections();

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
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-1">Solicitações Enviadas</h2>
          <p className="text-sm text-muted-foreground">
            0 solicitações aguardando resposta
          </p>
        </div>
        <EmptyState 
          icon={Send}
          title="Nenhuma solicitação enviada"
          description="Você ainda não enviou nenhuma solicitação de conexão. Explore o Networking para encontrar pessoas interessantes!"
        />
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Simples */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">Solicitações Enviadas</h2>
        <p className="text-sm text-muted-foreground">
          {sentRequests.length} {sentRequests.length === 1 ? 'solicitação aguardando' : 'solicitações aguardando'} resposta
        </p>
      </div>

      {/* Grid de Solicitações com Animação */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {sentRequests.map((request) => (
            <SentRequestCard 
              key={request.id} 
              connection={request}
              onCancel={(id) => cancelRequest(id)}
              isCanceling={isCancelingRequest}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
