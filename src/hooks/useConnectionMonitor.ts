
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface ConnectionStatus {
  isOnline: boolean;
  downlinkSpeed: number | null;
  effectiveType: string | null;
  lastOnline: Date | null;
  lastOffline: Date | null;
}

export const useConnectionMonitor = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isOnline: navigator.onLine,
    downlinkSpeed: null,
    effectiveType: null,
    lastOnline: null,
    lastOffline: null
  });

  useEffect(() => {
    const updateOnlineStatus = () => {
      const isOnline = navigator.onLine;
      const now = new Date();
      
      setConnectionStatus(prev => ({
        ...prev,
        isOnline,
        lastOnline: isOnline ? now : prev.lastOnline,
        lastOffline: !isOnline ? now : prev.lastOffline
      }));

      // Mostrar toast apenas quando muda de estado
      if (isOnline && !connectionStatus.isOnline) {
        toast.success('Conexão restaurada!');
      } else if (!isOnline && connectionStatus.isOnline) {
        toast.error('Conexão perdida. Algumas funcionalidades podem não funcionar.');
      }
    };

    const updateConnectionInfo = () => {
      // @ts-ignore - Navigator connection não está totalmente tipado
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      if (connection) {
        setConnectionStatus(prev => ({
          ...prev,
          downlinkSpeed: connection.downlink || null,
          effectiveType: connection.effectiveType || null
        }));
      }
    };

    // Event listeners
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // @ts-ignore
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      connection.addEventListener('change', updateConnectionInfo);
    }

    // Verificação inicial
    updateConnectionInfo();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      
      if (connection) {
        connection.removeEventListener('change', updateConnectionInfo);
      }
    };
  }, [connectionStatus.isOnline]);

  return connectionStatus;
};
