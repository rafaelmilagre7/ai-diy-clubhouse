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
      <div className="relative overflow-hidden rounded-2xl bg-card/60 backdrop-blur-sm border border-border/40 p-12 shadow-xl">
        <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5"></div>
        <div className="relative flex flex-col items-center text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl animate-pulse"></div>
            <div className="relative p-4 bg-card/80 backdrop-blur-sm rounded-2xl border border-border/40">
              <Users className="h-12 w-12 text-primary" />
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-heading font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Nenhuma conexão ativa
            </h3>
            <p className="text-muted-foreground/80 max-w-md">
              Aceite solicitações pendentes ou descubra novos membros para começar a construir sua rede
            </p>
          </div>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
            {filteredConnections.map((connection, index) => (
              <div 
                key={connection.id}
                className="animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <ConnectionCard 
                  connection={connection}
                  variant="active"
                  onMessage={() => handleOpenChat(connection)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl bg-card/60 backdrop-blur-sm border border-border/40 p-8 shadow-lg">
            <div className="text-center space-y-3">
              <p className="text-muted-foreground">Nenhuma conexão encontrada para "{searchQuery}"</p>
            </div>
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
