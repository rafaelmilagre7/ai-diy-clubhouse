
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ConnectionNotificationsDropdown } from '@/components/community/notifications/ConnectionNotificationsDropdown';
import { 
  LayoutDashboard, 
  BookOpen, 
  Lightbulb, 
  Wrench, 
  User, 
  Gift,
  Calendar,
  MessageSquare,
  Users,
  UserPlus,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Map,
  GraduationCap
} from 'lucide-react';

interface MemberSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  profileName: string | null;
  profileEmail: string | null;
  profileAvatar?: string | null;
  getInitials: (name: string | null) => string;
  signOut: () => void;
}

export const MemberSidebar: React.FC<MemberSidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  profileName,
  profileEmail,
  profileAvatar,
  getInitials,
  signOut
}) => {
  const location = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      exact: true
    },
    {
      name: 'Onboarding',
      href: '/onboarding',
      icon: BookOpen
    },
    {
      name: 'Trilha de Implementação',
      href: '/implementation-trail',
      icon: Map
    },
    {
      name: 'Aprendizado',
      href: '/learning',
      icon: GraduationCap
    },
    {
      name: 'Soluções',
      href: '/solutions',
      icon: Lightbulb
    },
    {
      name: 'Ferramentas',
      href: '/tools',
      icon: Wrench
    },
    {
      name: 'Benefícios',
      href: '/benefits',
      icon: Gift
    },
    {
      name: 'Eventos',
      href: '/events',
      icon: Calendar
    }
  ];

  const communityNavigation = [
    {
      name: 'Fórum',
      href: '/comunidade',
      icon: MessageSquare,
      exact: true
    },
    {
      name: 'Membros',
      href: '/comunidade/membros',
      icon: Users
    },
    {
      name: 'Conexões',
      href: '/comunidade/conexoes',
      icon: UserPlus
    }
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path) && location.pathname !== '/comunidade';
  };

  return (
    <>
      {/* Sidebar para desktop e mobile */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-[#1A1E2E] border-r border-[#2A2E42] transition-all duration-300 ease-in-out",
        sidebarOpen ? "w-64" : "w-16"
      )}>
        
        {/* Header da sidebar */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-[#2A2E42]">
          {sidebarOpen && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/60 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-white font-semibold">Viver de IA</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            {sidebarOpen && <ConnectionNotificationsDropdown />}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white hover:bg-[#2A2E42]"
            >
              {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Navegação principal */}
        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="space-y-2">
            {/* Navegação principal */}
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(item.href, item.exact)
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-300 hover:bg-[#2A2E42] hover:text-white"
                )}
                title={!sidebarOpen ? item.name : undefined}
              >
                <item.icon className={cn("h-4 w-4", sidebarOpen ? "mr-3" : "")} />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            ))}

            {/* Separador */}
            <div className="my-4 border-t border-[#2A2E42]" />
            
            {/* Seção Comunidade */}
            {sidebarOpen && (
              <div className="px-3 py-2">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Comunidade
                </h3>
              </div>
            )}
            
            {communityNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(item.href, item.exact)
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-300 hover:bg-[#2A2E42] hover:text-white"
                )}
                title={!sidebarOpen ? item.name : undefined}
              >
                <item.icon className={cn("h-4 w-4", sidebarOpen ? "mr-3" : "")} />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            ))}
          </nav>
        </ScrollArea>

        {/* Perfil do usuário */}
        <div className="border-t border-[#2A2E42] p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profileAvatar || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {getInitials(profileName)}
              </AvatarFallback>
            </Avatar>
            
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {profileName || 'Usuário'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {profileEmail}
                </p>
              </div>
            )}
          </div>
          
          {sidebarOpen && (
            <div className="mt-3 space-y-1">
              <Link
                to="/profile"
                className="flex items-center rounded-lg px-2 py-1.5 text-sm text-gray-300 hover:bg-[#2A2E42] hover:text-white transition-colors"
              >
                <User className="h-4 w-4 mr-2" />
                Perfil
              </Link>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="w-full justify-start text-gray-300 hover:bg-[#2A2E42] hover:text-white h-auto py-1.5 px-2"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
