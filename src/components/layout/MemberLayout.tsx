
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { Sidebar } from '@/components/ui/sidebar/sidebar';
import { SidebarProvider } from '@/components/ui/sidebar/provider';
import { MemberSidebarContent } from '@/components/ui/sidebar/member-sidebar-content';
import LoadingScreen from '@/components/common/LoadingScreen';

export const MemberLayout = () => {
  const { user, isLoading, signOut } = useSimpleAuth();

  const handleSignOut = async () => {
    try {
      const result = await signOut();
      if (result.success) {
        // Redirect will happen automatically due to auth state change
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Carregando área do membro..." />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-[#0F111A] to-[#151823]">
        <Sidebar className="border-r border-white/10">
          <MemberSidebarContent onSignOut={handleSignOut} />
        </Sidebar>
        
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};
