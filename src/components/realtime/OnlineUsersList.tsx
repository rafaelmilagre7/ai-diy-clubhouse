import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { usePresence } from '@/hooks/realtime/usePresence';
import { ScrollArea } from '@/components/ui/scroll-area';
import { OnlineIndicator } from './OnlineIndicator';
import { Users } from 'lucide-react';

export function OnlineUsersList() {
  const { getOnlineUsersList, getOnlineCount } = usePresence();
  
  const onlineUsers = getOnlineUsersList();
  const count = getOnlineCount();

  if (count === 0) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="w-4 h-4" />
          <span className="text-sm">Nenhum usuário online no momento</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Quem está online</h3>
          </div>
          <Badge variant="secondary" className="gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {count} {count === 1 ? 'pessoa' : 'pessoas'}
          </Badge>
        </div>

        {/* Lista de usuários */}
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-2">
            {onlineUsers.map((presence, index) => (
              <div
                key={`${presence.user_id}-${index}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={presence.user_info?.avatar_url} />
                    <AvatarFallback>
                      {presence.user_info?.full_name?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <OnlineIndicator
                    userId={presence.user_id}
                    size="sm"
                    className="absolute bottom-0 right-0"
                    showTooltip={false}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {presence.user_info?.full_name || 'Usuário'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Online agora
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
}
