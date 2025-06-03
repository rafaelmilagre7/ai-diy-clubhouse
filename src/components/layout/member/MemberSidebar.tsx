
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
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        <SidebarLogo sidebarOpen={sidebarOpen} />
        
        <div className="flex-1 overflow-y-auto py-4">
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

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 bg-[#0F111A] border-r border-gray-700 transition-transform duration-300 ease-in-out md:hidden",
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
        
        <div className="flex-1 overflow-y-auto py-4">
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
        className="fixed top-4 left-4 z-40 md:hidden bg-[#0F111A]/90 backdrop-blur-sm border border-gray-700 text-white hover:bg-gray-800"
      >
        <Menu size={20} />
      </Button>

      {/* Desktop Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={cn(
          "fixed top-4 z-30 hidden md:flex bg-[#0F111A]/90 backdrop-blur-sm border border-gray-700 text-white hover:bg-gray-800",
          sidebarOpen ? "left-[248px]" : "left-[48px]"
        )}
      >
        <Menu size={16} />
      </Button>
    </>
  );
};
