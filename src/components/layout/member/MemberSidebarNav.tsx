
import React from 'react';
import { MemberSidebarNavItems } from './navigation/MemberSidebarNavItems';

interface MemberSidebarNavProps {
  sidebarOpen: boolean;
}

export const MemberSidebarNav: React.FC<MemberSidebarNavProps> = ({ sidebarOpen }) => {
  return (
    <nav className="flex-1">
      <MemberSidebarNavItems sidebarOpen={sidebarOpen} />
    </nav>
  );
};
