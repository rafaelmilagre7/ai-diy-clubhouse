
import React from 'react';
import { LogOut, User, Home, BookOpen, Wrench, Users, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface MemberSidebarContentProps {
  onSignOut: () => void;
}

export const MemberSidebarContent: React.FC<MemberSidebarContentProps> = ({ onSignOut }) => {
  const navigate = useNavigate();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpen, label: 'Cursos', path: '/learning' },
    { icon: Wrench, label: 'Ferramentas', path: '/tools' },
    { icon: Users, label: 'Comunidade', path: '/community' },
    { icon: Calendar, label: 'Eventos', path: '/events' },
    { icon: User, label: 'Perfil', path: '/profile' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <h2 className="text-xl font-bold text-white">Viver de IA</h2>
      </div>
      
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-white/10"
                onClick={() => navigate(item.path)}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4">
        <Button
          variant="outline"
          className="w-full border-white/20 text-white hover:bg-white/5"
          onClick={onSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );
};
