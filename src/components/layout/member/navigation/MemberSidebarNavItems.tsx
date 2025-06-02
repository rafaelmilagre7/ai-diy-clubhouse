
import React from 'react';
import { MemberSidebarNavItem } from './MemberSidebarNavItem';
import {
  LayoutDashboard,
  Lightbulb,
  Route,
  Wrench,
  Gift,
  MessageSquare,
  GraduationCap,
  Users,
  Calendar,
  User,
  Shield
} from 'lucide-react';

interface MemberSidebarNavItemsProps {
  sidebarOpen: boolean;
}

export const MemberSidebarNavItems: React.FC<MemberSidebarNavItemsProps> = ({ sidebarOpen }) => {
  return (
    <>
      <MemberSidebarNavItem
        to="/dashboard"
        icon={LayoutDashboard}
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
        to="/implementation-trail"
        icon={Route}
        label="Trilha de Implementação"
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
        to="/comunidade"
        icon={MessageSquare}
        label="Comunidade"
        sidebarOpen={sidebarOpen}
      />
      <MemberSidebarNavItem
        to="/learning"
        icon={GraduationCap}
        label="Aprendizado"
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
        to="/suggestions"
        icon={Lightbulb}
        label="Sugestões"
        sidebarOpen={sidebarOpen}
      />
      <MemberSidebarNavItem
        to="/profile"
        icon={User}
        label="Perfil"
        sidebarOpen={sidebarOpen}
      />
      <MemberSidebarNavItem
        to="/admin"
        icon={Shield}
        label="Admin"
        sidebarOpen={sidebarOpen}
        adminOnly={true}
      />
    </>
  );
};
