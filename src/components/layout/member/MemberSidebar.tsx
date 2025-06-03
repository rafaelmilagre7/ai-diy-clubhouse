
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BaseSidebarProps } from '../BaseLayout';
import { SidebarLogo } from './SidebarLogo';
import { MemberSidebarNav } from './MemberSidebarNav';
import { MemberSidebarProfile } from './MemberSidebarProfile';

export const MemberSidebar: React.FC<BaseSidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  profileName,
  profileEmail,
  profileAvatar,
  getInitials
}) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-30 h-full bg-[#0F111A] border-r border-gray-700 transition-all duration-300 ease-in-out",
          "hidden md:flex md:flex-col",
          sidebarOpen ? "w-64" : "w-[70px]"
        )}
      >
        <SidebarLogo sidebarOpen={sidebarOpen} />
        
        <div className="flex-1 overflow-y-auto">
          <MemberSidebarNav sidebarOpen={sidebarOpen} />
        </div>
        
        <MemberSidebarProfile
          sidebarOpen={sidebarOpen}
          profileName={profileName}
          profileEmail={profileEmail}
          profileAvatar={profileAvatar}
          getInitials={getInitials}
        />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-64 bg-[#0F111A] border-r border-gray-700 transition-all duration-300 ease-in-out md:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <SidebarLogo sidebarOpen={true} />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <MemberSidebarNav sidebarOpen={true} />
        </div>
        
        <MemberSidebarProfile
          sidebarOpen={true}
          profileName={profileName}
          profileEmail={profileEmail}
          profileAvatar={profileAvatar}
          getInitials={getInitials}
        />
      </aside>

      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-[#0F111A]/80 backdrop-blur-sm border border-gray-700 text-white hover:bg-gray-800"
      >
        <Menu size={20} />
      </Button>
    </>
  );
};
