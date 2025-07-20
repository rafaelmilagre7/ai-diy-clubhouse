
import React from 'react';
import { 
  Home, 
  Lightbulb, 
  Wrench, 
  User, 
  Award, 
  Calendar,
  Users,
  BookOpen,
  Settings,
  MessageSquare
} from 'lucide-react';
import { MemberSidebarNavItem } from './MemberSidebarNavItem';

interface MemberSidebarNavItemsProps {
  sidebarOpen: boolean;
}

export const MemberSidebarNavItems: React.FC<MemberSidebarNavItemsProps> = ({ sidebarOpen }) => {
  return (
    <div className="space-y-2 px-3">
      <MemberSidebarNavItem
        to="/dashboard"
        icon={Home}
        label="Dashboard"
        sidebarOpen={sidebarOpen}
      />
      
      <MemberSidebarNavItem
        to="/solutions"
        icon={Lightbulb}
        label="Soluções"
        sidebarOpen={sidebarOpen}
      />
      
      <MemberSidebarNavItem
        to="/tools"
        icon={Wrench}
        label="Ferramentas"
        sidebarOpen={sidebarOpen}
      />
      
      <MemberSidebarNavItem
        to="/learning"
        icon={BookOpen}
        label="Aprendizado"
        sidebarOpen={sidebarOpen}
      />
      
      <MemberSidebarNavItem
        to="/comunidade"
        icon={MessageSquare}
        label="Comunidade"
        sidebarOpen={sidebarOpen}
      />
      
      <MemberSidebarNavItem
        to="/networking"
        icon={Users}
        label="Networking"
        sidebarOpen={sidebarOpen}
      />
      
      <MemberSidebarNavItem
        to="/events"
        icon={Calendar}
        label="Eventos"
        sidebarOpen={sidebarOpen}
      />
      
      <MemberSidebarNavItem
        to="/benefits"
        icon={Award}
        label="Benefícios"
        sidebarOpen={sidebarOpen}
      />
      
      <MemberSidebarNavItem
        to="/profile"
        icon={User}
        label="Perfil"
        sidebarOpen={sidebarOpen}
      />
      
      <MemberSidebarNavItem
        to="/profile/notifications"
        icon={Settings}
        label="Configurações"
        sidebarOpen={sidebarOpen}
        adminOnly={false}
      />
    </div>
  );
};
