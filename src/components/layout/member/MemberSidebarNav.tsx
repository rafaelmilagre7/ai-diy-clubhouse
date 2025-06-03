
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Users, 
  BookOpen, 
  Wrench, 
  Target, 
  User,
  MessageCircle,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MemberSidebarNavProps {
  sidebarOpen: boolean;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Comunidade',
    href: '/comunidade',
    icon: MessageCircle,
  },
  {
    name: 'Aprendizado',
    href: '/learning',
    icon: BookOpen,
  },
  {
    name: 'Soluções',
    href: '/solutions',
    icon: Star,
  },
  {
    name: 'Ferramentas',
    href: '/tools',
    icon: Wrench,
  },
  {
    name: 'Trilha',
    href: '/implementation-trail',
    icon: Target,
  },
  {
    name: 'Networking',
    href: '/networking',
    icon: Users,
  },
  {
    name: 'Perfil',
    href: '/profile',
    icon: User,
  },
];

export const MemberSidebarNav: React.FC<MemberSidebarNavProps> = ({ sidebarOpen }) => {
  const location = useLocation();

  return (
    <nav className="space-y-1 px-3">
      {navigationItems.map((item) => {
        const isActive = location.pathname === item.href || 
                        location.pathname.startsWith(item.href + '/');
        
        return (
          <Link key={item.name} to={item.href}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-11 px-3",
                "text-gray-300 hover:text-white hover:bg-gray-800/50",
                isActive && "bg-viverblue/20 text-viverblue hover:bg-viverblue/30",
                !sidebarOpen && "justify-center px-0"
              )}
            >
              <item.icon size={20} className="shrink-0" />
              {sidebarOpen && (
                <span className="text-sm font-medium">{item.name}</span>
              )}
            </Button>
          </Link>
        );
      })}
    </nav>
  );
};
