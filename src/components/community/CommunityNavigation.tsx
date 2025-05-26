
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, Lightbulb, Calendar, UserPlus, MessageSquareMore } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NotificationsDropdown } from './notifications/NotificationsDropdown';
import { MessageNotificationsDropdown } from './notifications/MessageNotificationsDropdown';

export const CommunityNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    {
      id: 'forum',
      label: 'Fórum',
      icon: MessageSquare,
      path: '/comunidade',
      exact: true
    },
    {
      id: 'members',
      label: 'Membros',
      icon: Users,
      path: '/comunidade/membros'
    },
    {
      id: 'connections',
      label: 'Conexões',
      icon: UserPlus,
      path: '/comunidade/conexoes'
    },
    {
      id: 'messages',
      label: 'Mensagens',
      icon: MessageSquareMore,
      path: '/comunidade/mensagens'
    },
    {
      id: 'suggestions',
      label: 'Sugestões',
      icon: Lightbulb,
      path: '/comunidade/sugestoes'
    },
    {
      id: 'events',
      label: 'Eventos',
      icon: Calendar,
      path: '/events',
      external: true
    }
  ];

  const isActive = (item: typeof navigationItems[0]) => {
    if (item.external) return false;
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname === item.path;
  };

  const handleNavigation = (item: typeof navigationItems[0]) => {
    console.log('CommunityNavigation: Navegando para', item.path);
    navigate(item.path);
  };

  return (
    <div className="border-b">
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 overflow-x-auto pb-px">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation(item)}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap border-b-2 border-transparent rounded-none",
                isActive(item) && "border-primary text-primary bg-primary/5"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Button>
          ))}
        </div>
        
        <div className="flex items-center space-x-2">
          <MessageNotificationsDropdown />
          <NotificationsDropdown />
        </div>
      </div>
    </div>
  );
};
