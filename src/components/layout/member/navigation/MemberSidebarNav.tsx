
import React from 'react';
import { MemberSidebarNavItems } from './MemberSidebarNavItems';

interface MemberSidebarNavProps {
  sidebarOpen: boolean;
}

export const MemberSidebarNav: React.FC<MemberSidebarNavProps> = ({ sidebarOpen }) => {
  return (
    <nav className="flex-1 overflow-hidden">
      <MemberSidebarNavItems sidebarOpen={sidebarOpen} />
    </nav>
  );
};
