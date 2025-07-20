
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
      {/* Background with glassmorphism */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl"></div>
      
      {/* Subtle dots pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none rounded-2xl">
        <div className="absolute inset-0 rounded-2xl" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
          backgroundSize: '15px 15px'
        }} />
      </div>
      
      <TabsList className="relative w-full grid grid-cols-3 md:grid-cols-6 p-2 bg-transparent border-0 h-auto gap-1">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className={cn(
              "relative flex flex-col items-center gap-1 py-3 px-2 transition-all duration-300 rounded-xl border-0 h-auto min-h-[60px]",
              "data-[state=active]:bg-gradient-to-br data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20",
              "data-[state=active]:border data-[state=active]:border-cyan-500/30",
              "data-[state=active]:text-white data-[state=active]:font-medium",
              "data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/10",
              "data-[state=inactive]:text-neutral-400 data-[state=inactive]:hover:text-white data-[state=inactive]:hover:bg-white/5",
              "group"
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            {/* Icon with glow effect when active */}
            <div className={cn(
              "transition-all duration-300",
              activeTab === tab.id ? "text-cyan-400 drop-shadow-sm" : "text-neutral-400"
            )}>
              {tab.icon}
            </div>
            
            {/* Label */}
            <span className="text-xs font-medium leading-none">
              {tab.label}
            </span>
            
            {/* Active indicator with gradient */}
            {activeTab === tab.id && (
              <motion.div
                className="absolute -bottom-0.5 left-2 right-2 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                layoutId="activeTabIndicator" 
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            
            {/* Subtle glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
};
