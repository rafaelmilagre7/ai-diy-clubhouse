import { createContext, useContext, ReactNode } from 'react';
import { useSimpleNotifications } from '@/hooks/realtime/useSimpleNotifications';
import { useSimplePresence } from '@/hooks/realtime/useSimplePresence';
import { useRealtimeDirectMessages } from '@/hooks/realtime/useRealtimeDirectMessages';

/**
 * Provider V2 com ativação gradual
 * Permite ativar/desativar cada feature independentemente
 */

interface RealtimeContextValue {
  notifications: ReturnType<typeof useSimpleNotifications>;
  presence: ReturnType<typeof useSimplePresence>;
  chat: ReturnType<typeof useRealtimeDirectMessages>;
}

const RealtimeContext = createContext<RealtimeContextValue | undefined>(undefined);

interface RealtimeProviderV2Props {
  children: ReactNode;
  // Feature flags para ativação gradual
  enableNotifications?: boolean;
  enablePresence?: boolean;
  enableChat?: boolean;
  // Opções de notificações
  enableSound?: boolean;
  enableDesktopNotifications?: boolean;
}

export function RealtimeProviderV2({
  children,
  enableNotifications = true, // Fase 1: ATIVA por padrão
  enablePresence = false,     // Fase 2: DESATIVADA por padrão
  enableChat = false,          // Fase 3: DESATIVADA por padrão
  enableSound = true,
  enableDesktopNotifications = true,
}: RealtimeProviderV2Props) {
  // Fase 1: Notificações (sempre ativa)
  const notifications = useSimpleNotifications({
    enableSound: enableNotifications && enableSound,
    enableDesktopNotifications: enableNotifications && enableDesktopNotifications,
    enableToast: enableNotifications,
  });

  // Fase 2: Presença (ativa apenas se enablePresence = true)
  const presence = enablePresence 
    ? useSimplePresence()
    : {
        onlineUsers: {},
        isConnected: false,
        isUserOnline: () => false,
        getOnlineUsersList: () => [],
        getOnlineCount: () => 0,
      };

  // Fase 3: Chat (ativa apenas se enableChat = true)
  const chat = enableChat
    ? useRealtimeDirectMessages({
        enableSound: enableSound,
        enableToast: false,
      })
    : {
        isConnected: false,
      };

  const value: RealtimeContextValue = {
    notifications,
    presence,
    chat,
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtimeV2() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtimeV2 deve ser usado dentro de RealtimeProviderV2');
  }
  return context;
}
