import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  icon: string;
}

interface TabsNavigationProps {
  tabs: Tab[];
  activeTab: string;
  completedTabs: string[];
  onTabChange: (tabId: string) => void;
}

const TabsNavigation: React.FC<TabsNavigationProps> = ({
  tabs,
  activeTab,
  completedTabs,
  onTabChange
}) => {
  return (
    <div className="relative bg-gradient-to-br from-card/40 via-card/20 to-transparent backdrop-blur-md rounded-2xl p-4 border-0 shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent rounded-2xl"></div>
      <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const isCompleted = completedTabs.includes(tab.id);
          const isAccessible = true; // Permitir navegação livre entre guias
          
          return (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              onClick={() => isAccessible && onTabChange(tab.id)}
              disabled={!isAccessible}
              className={cn(
                "relative h-auto p-4 flex flex-col items-center gap-2 transition-all duration-300 rounded-xl border-0",
                isActive && "bg-gradient-to-br from-primary to-secondary text-white shadow-lg scale-105",
                isCompleted && !isActive && "bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20",
                !isCompleted && !isActive && "hover:bg-gradient-to-br hover:from-primary/5 hover:to-secondary/5",
                !isAccessible && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="relative">
                <span className="text-lg">{tab.icon}</span>
                {isCompleted && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-sm">
                    <Check className="w-2 h-2 text-white" />
                  </div>
                )}
              </div>
              <span className="text-xs font-medium text-center leading-tight">
                {tab.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default TabsNavigation;