
import React from 'react';
import { MemberSidebarNavItems } from './navigation/MemberSidebarNavItems';

interface MemberSidebarNavProps {
  sidebarOpen: boolean;
}

export const MemberSidebarNav: React.FC<MemberSidebarNavProps> = ({ sidebarOpen }) => {
  return (
    <nav className="flex-1 px-3 py-4 overflow-y-auto">
      <MemberSidebarNavItems sidebarOpen={sidebarOpen} />
    </nav>
  );
};
