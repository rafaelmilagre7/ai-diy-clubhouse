import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, Clock, Check, X, MessageCircle } from 'lucide-react';
import { useConnections, type ConnectionStatus } from '@/hooks/useConnections';
import { supabase } from '@/integrations/supabase/client';
import { ChatModal } from './ChatModal';

interface ConnectionButtonProps {
  userId: string;
  userName?: string;
  userAvatar?: string;
  className?: string;
}

export const ConnectionButton = ({ userId, userName, userAvatar, className }: ConnectionButtonProps) => {
  const [user, setUser] = useState<any>(null);
  const [showChat, setShowChat] = useState(false);
  const { checkConnection, sendConnectionRequest, acceptConnection, rejectConnection } = useConnections();
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);
  const [connectionStatus, setConnectionStatus] = useState<{
    exists: boolean;
    status?: ConnectionStatus;
    isRequester?: boolean;
    connectionId?: string;
  }>({ exists: false });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadConnectionStatus = async () => {
      if (!user || user.id === userId) return;

      try {
        const connection = await checkConnection(userId);
        if (connection) {
          setConnectionStatus({
            exists: true,
            status: connection.status as ConnectionStatus,
            isRequester: connection.requester_id === user.id,
            connectionId: connection.id
          });
        }
      } catch (error) {
        console.error('Erro ao verificar conexão:', error);
      }
    };

    loadConnectionStatus();
  }, [user, userId, checkConnection]);

  const handleConnect = async () => {
    if (!user || isLoading) return;

    setIsLoading(true);
    try {
      await sendConnectionRequest.mutateAsync(userId);
      // Recarregar status após envio
      const connection = await checkConnection(userId);
      if (connection) {
        setConnectionStatus({
          exists: true,
          status: connection.status as ConnectionStatus,
          isRequester: connection.requester_id === user.id,
          connectionId: connection.id
        });
      }
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!connectionStatus.connectionId || isLoading) return;
    
    setIsLoading(true);
    try {
      await acceptConnection.mutateAsync(connectionStatus.connectionId);
      setConnectionStatus(prev => ({ ...prev, status: 'accepted' }));
    } catch (error) {
      console.error('Erro ao aceitar conexão:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!connectionStatus.connectionId || isLoading) return;
    
    setIsLoading(true);
    try {
      await rejectConnection.mutateAsync(connectionStatus.connectionId);
      setConnectionStatus(prev => ({ ...prev, status: 'rejected' }));
    } catch (error) {
      console.error('Erro ao rejeitar conexão:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Não mostrar botão para o próprio usuário
  if (!user || user.id === userId) return null;

  // Se é uma conexão aceita, mostrar botão de mensagem
  if (connectionStatus.exists && connectionStatus.status === 'accepted') {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          className={className}
          onClick={() => setShowChat(true)}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Mensagem
        </Button>
        {showChat && userName && (
          <ChatModal
            isOpen={showChat}
            onClose={() => setShowChat(false)}
            recipientId={userId}
            recipientName={userName}
            recipientAvatar={userAvatar}
          />
        )}
      </>
    );
  }

  // Se há uma solicitação pendente e o usuário atual foi quem enviou
  if (connectionStatus.exists && connectionStatus.status === 'pending' && connectionStatus.isRequester) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={className}
        disabled
      >
        <Clock className="h-4 w-4 mr-2" />
        Enviado
      </Button>
    );
  }

  // Se há uma solicitação pendente e o usuário atual foi quem recebeu
  if (connectionStatus.exists && connectionStatus.status === 'pending' && !connectionStatus.isRequester) {
    return (
      <div className="flex gap-2">
        <Button
          variant="default"
          size="sm"
          className="bg-viverblue hover:bg-viverblue/90"
          onClick={handleAccept}
          disabled={isLoading}
        >
          <Check className="h-4 w-4 mr-2" />
          {isLoading ? 'Aceitando...' : 'Aceitar'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReject}
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Se a conexão foi rejeitada, não mostrar botão
  if (connectionStatus.exists && connectionStatus.status === 'rejected') {
    return null;
  }

  // Se não há conexão, mostrar botão para conectar
  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={handleConnect}
      disabled={isLoading}
    >
      <UserPlus className="h-4 w-4 mr-2" />
      {isLoading ? 'Enviando...' : 'Conectar'}
    </Button>
  );
};