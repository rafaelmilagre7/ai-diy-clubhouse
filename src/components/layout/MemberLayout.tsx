
import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface MemberLayoutProps {
  children: ReactNode;
}

const MemberLayout: React.FC<MemberLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MemberLayout;
