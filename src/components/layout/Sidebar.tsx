
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Zap, 
  Wrench, 
  BookOpen, 
  Users, 
  Calendar,
  Gift,
  MessageSquare,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Soluções',
      href: '/solutions',
      icon: Zap,
    },
    {
      title: 'Ferramentas',
      href: '/tools',
      icon: Wrench,
    },
    {
      title: 'Aprendizado',
      href: '/learning',
      icon: BookOpen,
    },
    {
      title: 'Comunidade',
      href: '/comunidade',
      icon: Users,
    },
    {
      title: 'Eventos',
      href: '/events',
      icon: Calendar,
    },
    {
      title: 'Benefícios',
      href: '/benefits',
      icon: Gift,
    },
    {
      title: 'Sugestões',
      href: '/suggestions',
      icon: MessageSquare,
    },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-viverblue">VIVER DE IA</h1>
      </div>
      
      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm',
                isActive || location.pathname === item.href
                  ? 'bg-viverblue text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.title}
          </NavLink>
        ))}
      </nav>

      <div className="mt-8 pt-8 border-t border-gray-700">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm',
              isActive
                ? 'bg-viverblue text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            )
          }
        >
          <User className="h-5 w-5" />
          Perfil
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
