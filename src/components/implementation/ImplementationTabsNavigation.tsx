
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Wrench, Play, FileText, CheckSquare, MessageSquare, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ImplementationTabsNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const ImplementationTabsNavigation = ({
  activeTab,
  setActiveTab
}: ImplementationTabsNavigationProps) => {
  const tabs = [
    { id: 'tools', label: 'Ferramentas', icon: <Wrench className="h-4 w-4" /> },
    { id: 'materials', label: 'Materiais', icon: <FileText className="h-4 w-4" /> },
    { id: 'videos', label: 'Vídeos', icon: <Play className="h-4 w-4" /> },
    { id: 'checklist', label: 'Checklist', icon: <CheckSquare className="h-4 w-4" /> },
    { id: 'comments', label: 'Comentários', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'complete', label: 'Concluir', icon: <CheckCircle className="h-4 w-4" /> },
  ];

  return (
    <div className="relative mb-6">
      {/* Background with enhanced glassmorphism */}
      <div className="absolute inset-0 bg-white/8 backdrop-blur-md border border-white/15 rounded-2xl shadow-2xl"></div>
      
      {/* Subtle dots pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-2xl">
        <div className="absolute inset-0 rounded-2xl" style={{
          backgroundImage: 'var(--pattern-dots-strong)',
          backgroundSize: '12px 12px'
        }} />
      </div>
      
      {/* Subtle inner glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-aurora-primary/5 via-transparent to-aurora-primary-dark/5 rounded-2xl"></div>
      
      <TabsList className="relative w-full grid grid-cols-3 md:grid-cols-6 p-3 bg-transparent border-0 h-auto gap-2">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className={cn(
              "relative flex flex-col items-center gap-2 py-4 px-3 transition-all duration-300 rounded-xl border-0 h-auto min-h-[70px]",
              "data-[state=active]:bg-gradient-to-br data-[state=active]:from-aurora-primary/20 data-[state=active]:to-aurora-primary-dark/25",
              "data-[state=active]:border data-[state=active]:border-aurora-primary/40",
              "data-[state=active]:text-white data-[state=active]:font-semibold",
              "data-[state=active]:shadow-lg data-[state=active]:shadow-aurora-primary/15",
              "data-[state=inactive]:text-neutral-400 data-[state=inactive]:hover:text-neutral-200 data-[state=inactive]:hover:bg-white/8",
              "group backdrop-blur-sm"
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            {/* Icon with enhanced glow effect when active */}
            <div className={cn(
              "transition-all duration-300 relative",
              activeTab === tab.id ? "text-aurora-primary-light [filter:drop-shadow(var(--shadow-glow-tab))]" : "text-neutral-400 group-hover:text-neutral-300"
            )}>
              {tab.icon}
              {/* Icon glow effect */}
              {activeTab === tab.id && (
                <div className="absolute inset-0 text-aurora-primary-light blur-sm opacity-50">
                  {tab.icon}
                </div>
              )}
            </div>
            
            {/* Label with better typography */}
            <span className={cn(
              "text-xs font-medium leading-none transition-all duration-300",
              activeTab === tab.id ? "text-white" : "text-neutral-400 group-hover:text-neutral-300"
            )}>
              {tab.label}
            </span>
            
            {/* Enhanced active indicator */}
            {activeTab === tab.id && (
              <motion.div
                className="absolute -bottom-1 left-3 right-3 h-1 bg-gradient-to-r from-aurora-primary via-aurora-primary-light to-aurora-primary-dark rounded-full shadow-lg shadow-aurora-primary/30"
                layoutId="activeTabIndicator" 
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            
            {/* Enhanced hover glow effect */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br rounded-xl opacity-0 transition-opacity duration-300",
              activeTab === tab.id 
                ? "from-aurora-primary/10 to-aurora-primary-dark/10 opacity-100" 
                : "from-aurora-primary/5 to-aurora-primary-dark/5 group-hover:opacity-100"
            )}></div>
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
};
