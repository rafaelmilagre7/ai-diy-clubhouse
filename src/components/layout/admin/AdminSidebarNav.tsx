import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  UsersRound, 
  Settings, 
  Wrench,
  FileText,
  BarChart2,
  MessageSquare
} from 'lucide-react';

interface AdminSidebarNavProps {
  expanded: boolean;
}

export const AdminSidebarNav = ({ expanded }: AdminSidebarNavProps) => {
  const navItems = [
    {
      name: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      path: '/admin/dashboard',
    },
    {
      name: 'Ferramentas',
      icon: <Wrench size={20} />,
      path: '/admin/tools',
    },
    {
      name: 'Sugestões',
      icon: <MessageSquare size={20} />,
      path: '/admin/suggestions',
    },
    {
      name: 'Usuários',
      icon: <UsersRound size={20} />,
      path: '/admin/users',
    },
    {
      name: 'Soluções',
      icon: <FileText size={20} />,
      path: '/admin/solutions',
    },
    {
      name: 'Analytics',
      icon: <BarChart2 size={20} />,
      path: '/admin/analytics',
    },
    {
      name: 'Configurações',
      icon: <Settings size={20} />,
      path: '/admin/settings',
    },
  ];

  return (
    <nav>
      <ul className="space-y-2">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center p-2 rounded-lg transition-colors',
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                )
              }
            >
              <span className="flex items-center justify-center w-8">{item.icon}</span>
              {expanded && <span className="ml-3 text-sm font-medium">{item.name}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
