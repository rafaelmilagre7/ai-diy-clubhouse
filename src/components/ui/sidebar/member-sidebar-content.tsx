
import React from 'react';
import { LogOut, User, Home, BookOpen, Wrench, Users, Calendar, MessageSquare, Lightbulb, HelpCircle, Award, Settings, Shield, BarChart3, UserPlus, Mail } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { cn } from '@/lib/utils';

interface MemberSidebarContentProps {
  onSignOut: () => void;
}

export const MemberSidebarContent: React.FC<MemberSidebarContentProps> = ({ onSignOut }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useSimpleAuth();

  const isAdmin = profile?.user_roles?.name === 'admin';
  const isFormacao = profile?.user_roles?.name === 'formacao';

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpen, label: 'Aprendizado', path: '/learning' },
    { icon: Lightbulb, label: 'Soluções', path: '/solutions' },
    { icon: Wrench, label: 'Ferramentas', path: '/tools' },
    { icon: MessageSquare, label: 'Comunidade', path: '/comunidade' },
    { icon: Calendar, label: 'Eventos', path: '/events' },
    { icon: HelpCircle, label: 'Sugestões', path: '/suggestions' },
    { icon: Award, label: 'Benefícios', path: '/benefits' },
  ];

  const formacaoItems = [
    { icon: BookOpen, label: 'Área Formação', path: '/formacao' },
  ];

  const adminItems = [
    { icon: Shield, label: 'Painel Admin', path: '/admin' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: Users, label: 'Usuários', path: '/admin/users' },
    { icon: UserPlus, label: 'Convites', path: '/admin/invites' },
    { icon: Mail, label: 'Comunicações', path: '/admin/communications' },
    { icon: Lightbulb, label: 'Gerenciar Soluções', path: '/admin/solutions' },
    { icon: Wrench, label: 'Gerenciar Ferramentas', path: '/admin/tools' },
  ];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const renderMenuItem = (item: any, section?: string) => (
    <li key={item.path}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start text-white hover:bg-white/10 transition-colors",
          isActive(item.path) && "bg-white/10 text-viverblue"
        )}
        onClick={() => navigate(item.path)}
      >
        <item.icon className="mr-3 h-4 w-4" />
        {item.label}
      </Button>
    </li>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <h2 className="text-xl font-bold text-white">Viver de IA</h2>
        <p className="text-sm text-neutral-400 mt-1">
          Olá, {profile?.name?.split(' ')[0] || 'Membro'}!
        </p>
      </div>
      
      <nav className="flex-1 px-4 space-y-6">
        {/* Menu Principal */}
        <div>
          <ul className="space-y-2">
            {menuItems.map(item => renderMenuItem(item))}
          </ul>
        </div>

        {/* Menu Formação */}
        {isFormacao && (
          <div>
            <div className="px-2 py-2 mb-2">
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Formação
              </h3>
            </div>
            <ul className="space-y-2">
              {formacaoItems.map(item => renderMenuItem(item, 'formacao'))}
            </ul>
          </div>
        )}

        {/* Menu Admin */}
        {isAdmin && (
          <div>
            <div className="px-2 py-2 mb-2">
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Administração
              </h3>
            </div>
            <ul className="space-y-2">
              {adminItems.map(item => renderMenuItem(item, 'admin'))}
            </ul>
          </div>
        )}

        {/* Configurações */}
        <div>
          <div className="px-2 py-2 mb-2">
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Configurações
            </h3>
          </div>
          <ul className="space-y-2">
            {renderMenuItem({ icon: Settings, label: 'Perfil', path: '/profile' })}
          </ul>
        </div>
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
