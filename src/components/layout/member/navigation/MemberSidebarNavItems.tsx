
import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Wrench, 
  User, 
  Gift, 
  Calendar,
  MessageSquare,
  GraduationCap,
  Award
} from 'lucide-react';
import { MemberSidebarNavItem } from './MemberSidebarNavItem';

interface MemberSidebarNavItemsProps {
  sidebarOpen: boolean;
}

export const MemberSidebarNavItems: React.FC<MemberSidebarNavItemsProps> = ({ sidebarOpen }) => {
  return (
    <div className="space-y-1 px-3">
      <MemberSidebarNavItem
        to="/dashboard"
        icon={LayoutDashboard}
        label="Dashboard"
        sidebarOpen={sidebarOpen}
      />
      
      <MemberSidebarNavItem
        to="/learning"
        icon={GraduationCap}
        label="Cursos de IA"
        sidebarOpen={sidebarOpen}
      />
      
      <MemberSidebarNavItem
        to="/learning/certificates"
        icon={Award}
        label="Certificados"
        sidebarOpen={sidebarOpen}
      />
      
      <MemberSidebarNavItem
        to="/solutions"
        icon={BookOpen}
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
        to="/benefits"
        icon={Gift}
        label="Benefícios"
        sidebarOpen={sidebarOpen}
      />
      
      <MemberSidebarNavItem
        to="/events"
        icon={Calendar}
        label="Eventos"
        sidebarOpen={sidebarOpen}
      />
      
      <MemberSidebarNavItem
        to="/suggestions"
        icon={MessageSquare}
        label="Sugestões"
        sidebarOpen={sidebarOpen}
      />
      
      <MemberSidebarNavItem
        to="/profile"
        icon={User}
        label="Perfil"
        sidebarOpen={sidebarOpen}
      />
    </div>
  );
};
