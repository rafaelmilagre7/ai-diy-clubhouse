
import React from 'react';
import { MemberSidebarNavItems } from './MemberSidebarNavItems';

interface MemberSidebarNavProps {
  sidebarOpen: boolean;
}

export const MemberSidebarNav: React.FC<MemberSidebarNavProps> = ({ sidebarOpen }) => {
  return (
    <nav className="flex-1 py-2 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-600">
      <MemberSidebarNavItems sidebarOpen={sidebarOpen} />
    </nav>
  );
};
