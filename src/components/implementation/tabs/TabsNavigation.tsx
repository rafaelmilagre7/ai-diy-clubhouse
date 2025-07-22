import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <Card className="p-4 bg-gradient-to-r from-background/60 to-background/40 backdrop-blur-sm border-primary/20">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const isCompleted = completedTabs.includes(tab.id);
          const isAccessible = index === 0 || completedTabs.includes(tabs[index - 1].id);
          
          return (
            <Button
              key={tab.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => isAccessible && onTabChange(tab.id)}
              disabled={!isAccessible}
              className={cn(
                "relative h-auto p-3 flex flex-col items-center gap-2 transition-all duration-300",
                isActive && "bg-primary text-primary-foreground shadow-lg scale-105",
                isCompleted && !isActive && "bg-primary/20 border-primary/40",
                !isAccessible && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="relative">
                <span className="text-lg">{tab.icon}</span>
                {isCompleted && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-2 h-2 text-primary-foreground" />
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
    </Card>
  );
};

export default TabsNavigation;