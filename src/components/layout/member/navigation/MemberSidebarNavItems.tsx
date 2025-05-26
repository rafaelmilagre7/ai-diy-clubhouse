
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Lightbulb, 
  Wrench, 
  Calendar,
  MessageSquare,
  Settings,
  Activity,
  Database
} from 'lucide-react';
import { MemberSidebarNavItem } from './MemberSidebarNavItem';

interface MemberSidebarNavItemsProps {
  sidebarOpen: boolean;
}

export const MemberSidebarNavItems: React.FC<MemberSidebarNavItemsProps> = ({ sidebarOpen }) => {
  return (
    <>
      {/* Dashboard */}
      <MemberSidebarNavItem
        to="/dashboard"
        icon={LayoutDashboard}
        label="Dashboard"
        sidebarOpen={sidebarOpen}
      />

      {/* Comunidade */}
      <MemberSidebarNavItem
        to="/comunidade"
        icon={Users}
        label="Comunidade"
        sidebarOpen={sidebarOpen}
      />

      {/* Learning / Formação */}
      <MemberSidebarNavItem
        to="/learning"
        icon={BookOpen}
        label="Aprendizado"
        sidebarOpen={sidebarOpen}
      />

      {/* Solutions */}
      <MemberSidebarNavItem
        to="/solutions"
        icon={Lightbulb}
        label="Soluções"
        sidebarOpen={sidebarOpen}
      />

      {/* Tools */}
      <MemberSidebarNavItem
        to="/tools"
        icon={Wrench}
        label="Ferramentas"
        sidebarOpen={sidebarOpen}
      />

      {/* Events */}
      <MemberSidebarNavItem
        to="/events"
        icon={Calendar}
        label="Eventos"
        sidebarOpen={sidebarOpen}
      />

      {/* Messages */}
      <MemberSidebarNavItem
        to="/messages"
        icon={MessageSquare}
        label="Mensagens"
        sidebarOpen={sidebarOpen}
      />

      {/* Implementation Trail */}
      <MemberSidebarNavItem
        to="/implementation-trail"
        icon={Activity}
        label="Trilha de Implementação"
        sidebarOpen={sidebarOpen}
      />

      {/* Diagnostics - Admin only */}
      <MemberSidebarNavItem
        to="/admin/diagnostics"
        icon={Database}
        label="Diagnóstico Supabase"
        sidebarOpen={sidebarOpen}
        adminOnly={true}
      />

      {/* Settings */}
      <MemberSidebarNavItem
        to="/settings"
        icon={Settings}
        label="Configurações"
        sidebarOpen={sidebarOpen}
      />
    </>
  );
};
