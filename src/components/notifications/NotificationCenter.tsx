import { Bell, Check, Filter, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const categoryLabels: Record<string, string> = {
  learning: 'Aprendizado',
  community: 'Comunidade',
  networking: 'Networking',
  solutions: 'Soluções',
  admin: 'Sistema',
  general: 'Geral'
};

const categoryColors: Record<string, string> = {
  learning: 'bg-operational/10 text-operational',
  community: 'bg-system-healthy/10 text-system-healthy',
  networking: 'bg-strategy/10 text-strategy',
  solutions: 'bg-status-warning/10 text-status-warning',
  admin: 'bg-status-error/10 text-status-error',
  general: 'bg-muted/10 text-muted-foreground'
};

export const NotificationCenter = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [filter, setFilter] = useState<string>('all');
  const [open, setOpen] = useState(false);

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.is_read;
    return n.category === filter;
  });

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    
    if (notification.action_url) {
      window.location.href = notification.action_url;
      setOpen(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Notificações</SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllAsRead()}
                className="text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2 pt-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <Filter className="h-3 w-3 mr-2" />
                  {filter === 'all' ? 'Todas' : filter === 'unread' ? 'Não lidas' : categoryLabels[filter]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  Todas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('unread')}>
                  Não lidas
                </DropdownMenuItem>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <DropdownMenuItem key={key} onClick={() => setFilter(key)}>
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-140px)] mt-4">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "group relative p-4 rounded-lg border transition-colors cursor-pointer hover:bg-accent",
                    !notification.is_read && "bg-primary/5 border-primary/20"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-xs",
                            categoryColors[notification.category || 'general']
                          )}
                        >
                          {categoryLabels[notification.category || 'general']}
                        </Badge>
                        {!notification.is_read && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      
                      <h4 className="font-medium text-sm mb-1 line-clamp-1">
                        {notification.title}
                      </h4>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {notification.message}
                      </p>
                      
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {notification.priority && notification.priority >= 8 && (
                    <div className="absolute top-2 left-2 h-1 w-1 rounded-full bg-status-error" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
