import { createContext, useContext, ReactNode } from 'react';
import { useRealtimeNotifications } from '@/hooks/realtime/useRealtimeNotifications';
import { usePresence } from '@/hooks/realtime/usePresence';

interface RealtimeContextValue {
  // Notificações
  notifications: {
    isConnected: boolean;
    isReconnecting: boolean;
  };
  // Presença
  presence: ReturnType<typeof usePresence>;
}

const RealtimeContext = createContext<RealtimeContextValue | undefined>(undefined);

interface RealtimeProviderProps {
  children: ReactNode;
  enableNotifications?: boolean;
  enablePresence?: boolean;
  enableSound?: boolean;
  enableDesktopNotifications?: boolean;
}

export function RealtimeProvider({
  children,
  enableNotifications = true,
  enablePresence = true,
  enableSound = true,
  enableDesktopNotifications = true,
}: RealtimeProviderProps) {
  // Hook de notificações
  const notificationsStatus = useRealtimeNotifications({
    enableSound: enableNotifications && enableSound,
    enableDesktopNotifications: enableNotifications && enableDesktopNotifications,
  });

  // Hook de presença
  const presence = usePresence();

  const value: RealtimeContextValue = {
    notifications: {
      isConnected: enableNotifications ? notificationsStatus.isConnected : false,
      isReconnecting: enableNotifications ? notificationsStatus.isReconnecting : false,
    },
    presence: enablePresence ? presence : {
      onlineUsers: {},
      myPresence: null,
      isConnected: false,
      updatePresence: async () => {},
      isUserOnline: () => false,
      getUserLastSeen: () => null,
      getOnlineUsersList: () => [],
      getOnlineCount: () => 0,
    },
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime deve ser usado dentro de RealtimeProvider');
  }
  return context;
}
