import { Send } from 'lucide-react';
import { useSentRequests } from '@/hooks/networking/useSentRequests';
import { useConnections } from '@/hooks/networking/useConnections';
import { SentRequestCard } from './SentRequestCard';
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
      <div className="relative overflow-hidden rounded-2xl bg-card/60 backdrop-blur-sm border border-border/40 p-12 shadow-xl">
        <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5"></div>
        <div className="relative flex flex-col items-center text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl animate-pulse"></div>
            <div className="relative p-4 bg-card/80 backdrop-blur-sm rounded-2xl border border-border/40">
              <Send className="h-12 w-12 text-primary" />
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-heading font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Nenhuma solicitação enviada
            </h3>
            <p className="text-muted-foreground/80 max-w-md">
              Quando você enviar solicitações de conexão, elas aparecerão aqui
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
