import { useState, useMemo } from 'react';
import { useConnections } from '@/hooks/networking/useConnections';
import { ConnectionCard } from './ConnectionCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InboxDrawer } from '../chat/InboxDrawer';
import { ActiveConnectionsHeader } from './ActiveConnectionsHeader';
import { FilterBar } from './FilterBar';
import { Users } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

export const ActiveConnectionsList = () => {
  const { activeConnections, isLoading, error } = useConnections();
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<{
    id: string;
    name: string;
    avatar?: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenChat = (connection: any) => {
    const isRequester = connection.requester_id === connection.requester?.id;
    const otherUser = isRequester ? connection.recipient : connection.requester;
    
    if (otherUser) {
      setSelectedRecipient({
        id: otherUser.id,
        name: otherUser.name,
        avatar: otherUser.avatar_url
      });
      setChatOpen(true);
    }
  };

  // Filtrar conexões por busca
  const filteredConnections = useMemo(() => {
    if (!searchQuery.trim()) return activeConnections;
    
    const query = searchQuery.toLowerCase();
    return activeConnections.filter((connection) => {
      const isRequester = connection.requester_id === connection.requester?.id;
      const otherUser = isRequester ? connection.recipient : connection.requester;
      
      return (
        otherUser?.name?.toLowerCase().includes(query) ||
        otherUser?.company_name?.toLowerCase().includes(query) ||
        otherUser?.current_position?.toLowerCase().includes(query) ||
        otherUser?.industry?.toLowerCase().includes(query)
      );
    });
  }, [activeConnections, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-text-muted">Carregando conexões...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-destructive/50 bg-destructive/10">
        <AlertDescription className="text-destructive">
          Erro ao carregar conexões: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (activeConnections.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-aurora/10 border border-aurora/20">
          <Users className="w-8 h-8 text-aurora" />
        </div>
        <h3 className="text-xl font-semibold text-text-primary">Nenhuma conexão ativa</h3>
        <p className="text-text-muted max-w-md mx-auto">
          Aceite solicitações pendentes ou descubra novos matches para começar a construir sua rede
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Premium */}
      <ActiveConnectionsHeader 
        totalConnections={activeConnections.length}
        isLoading={isLoading}
      />

      {/* Barra de Busca e Filtros */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Buscar conexões por nome, empresa ou cargo..."
      />

      {/* Contador de Resultados */}
      {searchQuery && (
        <div className="text-sm text-muted-foreground">
          {filteredConnections.length} {filteredConnections.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
        </div>
      )}

      {/* Grid de Conexões com Animação */}
      <AnimatePresence mode="popLayout">
        {filteredConnections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredConnections.map((connection) => (
              <ConnectionCard 
                key={connection.id} 
                connection={connection}
                variant="active"
                onMessage={() => handleOpenChat(connection)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 space-y-3">
            <p className="text-muted-foreground">Nenhuma conexão encontrada para "{searchQuery}"</p>
          </div>
        )}
      </AnimatePresence>

      {/* Inbox Drawer */}
      <InboxDrawer
        open={chatOpen}
        onOpenChange={setChatOpen}
      />
    </div>
  );
};
