import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSimplePresence } from '@/hooks/realtime/useSimplePresence';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Lista de usuários online
 * Fase 2: Componente para mostrar quem está online
 */
export function OnlineUsersList() {
  const { getOnlineUsersList, getOnlineCount, isConnected } = useSimplePresence();
  const onlineUsers = getOnlineUsersList();
  const count = getOnlineCount();

  if (!isConnected) {
    return (
      <div className="text-sm text-muted-foreground p-4">
        Conectando ao sistema de presença...
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="text-sm text-muted-foreground p-4">
        Nenhum usuário online no momento
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-4 pt-4">
        <div className="w-2 h-2 bg-system-healthy rounded-full animate-pulse" />
        <span className="text-sm font-medium">
          {count} {count === 1 ? 'pessoa' : 'pessoas'} online
        </span>
      </div>

      <ScrollArea className="h-[300px] px-4">
        <div className="space-y-2">
          {onlineUsers.map((user) => (
            <div
              key={user.userId}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback>
                    {user.name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-system-healthy rounded-full border-2 border-background" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.name || 'Usuário'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Online {formatDistanceToNow(user.onlineAt, { 
                    addSuffix: true,
                    locale: ptBR 
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
