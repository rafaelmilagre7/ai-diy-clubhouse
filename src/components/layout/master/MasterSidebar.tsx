import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { X, Users, UserPlus, BarChart3, Settings, Home } from 'lucide-react';
import { MasterSidebarNavItem } from './navigation/MasterSidebarNavItem';
import { useAuth } from '@/contexts/auth';

interface MasterSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const MasterSidebar: React.FC<MasterSidebarProps> = ({ 
  sidebarOpen, 
  setSidebarOpen 
}) => {
  const { profile } = useAuth();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-primary-foreground" />
            </div>
            {sidebarOpen && (
              <div>
                <h2 className="font-semibold text-foreground">Equipe</h2>
                <p className="text-xs text-muted-foreground">Dashboard Master</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <MasterSidebarNavItem
            to="/master-dashboard"
            icon={Home}
            label="Visão Geral"
            sidebarOpen={sidebarOpen}
          />
          <MasterSidebarNavItem
            to="/master-dashboard/team"
            icon={Users}
            label="Equipe"
            sidebarOpen={sidebarOpen}
          />
          <MasterSidebarNavItem
            to="/master-dashboard/invites"
            icon={UserPlus}
            label="Convites"
            sidebarOpen={sidebarOpen}
          />
          <MasterSidebarNavItem
            to="/master-dashboard/analytics"
            icon={BarChart3}
            label="Relatórios"
            sidebarOpen={sidebarOpen}
          />
          <MasterSidebarNavItem
            to="/master-dashboard/settings"
            icon={Settings}
            label="Configurações"
            sidebarOpen={sidebarOpen}
          />
        </nav>

        {/* User Info */}
        <div className="p-4 border-t">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">
                {profile?.name?.charAt(0)?.toUpperCase() || 'M'}
              </span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {profile?.name || 'Master User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Master
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};