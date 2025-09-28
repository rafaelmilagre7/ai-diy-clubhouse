import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface MasterContentProps {
  children: React.ReactNode;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const MasterContent: React.FC<MasterContentProps> = ({ 
  children, 
  sidebarOpen, 
  setSidebarOpen 
}) => {
  return (
    <div className={cn(
      "flex-1 flex flex-col min-h-screen transition-all duration-300",
      sidebarOpen ? "md:ml-0" : "md:ml-0"
    )}>
      {/* Header mobile */}
      <header className="md:hidden flex items-center justify-between p-4 border-b bg-background">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="font-semibold">Dashboard Master</h1>
        <div></div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-6 bg-muted/10">
        {children}
      </main>
    </div>
  );
};