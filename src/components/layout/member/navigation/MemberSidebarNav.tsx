
import React from 'react';
import { MemberSidebarNavItems } from './MemberSidebarNavItems';

interface MemberSidebarNavProps {
  sidebarOpen: boolean;
}

export const MemberSidebarNav: React.FC<MemberSidebarNavProps> = ({ sidebarOpen }) => {
  return (
    <nav className="flex-1 px-3 py-4">
      <div className="space-y-1">
        <MemberSidebarNavItems sidebarOpen={sidebarOpen} />
      </div>
    </nav>
  );
};
